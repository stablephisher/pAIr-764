"""
pAIr v4 — Scalability Infrastructure
=======================================
Abstractions for task queuing, caching, and background processing
to support horizontal scaling on Cloud Run.

Architecture
------------
    ┌─────────────────────────────────────────────────────┐
    │                    Cloud Run                         │
    │  ┌──────┐  ┌──────────┐  ┌─────────┐  ┌─────────┐ │
    │  │ API  │→ │TaskQueue  │→ │ Worker  │→ │ Cache   │ │
    │  │Server│  │(in-memory)│  │(asyncio)│  │(in-mem) │ │
    │  └──────┘  └──────────┘  └─────────┘  └─────────┘ │
    └─────────────────────────────────────────────────────┘

    v5 Upgrade Path:
    - TaskQueue → Cloud Tasks / Pub/Sub
    - Cache → Redis / Memorystore
    - Worker → Cloud Run Jobs / Cloud Functions

Components
----------
1. AsyncTaskQueue: In-memory async task queue with priority
2. ResultCache: TTL-based in-memory cache for analysis results
3. BackgroundScheduler: Periodic task scheduling (policy monitoring)
4. ConcurrencyLimiter: Limit concurrent Gemini API calls
"""

from __future__ import annotations

import asyncio
import hashlib
import logging
import time
from collections import OrderedDict
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Callable, Coroutine, Dict, List, Optional, Tuple

logger = logging.getLogger("pAIr.scalability")


# ═══════════════════════════════════════════════════════════════════════════
# 1. ASYNC TASK QUEUE
# ═══════════════════════════════════════════════════════════════════════════

class TaskPriority(int, Enum):
    CRITICAL = 0
    HIGH = 1
    NORMAL = 2
    LOW = 3
    BACKGROUND = 4


class TaskStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


@dataclass
class TaskResult:
    """Result of an async task execution."""
    task_id: str
    status: TaskStatus
    result: Any = None
    error: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    duration_ms: float = 0.0


@dataclass
class QueuedTask:
    """A task in the async queue."""
    task_id: str
    priority: TaskPriority
    func: Callable
    args: tuple
    kwargs: dict
    status: TaskStatus = TaskStatus.PENDING
    result: Optional[TaskResult] = None
    created_at: float = field(default_factory=time.time)


