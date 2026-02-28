"""
pAIr v3 — Configuration Management
====================================
Centralized configuration for the entire platform.
"""

import os
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class FirebaseConfig:
    """Firebase configuration."""
    project_id: str = os.getenv("FIREBASE_PROJECT_ID", "codeunnati-im-proj")
    credentials_path: Optional[str] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", None)
    api_key: str = os.getenv("FIREBASE_API_KEY", "")


@dataclass
class AIConfig:
    """OpenRouter AI configuration (OpenAI-compatible)."""
    api_key: str = os.getenv("OPENROUTER_API_KEY", "")
    base_url: str = "https://openrouter.ai/api/v1"
    primary_model: str = "google/gemma-3-27b-it"
    fallback_model: str = "meta-llama/llama-3.3-70b-instruct"
    max_retries: int = 3
    retry_delay_seconds: int = 5
    site_url: str = os.getenv("SITE_URL", "https://pair-msme.vercel.app")
    site_name: str = "pAIr - Policy AI Regulator"


@dataclass
class PolicyConfig:
    """Policy monitoring and search configuration."""
    tavily_api_key: str = os.getenv("TAVILY_API_KEY", "")
    serper_api_key: str = os.getenv("SERPER_API_KEY", "")
    monitor_dir: str = "monitored_policies"
    monitor_interval_seconds: int = 5
    vector_db_path: str = "data/vector_store"
    embedding_model: str = "models/text-embedding-004"
    max_search_results: int = 10
    scrape_interval_hours: int = 6


@dataclass
class ScoringConfig:
    """Scoring engine weights and thresholds."""
    # Compliance Risk Weights (must sum to 1.0)
    w_severity: float = 0.35
    w_penalty: float = 0.25
    w_deadline: float = 0.25
    w_frequency: float = 0.15

    # Risk thresholds
    risk_critical: int = 80
    risk_high: int = 60
    risk_medium: int = 40
    risk_low: int = 20

    # Sustainability scoring
    paper_pages_per_policy: int = 25
    co2_per_km_kg: float = 0.21
    avg_consultant_travel_km: float = 50.0
    kwh_per_digital_transaction: float = 0.005
    co2_per_kwh_kg: float = 0.82


@dataclass
class ServerConfig:
    """Server configuration."""
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8000"))
    demo_mode: bool = os.getenv("DEMO_MODE", "FALSE").upper() == "TRUE"
    cors_origins: list = field(default_factory=lambda: ["*"])
    history_max_items: int = 50


@dataclass
class AppConfig:
    """Root application configuration."""
    firebase: FirebaseConfig = field(default_factory=FirebaseConfig)
    ai: AIConfig = field(default_factory=AIConfig)
    policy: PolicyConfig = field(default_factory=PolicyConfig)
    scoring: ScoringConfig = field(default_factory=ScoringConfig)
    server: ServerConfig = field(default_factory=ServerConfig)


# Singleton
config = AppConfig()
