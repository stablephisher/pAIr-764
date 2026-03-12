"""
pAIr v5 — Central Error Handler
=================================
FastAPI exception handlers for consistent error responses.
Catches all unhandled exceptions and returns structured JSON.
"""

import logging
import traceback
from datetime import datetime, timezone

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import ValidationError

logger = logging.getLogger("pAIr")


def register_error_handlers(app: FastAPI) -> None:
    """Register all exception handlers on the FastAPI app."""

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": True,
                "status_code": exc.status_code,
                "detail": exc.detail,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "path": str(request.url.path),
            },
        )

    @app.exception_handler(ValidationError)
    async def validation_exception_handler(request: Request, exc: ValidationError):
        logger.warning(f"Validation error on {request.url.path}: {exc.error_count()} errors")
        return JSONResponse(
            status_code=422,
            content={
                "error": True,
                "status_code": 422,
                "detail": "Request validation failed",
                "errors": exc.errors(),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "path": str(request.url.path),
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.error(
            f"Unhandled exception on {request.method} {request.url.path}: {exc}",
            exc_info=True,
        )
        return JSONResponse(
            status_code=500,
            content={
                "error": True,
                "status_code": 500,
                "detail": "Internal server error",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "path": str(request.url.path),
            },
        )
