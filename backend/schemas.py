from typing import List, Optional, Literal, Any
from pydantic import BaseModel, Field, field_validator

class PolicyMetadata(BaseModel):
    policy_name: str
    issuing_authority: str
    effective_date: str
    geographical_scope: str
    policy_type: str

class Applicability(BaseModel):
    who_is_affected: str
    conditions: List[str]
    exceptions: List[str]

    @field_validator('conditions', mode='before')
    @classmethod
    def flatten_conditions(cls, v):
        # AI often returns objects like {"type": "Investment Limit", ...} instead of strings
        # Flatten them into a single string description
        cleaned = []
        if isinstance(v, list):
            for item in v:
                if isinstance(item, dict):
                    # Combine all values into a string
                    cleaned.append(" - ".join(str(val) for val in item.values()))
                else:
                    cleaned.append(str(item))
            return cleaned
        return v

class Obligation(BaseModel):
    obligation: str
    description: str
    deadline: str
    frequency: str
    severity_if_ignored: str

class Penalty(BaseModel):
    violation: str
    penalty_amount: str
    other_consequences: str

class ComplianceAction(BaseModel):
    action: str
    priority: Literal["HIGH", "MEDIUM", "LOW"]
    estimated_effort: str

class RiskAssessment(BaseModel):
    overall_risk_level: Literal["HIGH", "MEDIUM", "LOW"]
    reasoning: str

class ConfidenceNotes(BaseModel):
    ambiguous_sections: List[str]
    missing_information: List[str]

# --- Compliance Planning Agent Models ---
class ActionStep(BaseModel):
    step_number: int
    action: str
    why_it_matters: str
    deadline: str
    risk_if_ignored: str

class CompliancePlan(BaseModel):
    applicability_status: Literal["APPLICABLE", "PARTIALLY_APPLICABLE", "NOT_APPLICABLE"]
    summary_for_owner: str
    action_plan: List[ActionStep]
    monitoring_advice: str
    confidence_level: Literal["HIGH", "MEDIUM", "LOW"]


class DebugMetadata(BaseModel):
    models_used: List[str]
    step_1_time: float
    step_2_time: float
    system_prompt_snapshot: str
    planning_prompt_snapshot: str
    raw_response_step_1: str
    
class PolicyAnalysis(BaseModel):
    policy_metadata: PolicyMetadata
    applicability: Applicability
    obligations: List[Obligation]
    penalties: List[Penalty]
    required_documents: List[str]
    compliance_actions: List[ComplianceAction]
    risk_assessment: RiskAssessment
    confidence_notes: ConfidenceNotes
    compliance_plan: Optional[CompliancePlan] = None
    debug_metadata: Optional[DebugMetadata] = None
