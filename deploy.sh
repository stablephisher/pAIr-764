#!/bin/bash
# pAIr MSME Compliance Navigator
# Deploy to Google Cloud Run

set -e

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
REGION="${GCP_REGION:-asia-south1}"
SERVICE_NAME="pair-msme-navigator"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     pAIr MSME Compliance Navigator - Cloud Run Deploy        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install Google Cloud SDK."
    exit 1
fi

# Check if logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo "⚠️ Not logged in to gcloud. Running login..."
    gcloud auth login
fi

# Set project
echo "📋 Setting project to: ${PROJECT_ID}"
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and push image
echo "🏗️ Building Docker image..."
gcloud builds submit --tag ${IMAGE_NAME}

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME} \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --set-env-vars "DEMO_MODE=TRUE" \
    --set-env-vars "GEMINI_API_KEY=${GEMINI_API_KEY}" \
    --memory 512Mi \
    --timeout 300 \
    --concurrency 80

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format="value(status.url)")

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    ✅ DEPLOYMENT COMPLETE                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Service URL: ${SERVICE_URL}"
echo "📊 Dashboard: https://console.cloud.google.com/run?project=${PROJECT_ID}"
echo ""
echo "Test the API:"
echo "  curl ${SERVICE_URL}/api/history"
echo ""
