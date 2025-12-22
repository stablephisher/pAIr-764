import time
from datetime import datetime, timedelta

class CompliancePlannerAgent:
    def create_plan(self, analysis_result):
        """
        Simulates creating a compliance plan based on analysis.
        Returns the final compliance plan.
        """
        print(f"[CompliancePlannerAgent] Creating compliance plan...")
        # Simulate processing time
        time.sleep(1)
        
        # Set deadline to 30 days from now
        deadline = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")

        return {
            "plan_id": f"CP-{int(time.time())}",
            "actions": [f"Address {req}" for req in analysis_result["key_requirements"]],
            "deadline": deadline,
            "status": "DRAFT"
        }
