"""
Orchestrator Agent (Antigravity Core)
=====================================
Central coordinator managing state and delegating to specialized agents.
"""

import asyncio
from typing import Dict, Any, Optional
from dataclasses import dataclass, field
from enum import Enum
import time


class AgentState(Enum):
    """Pipeline states for agent orchestration."""
    IDLE = "idle"
    INGESTING = "ingesting"
    REASONING = "reasoning"
    PLANNING = "planning"
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
    errors: list = field(default_factory=list)
    timestamps: Dict[str, float] = field(default_factory=dict)
    source: str = "uploaded"
    demo_mode: bool = False


class Orchestrator:
    """
    Antigravity Core: Central orchestrator for multi-agent system.
    
    Manages the flow of data through specialized agents:
    Ingestion → Reasoning → Planning → Execution → Verification → Explanation
    """
    
    def __init__(self, demo_mode: bool = False):
        self.demo_mode = demo_mode
        self.state = AgentState.IDLE
        self.context = None
        self._agents = {}
        
    def register_agent(self, name: str, agent):
        """Register a specialized agent."""
        self._agents[name] = agent
        
    def get_agent(self, name: str):
        """Get a registered agent by name."""
        return self._agents.get(name)
    
    async def run_pipeline(
        self, 
        raw_input: bytes, 
        business_profile: Dict[str, Any] = None,
        source: str = "uploaded"
    ) -> PipelineContext:
        """
        Execute the full agent pipeline.
        
        Args:
            raw_input: Raw document bytes (PDF)
            business_profile: Optional MSME business details for eligibility
            source: Origin of the document ('uploaded' or 'auto-fetched')
            
        Returns:
            PipelineContext with all analysis results
        """
        # Initialize context
        self.context = PipelineContext(
            raw_input=raw_input,
            business_profile=business_profile or {},
            source=source,
            demo_mode=self.demo_mode
        )
        
        pipeline_start = time.time()
        
        try:
            # Stage 1: Ingestion
            self.state = AgentState.INGESTING
            self.context.timestamps['ingestion_start'] = time.time()
            
            ingestion_agent = self.get_agent('ingestion')
            if ingestion_agent:
                self.context.extracted_text = await ingestion_agent.process(
                    self.context.raw_input
                )
            self.context.timestamps['ingestion_end'] = time.time()
            
            # Stage 2: Reasoning
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
            
            # Stage 3: Planning
            self.state = AgentState.PLANNING
            self.context.timestamps['planning_start'] = time.time()
            
            planning_agent = self.get_agent('planning')
            if planning_agent:
                self.context.compliance_plan = await planning_agent.generate_plan(
                    self.context.policy_analysis,
                    self.context.eligible_schemes
                )
            self.context.timestamps['planning_end'] = time.time()
            
            # Stage 4: Execution
            self.state = AgentState.EXECUTING
            self.context.timestamps['execution_start'] = time.time()
            
            execution_agent = self.get_agent('execution')
            if execution_agent:
                self.context.execution_output = await execution_agent.prepare_outputs(
                    self.context.compliance_plan,
                    self.context.business_profile
                )
            self.context.timestamps['execution_end'] = time.time()
            
            # Stage 5: Verification
            self.state = AgentState.VERIFYING
            self.context.timestamps['verification_start'] = time.time()
            
            verification_agent = self.get_agent('verification')
            if verification_agent:
                self.context.verification_result = await verification_agent.validate(
                    self.context
                )
            self.context.timestamps['verification_end'] = time.time()
            
            # Stage 6: Explanation
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
            raise
            
        finally:
            self.context.timestamps['total_time'] = time.time() - pipeline_start
            
        return self.context
    
    def get_status(self) -> Dict[str, Any]:
        """Get current orchestration status."""
        return {
            "state": self.state.value,
            "demo_mode": self.demo_mode,
            "has_context": self.context is not None,
            "registered_agents": list(self._agents.keys())
        }
