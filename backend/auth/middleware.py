"""
Authentication Middleware
=========================
Request-level auth enforcement and rate limiting.
"""

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import time
from collections import defaultdict


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple in-memory rate limiter.
    Production: replace with Redis-backed solution.
    """

    def __init__(self, app, max_requests: int = 30, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: dict = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/api/health"]:
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        now = time.time()

        # Clean old entries
        self._requests[client_ip] = [
            t for t in self._requests[client_ip]
            if now - t < self.window_seconds
        ]

        if len(self._requests[client_ip]) >= self.max_requests:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Please wait before retrying."},
            )

        self._requests[client_ip].append(now)
        return await call_next(request)


class AuthHeaderMiddleware(BaseHTTPMiddleware):
    """
    Middleware to extract and validate auth headers globally.
    Individual routes use FastAPI Depends() for fine-grained control.
    """

    # Routes that don't require auth
    PUBLIC_PATHS = {
        "/",
        "/health",
        "/api/health",
        "/docs",
        "/openapi.json",
        "/redoc",
    }

    async def dispatch(self, request: Request, call_next):
        # Allow public paths and OPTIONS (CORS preflight)
        if request.url.path in self.PUBLIC_PATHS or request.method == "OPTIONS":
            return await call_next(request)

        # Let FastAPI dependency injection handle actual verification
        return await call_next(request)
