# pAIr MSME Compliance Navigator
# Multi-stage Docker build for production deployment

FROM python:3.11-slim as backend

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV DEMO_MODE=TRUE
ENV PORT=8000

# Create directory for monitored policies
RUN mkdir -p monitored_policies

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/history')" || exit 1

# Run the server
CMD ["python", "main.py"]