class AsyncTaskQueue:
    """
    Priority-based async task queue with result tracking.

    Usage:
        queue = AsyncTaskQueue(max_workers=5)
        task_id = await queue.enqueue(my_async_func, args=(data,), priority=TaskPriority.HIGH)
        result = await queue.wait_for(task_id, timeout=30)
    """

    def __init__(self, max_workers: int = 5):
        self._max_workers = max_workers
        self._semaphore = asyncio.Semaphore(max_workers)
        self._tasks: Dict[str, QueuedTask] = {}
        self._results: Dict[str, TaskResult] = {}
        self._queue: asyncio.PriorityQueue = asyncio.PriorityQueue()
        self._running = False
        self._worker_task: Optional[asyncio.Task] = None
        self._task_counter = 0

    async def start(self):
        """Start the queue worker."""
        self._running = True
        self._worker_task = asyncio.create_task(self._worker_loop())
        logger.info(f"AsyncTaskQueue started with {self._max_workers} workers")

    async def stop(self):
        """Gracefully stop the queue."""
        self._running = False
        if self._worker_task:
            self._worker_task.cancel()

    async def enqueue(
        self,
        func: Callable,
        args: tuple = (),
        kwargs: dict = None,
        priority: TaskPriority = TaskPriority.NORMAL,
    ) -> str:
        """Add a task to the queue. Returns task_id."""
        self._task_counter += 1
        task_id = f"task_{int(time.time())}_{self._task_counter}"

        task = QueuedTask(
            task_id=task_id,
            priority=priority,
            func=func,
            args=args,
            kwargs=kwargs or {},
        )
        self._tasks[task_id] = task

        # Priority queue uses (priority_value, creation_time, task_id)
        await self._queue.put((priority.value, task.created_at, task_id))
        logger.info(f"Task {task_id} enqueued (priority={priority.name})")
        return task_id

    async def wait_for(self, task_id: str, timeout: float = 60.0) -> TaskResult:
        """Wait for a task to complete."""
        start = time.time()
        while time.time() - start < timeout:
            if task_id in self._results:
                return self._results[task_id]
            await asyncio.sleep(0.1)

        return TaskResult(
            task_id=task_id,
            status=TaskStatus.FAILED,
            error=f"Timeout after {timeout}s",
        )

    def get_status(self, task_id: str) -> Optional[TaskResult]:
        """Get current status of a task."""
        if task_id in self._results:
            return self._results[task_id]
        if task_id in self._tasks:
            return TaskResult(
                task_id=task_id,
                status=self._tasks[task_id].status,
            )
        return None

    async def _worker_loop(self):
        """Process tasks from the queue."""
        while self._running:
            try:
                priority, created_at, task_id = await asyncio.wait_for(
                    self._queue.get(), timeout=1.0
                )
                asyncio.create_task(self._execute_task(task_id))
            except asyncio.TimeoutError:
                continue
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Worker loop error: {e}")

    async def _execute_task(self, task_id: str):
        """Execute a single task with concurrency limiting."""
        task = self._tasks.get(task_id)
        if not task:
            return

        async with self._semaphore:
            task.status = TaskStatus.RUNNING
            start = time.time()
            started_at = datetime.utcnow().isoformat()

            try:
                if asyncio.iscoroutinefunction(task.func):
                    result = await task.func(*task.args, **task.kwargs)
                else:
                    result = task.func(*task.args, **task.kwargs)

                duration = (time.time() - start) * 1000
                self._results[task_id] = TaskResult(
                    task_id=task_id,
                    status=TaskStatus.COMPLETED,
                    result=result,
                    started_at=started_at,
                    completed_at=datetime.utcnow().isoformat(),
                    duration_ms=round(duration, 1),
                )
                task.status = TaskStatus.COMPLETED
            except Exception as e:
                duration = (time.time() - start) * 1000
                self._results[task_id] = TaskResult(
                    task_id=task_id,
                    status=TaskStatus.FAILED,
                    error=str(e),
                    started_at=started_at,
                    completed_at=datetime.utcnow().isoformat(),
                    duration_ms=round(duration, 1),
                )
                task.status = TaskStatus.FAILED
                logger.error(f"Task {task_id} failed: {e}")

    @property
    def stats(self) -> Dict[str, Any]:
        return {
            "total_tasks": len(self._tasks),
            "pending": sum(1 for t in self._tasks.values() if t.status == TaskStatus.PENDING),
            "running": sum(1 for t in self._tasks.values() if t.status == TaskStatus.RUNNING),
            "completed": sum(1 for t in self._tasks.values() if t.status == TaskStatus.COMPLETED),
            "failed": sum(1 for t in self._tasks.values() if t.status == TaskStatus.FAILED),
            "max_workers": self._max_workers,
        }


# ═══════════════════════════════════════════════════════════════════════════
# 2. RESULT CACHE (TTL-based LRU)
# ═══════════════════════════════════════════════════════════════════════════

