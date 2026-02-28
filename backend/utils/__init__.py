"""
pAIr v4 — Deployment Stability Utilities
==========================================
Structured logging, retry logic, error boundaries, and health monitoring
for production-grade deployment on Cloud Run / GCP.

Modules
-------
- StructuredLogger: JSON-formatted logging for Cloud Run / GCP Logging
- RetryHandler: Configurable retry with exponential backoff
- ErrorBoundary: Graceful error handling for pipeline stages
- HealthMonitor: System resource and dependency health checks
- RateLimiter: In-memory request rate limiting
"""

from __future__ import annotations

import asyncio
import functools
import json
import logging
import os
import sys
import time
import traceback
from datetime import datetime, timedelta
from typing import Any, Callable, Dict, List, Optional, TypeVar, Union

T = TypeVar("T")


# ═══════════════════════════════════════════════════════════════════════════
# 1. STRUCTURED LOGGING
# ═══════════════════════════════════════════════════════════════════════════

class StructuredFormatter(logging.Formatter):
    """
    Outputs log records as JSON for Cloud Run / GCP Cloud Logging.

    Format:
        {"severity": "INFO", "message": "...", "timestamp": "...", "module": "...", ...}

    Cloud Run automatically parses JSON from stdout and maps 'severity'
    to GCP log severity levels.
    """

    SEVERITY_MAP = {
        "DEBUG": "DEBUG",
        "INFO": "INFO",
        "WARNING": "WARNING",
        "ERROR": "ERROR",
        "CRITICAL": "CRITICAL",
    }

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "severity": self.SEVERITY_MAP.get(record.levelname, "DEFAULT"),
            "message": record.getMessage(),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Add exception info if present
        if record.exc_info and record.exc_info[0]:
            log_entry["exception"] = {
                "type": record.exc_info[0].__name__,
                "message": str(record.exc_info[1]),
                "traceback": traceback.format_exception(*record.exc_info),
            }

        # Add extra fields (e.g., request_id, user_id, latency)
        for key in ("request_id", "user_id", "latency_ms", "stage", "engine"):
            if hasattr(record, key):
                log_entry[key] = getattr(record, key)

        return json.dumps(log_entry, default=str)


def setup_structured_logging(level: str = "INFO") -> logging.Logger:
    """
    Configure structured JSON logging for the application.

    Call once at startup in main.py:
        from utils.stability import setup_structured_logging
        logger = setup_structured_logging()
    """
    logger = logging.getLogger("pAIr")
    logger.setLevel(getattr(logging, level.upper(), logging.INFO))

    # Remove existing handlers
    logger.handlers.clear()

    # Console handler with structured formatter
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(StructuredFormatter())
    logger.addHandler(handler)

    # Propagate to child loggers
    logger.propagate = False

    return logger


# ═══════════════════════════════════════════════════════════════════════════
# 2. RETRY HANDLER
# ═══════════════════════════════════════════════════════════════════════════

class RetryConfig:
    """Configuration for retry behavior."""

    def __init__(
        self,
        max_retries: int = 3,
        initial_delay: float = 1.0,
        backoff_factor: float = 2.0,
        max_delay: float = 30.0,
        retry_exceptions: tuple = (Exception,),
        on_retry: Optional[Callable] = None,
    ):
        self.max_retries = max_retries
        self.initial_delay = initial_delay
        self.backoff_factor = backoff_factor
        self.max_delay = max_delay
        self.retry_exceptions = retry_exceptions
        self.on_retry = on_retry


