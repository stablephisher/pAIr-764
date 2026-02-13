"""
Orchestrator Agent v3 (Antigravity Core)
=========================================
Central coordinator managing state and delegating to specialized agents.

v3 Enhancements:
- Integrated scoring engines (risk, sustainability, profitability)
- Ethical AI governance at every output
- Business profile-aware pipeline
- Real-time policy monitoring agent support
"""

import asyncio
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from enum import Enum
import time
import traceback


class AgentState(Enum):
    """Pipeline states for agent orchestration."""
    IDLE = "idle"
    INGESTING = "ingesting"
    REASONING = "reasoning"
    PLANNING = "planning"
    SCORING = "scoring"
    EXECUTING = "executing"
    VERIFYING = "verifying"
    EXPLAINING = "explaining"
    COMPLETE = "complete"
    ERROR = "error"


@dataclass
class PipelineContext:
    """Context passed through the agent pipeline."""
    raw_input: Optional[bytes] = None
    extracted_text: str = ""
    policy_analysis: Dict[str, Any] = field(default_factory=dict)
    compliance_plan: Dict[str, Any] = field(default_factory=dict)
    execution_output: Dict[str, Any] = field(default_factory=dict)
    verification_result: Dict[str, Any] = field(default_factory=dict)
    explanation: str = ""
    business_profile: Dict[str, Any] = field(default_factory=dict)
    eligible_schemes: list = field(default_factory=list)
    # v3 scoring results
    risk_report: Dict[str, Any] = field(default_factory=dict)
    sustainability_report: Dict[str, Any] = field(default_factory=dict)
    profitability_report: Dict[str, Any] = field(default_factory=dict)
    ethics_report: Dict[str, Any] = field(default_factory=dict)
    errors: list = field(default_factory=list)
    timestamps: Dict[str, float] = field(default_factory=dict)
    source: str = "uploaded"
    demo_mode: bool = False
    user_uid: Optional[str] = None