class ResultCache:
    """
    In-memory TTL-based LRU cache for analysis results.

    Cache Keys:
    - Policy analysis by content hash
    - Scoring results by (analysis_hash, profile_hash)
    - Search results by query hash

    Usage:
        cache = ResultCache(max_size=200, default_ttl=3600)
        cache.set("analysis:abc123", result_dict, ttl=7200)
        result = cache.get("analysis:abc123")
    """

    def __init__(self, max_size: int = 200, default_ttl: int = 3600):
        self._max_size = max_size
        self._default_ttl = default_ttl
        self._cache: OrderedDict[str, Tuple[Any, float]] = OrderedDict()
        self._hits = 0
        self._misses = 0

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache. Returns None if expired or missing."""
        if key in self._cache:
            value, expires_at = self._cache[key]
            if time.time() < expires_at:
                # Move to end (LRU)
                self._cache.move_to_end(key)
                self._hits += 1
                return value
            else:
                # Expired
                del self._cache[key]

        self._misses += 1
        return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """Set value in cache with TTL."""
        ttl = ttl or self._default_ttl
        expires_at = time.time() + ttl

        if key in self._cache:
            del self._cache[key]

        self._cache[key] = (value, expires_at)

        # Evict oldest if over capacity
        while len(self._cache) > self._max_size:
            self._cache.popitem(last=False)

    def invalidate(self, key: str):
        """Remove a specific key."""
        self._cache.pop(key, None)

    def clear(self):
        """Clear entire cache."""
        self._cache.clear()

    def cleanup_expired(self):
        """Remove all expired entries."""
        now = time.time()
        expired = [k for k, (_, exp) in self._cache.items() if now >= exp]
        for k in expired:
            del self._cache[k]

    @staticmethod
    def make_key(*parts: str) -> str:
        """Create a cache key from multiple parts."""
        combined = ":".join(str(p) for p in parts)
        return hashlib.sha256(combined.encode()).hexdigest()[:24]

    @property
    def stats(self) -> Dict[str, Any]:
        total = self._hits + self._misses
        return {
            "size": len(self._cache),
            "max_size": self._max_size,
            "hits": self._hits,
            "misses": self._misses,
            "hit_rate": round(self._hits / total, 3) if total > 0 else 0.0,
        }


# ═══════════════════════════════════════════════════════════════════════════
# 3. BACKGROUND SCHEDULER
# ═══════════════════════════════════════════════════════════════════════════

@dataclass
class ScheduledJob:
    """A recurring background job."""
    job_id: str
    name: str
    func: Callable
    interval_seconds: int
    last_run: Optional[float] = None
    run_count: int = 0
    enabled: bool = True


class BackgroundScheduler:
    """
    Simple asyncio-based background job scheduler.

    Usage:
        scheduler = BackgroundScheduler()
        scheduler.add_job("policy_scan", scan_func, interval_seconds=3600)
        await scheduler.start()
    """

    def __init__(self):
        self._jobs: Dict[str, ScheduledJob] = {}
        self._running = False
        self._task: Optional[asyncio.Task] = None

    def add_job(
        self,
        job_id: str,
        func: Callable,
        interval_seconds: int,
        name: Optional[str] = None,
    ):
        """Add a recurring job."""
        self._jobs[job_id] = ScheduledJob(
            job_id=job_id,
            name=name or job_id,
            func=func,
            interval_seconds=interval_seconds,
        )

    async def start(self):
        """Start the scheduler."""
        self._running = True
        self._task = asyncio.create_task(self._loop())
        logger.info(f"Scheduler started with {len(self._jobs)} jobs")

    async def stop(self):
        self._running = False
        if self._task:
            self._task.cancel()

    async def _loop(self):
        """Main scheduler loop."""
        while self._running:
            now = time.time()
            for job in self._jobs.values():
                if not job.enabled:
                    continue
                if job.last_run is None or (now - job.last_run) >= job.interval_seconds:
                    asyncio.create_task(self._run_job(job))
                    job.last_run = now

            await asyncio.sleep(10)  # Check every 10 seconds

    async def _run_job(self, job: ScheduledJob):
        """Execute a scheduled job."""
        try:
            if asyncio.iscoroutinefunction(job.func):
                await job.func()
            else:
                job.func()
            job.run_count += 1
            logger.info(f"Job '{job.name}' completed (run #{job.run_count})")
        except Exception as e:
            logger.error(f"Job '{job.name}' failed: {e}")

    @property
    def stats(self) -> Dict[str, Any]:
        return {
            "running": self._running,
            "jobs": {
                jid: {
                    "name": j.name,
                    "interval_s": j.interval_seconds,
                    "run_count": j.run_count,
                    "enabled": j.enabled,
                    "last_run": datetime.fromtimestamp(j.last_run).isoformat() if j.last_run else None,
                }
                for jid, j in self._jobs.items()
            },
        }


# ═══════════════════════════════════════════════════════════════════════════
# 4. CONCURRENCY LIMITER
# ═══════════════════════════════════════════════════════════════════════════

class ConcurrencyLimiter:
    """
    Limits concurrent calls to expensive resources (e.g., Gemini API).

    Usage:
        limiter = ConcurrencyLimiter(max_concurrent=3)
        async with limiter:
            result = await call_gemini_api(...)
    """

    def __init__(self, max_concurrent: int = 3):
        self._semaphore = asyncio.Semaphore(max_concurrent)
        self._max = max_concurrent
        self._active = 0
        self._total = 0

    async def __aenter__(self):
        await self._semaphore.acquire()
        self._active += 1
        self._total += 1
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        self._active -= 1
        self._semaphore.release()
        return False

    @property
    def stats(self) -> Dict[str, Any]:
        return {
            "max_concurrent": self._max,
            "active": self._active,
            "total_processed": self._total,
        }


# ═══════════════════════════════════════════════════════════════════════════
# 5. GLOBAL INSTANCES (for use across the application)
# ═══════════════════════════════════════════════════════════════════════════

# Pre-configured instances ready for use in main.py
analysis_cache = ResultCache(max_size=200, default_ttl=3600)  # 1-hour TTL
scoring_cache = ResultCache(max_size=500, default_ttl=1800)   # 30-min TTL
gemini_limiter = ConcurrencyLimiter(max_concurrent=3)
task_queue = AsyncTaskQueue(max_workers=5)
scheduler = BackgroundScheduler()