def retry(config: Optional[RetryConfig] = None):
    """
    Decorator for automatic retry with exponential backoff.

    Usage:
        @retry(RetryConfig(max_retries=3, initial_delay=1.0))
        async def call_gemini_api(...):
            ...
    """
    cfg = config or RetryConfig()

    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            last_exception = None
            delay = cfg.initial_delay

            for attempt in range(1, cfg.max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                except cfg.retry_exceptions as e:
                    last_exception = e
                    if attempt < cfg.max_retries:
                        if cfg.on_retry:
                            cfg.on_retry(attempt, e, delay)
                        await asyncio.sleep(delay)
                        delay = min(delay * cfg.backoff_factor, cfg.max_delay)
                    else:
                        raise

            raise last_exception  # Should not reach here

        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            last_exception = None
            delay = cfg.initial_delay

            for attempt in range(1, cfg.max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except cfg.retry_exceptions as e:
                    last_exception = e
                    if attempt < cfg.max_retries:
                        if cfg.on_retry:
                            cfg.on_retry(attempt, e, delay)
                        time.sleep(delay)
                        delay = min(delay * cfg.backoff_factor, cfg.max_delay)
                    else:
                        raise

            raise last_exception

        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper

    return decorator


# Pre-configured retry for Gemini API calls
GEMINI_RETRY = RetryConfig(
    max_retries=3,
    initial_delay=2.0,
    backoff_factor=2.0,
    max_delay=15.0,
    retry_exceptions=(Exception,),
)


# ═══════════════════════════════════════════════════════════════════════════
# 3. ERROR BOUNDARY
# ═══════════════════════════════════════════════════════════════════════════

class PipelineError:
    """Structured error from a pipeline stage."""

    def __init__(
        self,
        stage: str,
        error: Exception,
        recoverable: bool = True,
        fallback_used: bool = False,
        context: Optional[Dict[str, Any]] = None,
    ):
        self.stage = stage
        self.error_type = type(error).__name__
        self.error_message = str(error)
        self.recoverable = recoverable
        self.fallback_used = fallback_used
        self.context = context or {}
        self.timestamp = datetime.utcnow().isoformat()
        self.traceback_lines = traceback.format_exception(
            type(error), error, error.__traceback__
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "stage": self.stage,
            "error_type": self.error_type,
            "error_message": self.error_message,
            "recoverable": self.recoverable,
            "fallback_used": self.fallback_used,
            "timestamp": self.timestamp,
            "context": self.context,
        }


def error_boundary(
    stage_name: str,
    fallback_value: Any = None,
    logger: Optional[logging.Logger] = None,
):
    """
    Decorator that catches exceptions and returns a fallback value.
    Logs the error with pipeline stage context.

    Usage:
        @error_boundary("scoring", fallback_value={})
        async def run_scoring(data):
            ...
    """
    _logger = logger or logging.getLogger("pAIr")

    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                pe = PipelineError(
                    stage=stage_name,
                    error=e,
                    recoverable=fallback_value is not None,
                    fallback_used=fallback_value is not None,
                )
                _logger.error(
                    f"Pipeline error in {stage_name}: {e}",
                    extra={"stage": stage_name},
                    exc_info=True,
                )
                if fallback_value is not None:
                    return fallback_value
                raise

        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                pe = PipelineError(
                    stage=stage_name,
                    error=e,
                    recoverable=fallback_value is not None,
                    fallback_used=fallback_value is not None,
                )
                _logger.error(
                    f"Pipeline error in {stage_name}: {e}",
                    extra={"stage": stage_name},
                    exc_info=True,
                )
                if fallback_value is not None:
                    return fallback_value
                raise

        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper

    return decorator


# ═══════════════════════════════════════════════════════════════════════════
# 4. HEALTH MONITOR
# ═══════════════════════════════════════════════════════════════════════════

class HealthMonitor:
    """
    Tracks system health metrics for the /api/health endpoint.
    Monitors API latencies, error rates, and dependency status.
    """

    def __init__(self):
        self._start_time = time.time()
        self._request_count = 0
        self._error_count = 0
        self._latencies: List[float] = []  # Keep last 100
        self._dependency_status: Dict[str, bool] = {}

    def record_request(self, latency_ms: float, success: bool = True):
        """Record a request for monitoring."""
        self._request_count += 1
        if not success:
            self._error_count += 1
        self._latencies.append(latency_ms)
        if len(self._latencies) > 100:
            self._latencies = self._latencies[-100:]

    def check_dependency(self, name: str, is_healthy: bool):
        """Update dependency health status."""
        self._dependency_status[name] = is_healthy

    @property
    def uptime_seconds(self) -> float:
        return time.time() - self._start_time

    @property
    def error_rate(self) -> float:
        if self._request_count == 0:
            return 0.0
        return self._error_count / self._request_count

    @property
    def avg_latency_ms(self) -> float:
        if not self._latencies:
            return 0.0
        return sum(self._latencies) / len(self._latencies)

    @property
    def p95_latency_ms(self) -> float:
        if not self._latencies:
            return 0.0
        sorted_lat = sorted(self._latencies)
        idx = int(len(sorted_lat) * 0.95)
        return sorted_lat[min(idx, len(sorted_lat) - 1)]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "uptime_seconds": round(self.uptime_seconds, 0),
            "total_requests": self._request_count,
            "error_rate": round(self.error_rate, 4),
            "avg_latency_ms": round(self.avg_latency_ms, 1),
            "p95_latency_ms": round(self.p95_latency_ms, 1),
            "dependencies": self._dependency_status,
        }


# ═══════════════════════════════════════════════════════════════════════════
# 5. IN-MEMORY RATE LIMITER
# ═══════════════════════════════════════════════════════════════════════════

class RateLimiter:
    """
    Simple in-memory sliding-window rate limiter.

    Usage:
        limiter = RateLimiter(max_requests=30, window_seconds=60)
        if not limiter.allow("user_123"):
            raise HTTPException(429, "Rate limit exceeded")
    """

    def __init__(self, max_requests: int = 30, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: Dict[str, List[float]] = {}

    def allow(self, key: str) -> bool:
        """Check if request is allowed for the given key."""
        now = time.time()
        cutoff = now - self.window_seconds

        if key not in self._requests:
            self._requests[key] = []

        # Prune old entries
        self._requests[key] = [t for t in self._requests[key] if t > cutoff]

        if len(self._requests[key]) >= self.max_requests:
            return False

        self._requests[key].append(now)
        return True

    def remaining(self, key: str) -> int:
        """Get remaining requests for the key."""
        now = time.time()
        cutoff = now - self.window_seconds
        current = [t for t in self._requests.get(key, []) if t > cutoff]
        return max(0, self.max_requests - len(current))

    def cleanup(self):
        """Remove expired entries to prevent memory leaks."""
        now = time.time()
        cutoff = now - self.window_seconds
        keys_to_remove = []
        for key, timestamps in self._requests.items():
            self._requests[key] = [t for t in timestamps if t > cutoff]
            if not self._requests[key]:
                keys_to_remove.append(key)
        for key in keys_to_remove:
            del self._requests[key]


# ═══════════════════════════════════════════════════════════════════════════
# 6. REQUEST CONTEXT
# ═══════════════════════════════════════════════════════════════════════════

class RequestContext:
    """
    Per-request context for tracking request ID, user, and timing.
    Integrates with structured logging.
    """

    def __init__(self, request_id: Optional[str] = None, user_id: Optional[str] = None):
        import uuid as _uuid
        self.request_id = request_id or str(_uuid.uuid4())[:8]
        self.user_id = user_id
        self.start_time = time.time()
        self.stage = "init"
        self._events: List[Dict] = []

    def set_stage(self, stage: str):
        self.stage = stage
        self._events.append({
            "stage": stage,
            "at": time.time() - self.start_time,
        })

    @property
    def elapsed_ms(self) -> float:
        return (time.time() - self.start_time) * 1000

    def to_dict(self) -> Dict[str, Any]:
        return {
            "request_id": self.request_id,
            "user_id": self.user_id,
            "elapsed_ms": round(self.elapsed_ms, 1),
            "current_stage": self.stage,
            "events": self._events,
        }


# ═══════════════════════════════════════════════════════════════════════════
# 7. ENVIRONMENT VALIDATION
# ═══════════════════════════════════════════════════════════════════════════

def validate_environment() -> Dict[str, Any]:
    """
    Validate required environment variables at startup.
    Returns a dict of {var_name: status} for logging.
    """
    required = [
        "OPENROUTER_API_KEY",
    ]
    optional = [
        "FIREBASE_PROJECT_ID",
        "TAVILY_API_KEY",
        "SERPER_API_KEY",
        "PORT",
    ]

    status = {}
    missing_required = []

    for var in required:
        val = os.getenv(var)
        if val:
            status[var] = "OK"
        else:
            status[var] = "MISSING"
            missing_required.append(var)

    for var in optional:
        val = os.getenv(var)
        status[var] = "OK" if val else "NOT_SET (optional)"

    if missing_required:
        logging.getLogger("pAIr").warning(
            f"Missing required env vars: {', '.join(missing_required)}. "
            "Some features may not work correctly."
        )

    return status
