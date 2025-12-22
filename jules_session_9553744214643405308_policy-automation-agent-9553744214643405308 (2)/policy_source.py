import time
import random

class PolicySource:
    def __init__(self):
        self.policies = [
            {"id": "POL-001", "title": "AI Safety Regulation", "content": "All AI agents must be safe."},
            {"id": "POL-002", "title": "Data Privacy Act", "content": "User data must be encrypted."},
            {"id": "POL-003", "title": "Cloud Computing Standards", "content": "Use certified providers."}
        ]
        # In a real scenario, this would check an external source.
        # We simulate "new" policies by checking if we've seen them before.
        # For this mock, we'll just randomly return one or None to simulate updates.
    
    def check_for_new_policy(self, last_processed_id=None):
        """
        Simulates checking for a new policy.
        If last_processed_id is provided, returns a policy with a higher ID (lexicographically for simplicity)
        or just the next one in the list.
        """
        print("[PolicySource] Checking for new policies...")
        time.sleep(0.5)
        
        # Simple simulation: 
        # If last_processed_id is None, return the first one.
        # If it exists, return the next one in the list.
        
        if last_processed_id is None:
            return self.policies[0]
            
        for i, policy in enumerate(self.policies):
            if policy["id"] == last_processed_id:
                if i + 1 < len(self.policies):
                    return self.policies[i+1]
                else:
                    return None # No new policies
        
        return None
