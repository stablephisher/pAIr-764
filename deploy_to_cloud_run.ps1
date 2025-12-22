# pAIr MSME Compliance Navigator
# Deploy to Google Cloud Run (PowerShell)

param(
    [string]$ProjectId = $env:GCP_PROJECT_ID,
    [string]$Region = "asia-south1",
    [string]$ServiceName = "pair-msme-navigator"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     pAIr MSME Compliance Navigator - Cloud Run Deploy        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if gcloud is installed
try {
    $gcloudVersion = gcloud --version 2>&1
} catch {
    Write-Host "❌ gcloud CLI not found. Please install Google Cloud SDK." -ForegroundColor Red
    Write-Host "   Download: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Check project ID
if (-not $ProjectId) {
    Write-Host "⚠️ Project ID not set. Please provide via parameter or GCP_PROJECT_ID env var." -ForegroundColor Yellow
    $ProjectId = Read-Host "Enter your GCP Project ID"
}

$ImageName = "gcr.io/$ProjectId/$ServiceName"

# Check if logged in
Write-Host "🔐 Checking authentication..." -ForegroundColor Yellow
$authList = gcloud auth list --filter="status:ACTIVE" --format="value(account)" 2>&1
if (-not $authList) {
    Write-Host "⚠️ Not logged in to gcloud. Running login..." -ForegroundColor Yellow
    gcloud auth login
}

# Set project
Write-Host "📋 Setting project to: $ProjectId" -ForegroundColor Yellow
gcloud config set project $ProjectId

# Enable required APIs
Write-Host "🔧 Enabling required APIs..." -ForegroundColor Yellow
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and push image
Write-Host "🏗️ Building Docker image..." -ForegroundColor Yellow
gcloud builds submit --tag $ImageName

# Get API key from environment
$ApiKey = $env:GEMINI_API_KEY
if (-not $ApiKey) {
    Write-Host "⚠️ GEMINI_API_KEY not set in environment." -ForegroundColor Yellow
    $ApiKey = Read-Host "Enter your Gemini API Key (or press Enter to skip)"
}

# Deploy to Cloud Run
Write-Host "🚀 Deploying to Cloud Run..." -ForegroundColor Yellow

$deployArgs = @(
    "run", "deploy", $ServiceName,
    "--image", $ImageName,
    "--platform", "managed",
    "--region", $Region,
    "--allow-unauthenticated",
    "--set-env-vars", "DEMO_MODE=TRUE",
    "--memory", "512Mi",
    "--timeout", "300",
    "--concurrency", "80"
)

if ($ApiKey) {
    $deployArgs += @("--set-env-vars", "GEMINI_API_KEY=$ApiKey")
}

& gcloud @deployArgs

# Get the service URL
$ServiceUrl = gcloud run services describe $ServiceName --region $Region --format="value(status.url)"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    ✅ DEPLOYMENT COMPLETE                     ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Service URL: $ServiceUrl" -ForegroundColor Cyan
Write-Host "📊 Dashboard: https://console.cloud.google.com/run?project=$ProjectId" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test the API:" -ForegroundColor Yellow
Write-Host "  Invoke-RestMethod -Uri '$ServiceUrl/api/history'" -ForegroundColor White
Write-Host ""
