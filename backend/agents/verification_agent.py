"""
Verification Agent
==================
Validates analysis results and ensures accuracy.
"""

from typing import Dict, Any
from dataclasses import dataclass


@dataclass
class ValidationResult:
    """Result of verification check."""
    valid: bool
    confidence_score: float
    issues: list
    warnings: list
    suggestions: list


class VerificationAgent:
    """
    Quality assurance agent for result validation.
    
    Responsibilities:
    - Cross-check analysis accuracy
    - Validate eligibility criteria
    - Confidence scoring
    - Detect potential issues
    """
    
    def __init__(self, demo_mode: bool = False):
        self.demo_mode = demo_mode
        
    async def validate(self, context) -> Dict[str, Any]:
        """
        Validate the entire pipeline context.
        
        Args:
            context: PipelineContext from orchestrator
            
        Returns:
            Validation results with scores and issues
        """
        issues = []
        warnings = []
        suggestions = []
        
        # Validate policy analysis
        analysis_score = self._validate_analysis(context.policy_analysis, issues, warnings)
        
        # Validate compliance plan
        plan_score = self._validate_plan(context.compliance_plan, issues, warnings)
        
        # Validate execution outputs
        execution_score = self._validate_execution(context.execution_output, issues, warnings)
        
        # Check cross-consistency
        consistency_score = self._check_consistency(context, issues, warnings)
        
        # Calculate overall confidence
        overall_score = (analysis_score + plan_score + execution_score + consistency_score) / 4
        
        # Add suggestions based on findings
        suggestions.extend(self._generate_suggestions(context, warnings))
        
        return {
            "valid": len(issues) == 0,
            "confidence_score": round(overall_score, 2),
            "component_scores": {
                "analysis": analysis_score,
                "planning": plan_score,
                "execution": execution_score,
                "consistency": consistency_score
            },
            "issues": issues,
            "warnings": warnings,
            "suggestions": suggestions,
            "verification_summary": self._generate_summary(overall_score, issues, warnings)
        }
    
    def _validate_analysis(
        self, 
        analysis: Dict[str, Any], 
        issues: list, 
        warnings: list
    ) -> float:
        """Validate policy analysis completeness."""
        score = 1.0
        
        if not analysis:
            issues.append("Policy analysis is missing")
            return 0.0
            
        # Check required fields
        required_fields = ['policy_metadata', 'applicability', 'obligations', 'risk_assessment']
        for field in required_fields:
            if field not in analysis:
                issues.append(f"Missing required field: {field}")
                score -= 0.2
                
        # Check for UNKNOWN values
        if self._contains_unknown(analysis):
            warnings.append("Some fields contain UNKNOWN values - manual review recommended")
            score -= 0.1
            
        # Validate metadata
        metadata = analysis.get('policy_metadata', {})
        if not metadata.get('policy_name'):
            warnings.append("Policy name could not be identified")
            score -= 0.05
            
        if not metadata.get('effective_date'):
            warnings.append("Effective date is unclear")
            score -= 0.05
            
        return max(0, score)
    
    def _validate_plan(
        self, 
        plan: Dict[str, Any], 
        issues: list, 
        warnings: list
    ) -> float:
        """Validate compliance plan quality."""
        score = 1.0
        
        if not plan:
            warnings.append("Compliance plan not generated")
            return 0.5  # Not critical, just a warning
            
        # Check action plan
        action_plan = plan.get('action_plan', [])
        if not action_plan:
            warnings.append("No action items in compliance plan")
            score -= 0.2
            
        # Validate each action has required fields
        for i, action in enumerate(action_plan):
            if not action.get('action'):
                warnings.append(f"Action item {i+1} is missing description")
                score -= 0.05
            if not action.get('deadline'):
                warnings.append(f"Action item {i+1} has no deadline")
                score -= 0.03
                
        # Check applicability status
        if plan.get('applicability_status') not in ['APPLICABLE', 'PARTIALLY_APPLICABLE', 'NOT_APPLICABLE']:
            warnings.append("Applicability status unclear")
            score -= 0.1
            
        return max(0, score)
    
    def _validate_execution(
        self, 
        execution: Dict[str, Any], 
        issues: list, 
        warnings: list
    ) -> float:
        """Validate execution outputs."""
        score = 1.0
        
        if not execution:
            return 0.5  # Not critical
            
        # Check checklist
        checklist = execution.get('compliance_checklist', [])
        if not checklist:
            warnings.append("No compliance checklist generated")
            score -= 0.1
            
        # Check document guide
        doc_guide = execution.get('document_preparation_guide', [])
        if not doc_guide:
            warnings.append("No document preparation guide available")
            score -= 0.1
            
        return max(0, score)
    
    def _check_consistency(
        self, 
        context, 
        issues: list, 
        warnings: list
    ) -> float:
        """Check cross-component consistency."""
        score = 1.0
        
        analysis = context.policy_analysis
        plan = context.compliance_plan
        
        if not analysis or not plan:
            return 0.5
            
        # Check if obligations match action items
        obligations = analysis.get('obligations', [])
        action_plan = plan.get('action_plan', [])
        
        if len(obligations) > 0 and len(action_plan) == 0:
            warnings.append("Obligations identified but no action plan generated")
            score -= 0.2
            
        # Check risk alignment
        analysis_risk = analysis.get('risk_assessment', {}).get('overall_risk_level')
        if analysis_risk == 'HIGH' and plan.get('applicability_status') == 'NOT_APPLICABLE':
            warnings.append("High risk identified but marked as not applicable - verify")
            score -= 0.15
            
        return max(0, score)
    
    def _contains_unknown(self, obj, depth=0) -> bool:
        """Check if any value contains UNKNOWN."""
        if depth > 10:
            return False
            
        if isinstance(obj, str):
            return 'UNKNOWN' in obj.upper()
        elif isinstance(obj, dict):
            return any(self._contains_unknown(v, depth+1) for v in obj.values())
        elif isinstance(obj, list):
            return any(self._contains_unknown(item, depth+1) for item in obj)
        return False
    
    def _generate_suggestions(
        self, 
        context, 
        warnings: list
    ) -> list:
        """Generate improvement suggestions."""
        suggestions = []
        
        if any('UNKNOWN' in w for w in warnings):
            suggestions.append("Review the original document for missing information")
            
        if any('deadline' in w.lower() for w in warnings):
            suggestions.append("Contact the issuing authority to confirm deadlines")
            
        if not context.business_profile:
            suggestions.append("Provide business profile for personalized eligibility analysis")
            
        return suggestions
    
    def _generate_summary(
        self, 
        score: float, 
        issues: list, 
        warnings: list
    ) -> str:
        """Generate human-readable summary."""
        if score >= 0.9 and len(issues) == 0:
            return "✅ High confidence analysis. Results are reliable for decision-making."
        elif score >= 0.7:
            return f"⚠️ Good analysis with {len(warnings)} minor warnings. Review flagged items."
        elif score >= 0.5:
            return f"⚠️ Moderate confidence. {len(warnings)} warnings and {len(issues)} issues need attention."
        else:
            return f"❌ Low confidence. {len(issues)} critical issues found. Manual review required."
