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
    project_id: str = os.getenv("FIREBASE_PROJECT_ID", "pair-msme-navigator")
    credentials_path: Optional[str] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", None)
    api_key: str = os.getenv("FIREBASE_API_KEY", "")


@dataclass
class GeminiConfig:
    """Google Gemini AI configuration."""
    api_key: str = os.getenv("GEMINI_API_KEY", "")
    primary_model: str = "models/gemini-2.5-flash"
    fallback_model: str = "models/gemini-2.0-flash-lite"
    max_retries: int = 3
    retry_delay_seconds: int = 30
    response_mime_type: str = "application/json"


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
    gemini: GeminiConfig = field(default_factory=GeminiConfig)
    policy: PolicyConfig = field(default_factory=PolicyConfig)
    scoring: ScoringConfig = field(default_factory=ScoringConfig)
    server: ServerConfig = field(default_factory=ServerConfig)


# Singleton
config = AppConfig()