class Orchestrator:
    """
    Antigravity Core v3: Central orchestrator for multi-agent system.
    
    Pipeline:
    Ingestion → Reasoning → Planning → **Scoring** → Execution → Verification → Explanation

    Scoring stage runs three engines in parallel:
    - ComplianceRiskScorer  → risk_report
    - SustainabilityEngine  → sustainability_report
    - ProfitabilityOptimizer → profitability_report
    - EthicalAIFramework    → ethics_report (attached to all outputs)
    """
    
    def __init__(self, demo_mode: bool = False):
        self.demo_mode = demo_mode
        self.state = AgentState.IDLE
        self.context = None
        self._agents = {}
        
        # Lazy-loaded scoring engines
        self._risk_scorer = None
        self._sustainability_engine = None
        self._profitability_optimizer = None
        self._ethics_framework = None
        
    def register_agent(self, name: str, agent):
        """Register a specialized agent."""
        self._agents[name] = agent
        
    def get_agent(self, name: str):
        """Get a registered agent by name."""
        return self._agents.get(name)
    
    def _get_risk_scorer(self):
        if self._risk_scorer is None:
            from scoring.compliance_risk import ComplianceRiskScorer
            self._risk_scorer = ComplianceRiskScorer()
        return self._risk_scorer

    def _get_sustainability_engine(self):
        if self._sustainability_engine is None:
            from scoring.sustainability import SustainabilityEngine
            self._sustainability_engine = SustainabilityEngine()
        return self._sustainability_engine

    def _get_profitability_optimizer(self):
        if self._profitability_optimizer is None:
            from scoring.profitability import ProfitabilityOptimizer
            self._profitability_optimizer = ProfitabilityOptimizer()
        return self._profitability_optimizer

    def _get_ethics_framework(self):
        if self._ethics_framework is None:
            from ethics.framework import EthicalAIFramework
            self._ethics_framework = EthicalAIFramework()
        return self._ethics_framework
    
    async def run_pipeline(
        self, 
        raw_input: bytes, 
        business_profile: Dict[str, Any] = None,
        source: str = "uploaded",
        user_uid: Optional[str] = None,
    ) -> PipelineContext:
        """
        Execute the full agent pipeline.
        
        Args:
            raw_input: Raw document bytes (PDF)
            business_profile: Optional MSME business details for eligibility
            source: Origin of the document ('uploaded' or 'auto-fetched')
            user_uid: Firebase user UID (optional)
            
        Returns:
            PipelineContext with all analysis results
        """
        self.context = PipelineContext(
            raw_input=raw_input,
            business_profile=business_profile or {},
            source=source,
            demo_mode=self.demo_mode,
            user_uid=user_uid,
        )
        
        pipeline_start = time.time()
        
        try:
            # ── Stage 1: Ingestion ───────────────────────────────────
            self.state = AgentState.INGESTING
            self.context.timestamps['ingestion_start'] = time.time()
            
            ingestion_agent = self.get_agent('ingestion')
            if ingestion_agent:
                self.context.extracted_text = await ingestion_agent.process(
                    self.context.raw_input
                )
            self.context.timestamps['ingestion_end'] = time.time()
            
            # ── Stage 2: Reasoning ───────────────────────────────────
            self.state = AgentState.REASONING
            self.context.timestamps['reasoning_start'] = time.time()
            
            reasoning_agent = self.get_agent('reasoning')
            if reasoning_agent:
                result = await reasoning_agent.analyze(
                    self.context.extracted_text,
                    self.context.business_profile
                )
                self.context.policy_analysis = result.get('analysis', {})
                self.context.eligible_schemes = result.get('eligible_schemes', [])
            self.context.timestamps['reasoning_end'] = time.time()
            
            # ── Stage 3: Planning ────────────────────────────────────
            self.state = AgentState.PLANNING
            self.context.timestamps['planning_start'] = time.time()
            
            planning_agent = self.get_agent('planning')
            if planning_agent:
                self.context.compliance_plan = await planning_agent.generate_plan(
                    self.context.policy_analysis,
                    self.context.eligible_schemes
                )
            self.context.timestamps['planning_end'] = time.time()
            
            # ── Stage 4: Scoring (NEW in v3) ─────────────────────────
            self.state = AgentState.SCORING
            self.context.timestamps['scoring_start'] = time.time()
            await self._run_scoring_engines()
            self.context.timestamps['scoring_end'] = time.time()
            
            # ── Stage 5: Execution ───────────────────────────────────
            self.state = AgentState.EXECUTING
            self.context.timestamps['execution_start'] = time.time()
            
            execution_agent = self.get_agent('execution')
            if execution_agent:
                self.context.execution_output = await execution_agent.prepare_outputs(
                    self.context.compliance_plan,
                    self.context.business_profile
                )
            self.context.timestamps['execution_end'] = time.time()
            
            # ── Stage 6: Verification ────────────────────────────────
            self.state = AgentState.VERIFYING
            self.context.timestamps['verification_start'] = time.time()
            
            verification_agent = self.get_agent('verification')
            if verification_agent:
                self.context.verification_result = await verification_agent.validate(
                    self.context
                )
            self.context.timestamps['verification_end'] = time.time()
            
            # ── Stage 7: Explanation ─────────────────────────────────
            self.state = AgentState.EXPLAINING
            self.context.timestamps['explanation_start'] = time.time()
            
            explanation_agent = self.get_agent('explanation')
            if explanation_agent:
                self.context.explanation = await explanation_agent.generate_summary(
                    self.context
                )
            self.context.timestamps['explanation_end'] = time.time()
            
            self.state = AgentState.COMPLETE
            
        except Exception as e:
            self.state = AgentState.ERROR
            self.context.errors.append(str(e))
            print(f"[Orchestrator] Pipeline error: {traceback.format_exc()}")
            raise
            
        finally:
            self.context.timestamps['total_time'] = time.time() - pipeline_start
            
        return self.context

    async def _run_scoring_engines(self):
        """
        Run all three scoring engines + ethics framework.
        These are CPU-bound/lightweight, so they run synchronously but
        are wrapped in the async pipeline for consistency.
        """
        analysis = self.context.policy_analysis
        profile = self.context.business_profile
        num_policies = 1
        num_schemes = len(self.context.eligible_schemes)

        try:
            # Risk scoring
            scorer = self._get_risk_scorer()
            risk_report = scorer.score(analysis)
            self.context.risk_report = {
                "overall_score": risk_report.overall_score,
                "overall_band": risk_report.overall_band.value,
                "top_risks": [
                    {
                        "name": r.obligation_name,
                        "score": r.weighted_score,
                        "band": r.risk_band.value,
                        "hint": r.remediation_hint,
                        "days_remaining": r.days_remaining,
                    }
                    for r in risk_report.top_risks
                ],
                "score_breakdown": risk_report.score_breakdown,
                "recommendations": risk_report.recommendations,
            }
        except Exception as e:
            print(f"[Orchestrator] Risk scoring failed: {e}")
            self.context.risk_report = {"error": str(e), "overall_score": 0}

        try:
            # Sustainability
            sus_engine = self._get_sustainability_engine()
            sus_report = sus_engine.calculate(num_policies, num_schemes, profile)
            self.context.sustainability_report = {
                "green_score": sus_report.green_score,
                "grade": sus_report.grade,
                "paper": {
                    "pages_saved": sus_report.paper.pages_saved,
                    "trees_saved": sus_report.paper.trees_saved,
                    "water_saved_litres": sus_report.paper.water_saved_litres,
                },
                "carbon": {
                    "net_co2_saved_kg": sus_report.carbon.net_co2_saved_kg,
                    "equivalent_trees_planted": sus_report.carbon.equivalent_trees_planted,
                },
                "efficiency": {
                    "hours_saved": sus_report.efficiency.hours_saved,
                    "cost_saved_inr": sus_report.efficiency.cost_saved_inr,
                    "productivity_multiplier": sus_report.efficiency.productivity_multiplier,
                },
                "yearly_projection": sus_report.yearly_projection,
                "sdg_alignment": sus_report.sdg_alignment,
                "narrative": sus_report.narrative,
            }
        except Exception as e:
            print(f"[Orchestrator] Sustainability scoring failed: {e}")
            self.context.sustainability_report = {"error": str(e), "green_score": 0}

        try:
            # Profitability
            prof_opt = self._get_profitability_optimizer()
            prof_report = prof_opt.analyze(analysis, profile, num_policies)
            self.context.profitability_report = {
                "total_roi_inr": prof_report.total_roi_inr,
                "roi_multiplier": prof_report.roi_multiplier,
                "penalty_avoidance_inr": prof_report.total_penalty_avoidance_inr,
                "scheme_benefits_inr": prof_report.total_scheme_benefits_inr,
                "cost_savings_inr": prof_report.total_cost_savings_inr,
                "yearly_projection_inr": prof_report.yearly_projection_inr,
                "cost_comparison": {
                    "traditional": prof_report.cost_comparison.traditional_cost_inr,
                    "pair": prof_report.cost_comparison.pair_cost_inr,
                    "savings_percent": prof_report.cost_comparison.savings_percent,
                },
                "scheme_benefits": [
                    {
                        "scheme_id": sb.scheme_id,
                        "name": sb.scheme_name,
                        "type": sb.benefit_type,
                        "value_inr": sb.estimated_value_inr,
                        "effort": sb.application_effort,
                        "notes": sb.notes,
                    }
                    for sb in prof_report.scheme_benefits
                ],
                "recommendations": prof_report.recommendations,
            }
        except Exception as e:
            print(f"[Orchestrator] Profitability scoring failed: {e}")
            self.context.profitability_report = {"error": str(e), "total_roi_inr": 0}

        try:
            # Ethics
            ethics = self._get_ethics_framework()
            # Extract confidence from verification or default
            verification = self.context.verification_result
            confidence = verification.get("confidence_score", 0.7) if verification else 0.7
            ethics_report = ethics.evaluate(
                analysis_result=analysis,
                confidence_score=confidence,
                model_name="gemini-2.5-flash",
                business_profile=profile,
            )
            self.context.ethics_report = {
                "disclaimers": ethics_report.disclaimers,
                "human_in_loop_required": ethics_report.human_in_loop_required,
                "consultant_recommendation": ethics_report.consultant_recommendation,
                "transparency": ethics_report.transparency.to_dict(),
                "escalations": [
                    {
                        "reason": e.reason.value,
                        "severity": e.severity,
                        "message": e.message,
                        "expert": e.recommended_expert,
                    }
                    for e in ethics_report.escalations
                ],
                "bias_check": {
                    "is_fair": ethics_report.bias_check.is_fair,
                    "flags": ethics_report.bias_check.flags_raised,
                },
                "data_handling": ethics_report.data_handling,
            }
        except Exception as e:
            print(f"[Orchestrator] Ethics evaluation failed: {e}")
            self.context.ethics_report = {"error": str(e)}
    
    def get_status(self) -> Dict[str, Any]:
        """Get current orchestration status."""
        return {
            "state": self.state.value,
            "demo_mode": self.demo_mode,
            "has_context": self.context is not None,
            "registered_agents": list(self._agents.keys()),
            "v3_engines": ["risk_scorer", "sustainability", "profitability", "ethics"],
        }
