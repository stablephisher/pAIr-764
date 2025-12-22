"""
pAIr Multi-Agent System
========================
Antigravity Core: Multi-agent architecture for MSME Compliance & Grant Navigation

Agents:
- Orchestrator: Manages state and delegation
- Ingestion: Handles data intake (PDF parsing, OCR)
- Reasoning: Semantic understanding and eligibility logic (Gemini 3)
- Planning: Generates compliance roadmaps
- Execution: Prepares outputs/forms
- Verification: Validates results
- Explanation: Generates user-friendly summaries
"""

from .orchestrator import Orchestrator
from .ingestion_agent import IngestionAgent
from .reasoning_agent import ReasoningAgent
from .planning_agent import PlanningAgent
from .execution_agent import ExecutionAgent
from .verification_agent import VerificationAgent
from .explanation_agent import ExplanationAgent

__all__ = [
    'Orchestrator',
    'IngestionAgent',
    'ReasoningAgent',
    'PlanningAgent',
    'ExecutionAgent',
    'VerificationAgent',
    'ExplanationAgent'
]
