import time
import argparse
from datetime import datetime
from agents.ingestion import PolicyIngestionAgent
from agents.analyst import PolicyAnalystAgent
from agents.planner import CompliancePlannerAgent
from policy_source import PolicySource
from utils.logger import setup_logger
from utils.storage import save_plan, load_state, save_state

# Initialize Logger
logger = setup_logger()

# Initialize Agents and Source
ingestion_agent = PolicyIngestionAgent()
analyst_agent = PolicyAnalystAgent()
planner_agent = CompliancePlannerAgent()
policy_source = PolicySource()

def run_automation_cycle():
    logger.info("Starting automation cycle.")
    
    # Load last processed policy ID
    state = load_state()
    last_processed_id = state.get("last_processed_id")
    
    try:
        # Check for new policy
        policy = policy_source.check_for_new_policy(last_processed_id)
        
        if policy:
            logger.info(f"New policy detected: {policy['title']} ({policy['id']})")
            
            # 1. Trigger Policy Ingestion Agent
            text = ingestion_agent.ingest(policy)
            
            # 2. Pass to Policy Analyst Agent
            analysis = analyst_agent.analyze(text)
            
            # 3. Forward to Compliance Planner Agent
            plan = planner_agent.create_plan(analysis)
            
            # 4. Store the final compliance plan
            # Add metadata
            plan["source_policy_id"] = policy["id"]
            plan["created_at"] = datetime.now().isoformat()
            save_plan(plan)
            
            # Update state
            state["last_processed_id"] = policy["id"]
            save_state(state)
            
            logger.info(f"Compliance plan stored successfully. ID: {plan['plan_id']}")
            return True # Policy processed
            
        else:
            logger.info("No new policy found.")
            return False
            
    except Exception as e:
        logger.error(f"An error occurred during execution: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Policy Compliance Automation")
    parser.add_argument("--interval", type=int, default=12, help="Interval in hours")
    parser.add_argument("--once", action="store_true", help="Run only once and exit")
    args = parser.parse_args()
    
    interval_seconds = args.interval * 3600
    
    logger.info(f"Automation service started. Schedule: Every {args.interval} hours.")
    
    while True:
        processed = run_automation_cycle()
        
        # Output execution result
        print(f"[{datetime.now().isoformat()}] Execution Status: Success | New Policy Processed: {processed}")
        
        if args.once:
            break
            
        logger.info(f"Sleeping for {args.interval} hours...")
        time.sleep(interval_seconds)

if __name__ == "__main__":
    main()
