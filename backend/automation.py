"""
Jules-Compatible Automation Entry Point
This script runs the same AI pipeline as the web UI, but autonomously.
Suitable for scheduled execution via Jules or cron.
"""
import os
import sys
import time
import asyncio
import argparse
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import run_policy_analysis_pipeline, extract_text_from_pdf

# Configure logging
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("JulesAutomation")

# Directory to watch for policy PDFs
MONITORED_DIR = os.path.join(os.path.dirname(__file__), "monitored_policies")
STATE_FILE = os.path.join(os.path.dirname(__file__), "automation_state.json")

def load_state():
    import json
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, 'r') as f:
                return json.load(f)
        except:
            pass
    return {"processed_files": []}

def save_state(state):
    import json
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

async def process_single_file(filepath: str):
    """Process a single PDF file through the AI pipeline."""
    logger.info(f"Processing: {filepath}")
    
    try:
        with open(filepath, "rb") as f:
            content = f.read()
        
        text = extract_text_from_pdf(content)
        if not text.strip():
            logger.warning(f"No text extracted from {filepath}")
            return False
        
        # Run the same pipeline as the web UI (tagged as auto-fetched)
        result = await run_policy_analysis_pipeline(text, source="auto-fetched")
        logger.info(f"✅ Successfully processed: {filepath}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to process {filepath}: {e}")
        return False

async def run_automation_cycle(fetch_online=True):
    """Check for new PDFs and process them."""
    logger.info("Starting automation cycle...")
    
    # Step 1: Fetch new policies from online sources
    if fetch_online:
        try:
            from policy_fetcher import fetch_new_policies
            logger.info("🌐 Fetching new policies from online sources...")
            downloaded = fetch_new_policies(max_downloads=3)
            if downloaded:
                logger.info(f"📥 Downloaded {len(downloaded)} new policy file(s)")
        except ImportError:
            logger.warning("policy_fetcher module not found, skipping online fetch")
        except Exception as e:
            logger.error(f"Online fetch failed: {e}")
    
    # Step 2: Process local files
    state = load_state()
    processed_files = set(state.get("processed_files", []))
    new_processed = []
    
    if not os.path.exists(MONITORED_DIR):
        logger.info(f"Creating monitored directory: {MONITORED_DIR}")
        os.makedirs(MONITORED_DIR)
    
    for filename in os.listdir(MONITORED_DIR):
        if filename.endswith(".pdf") and filename not in processed_files:
            filepath = os.path.join(MONITORED_DIR, filename)
            success = await process_single_file(filepath)
            if success:
                new_processed.append(filename)
    
    if new_processed:
        state["processed_files"] = list(processed_files | set(new_processed))
        state["last_run"] = datetime.now().isoformat()
        save_state(state)
        logger.info(f"Processed {len(new_processed)} new file(s)")
    else:
        logger.info("No new policies to process")
    
    return len(new_processed)

def main():
    parser = argparse.ArgumentParser(description="Jules-Compatible Policy Automation")
    parser.add_argument("--interval", type=int, default=12, help="Interval in hours (for continuous mode)")
    parser.add_argument("--once", action="store_true", help="Run once and exit")
    parser.add_argument("--file", type=str, help="Process a specific PDF file")
    args = parser.parse_args()
    
    # Ensure API key is set
    if not os.getenv("GEMINI_API_KEY"):
        logger.error("GEMINI_API_KEY environment variable not set!")
        sys.exit(1)
    
    if args.file:
        # Process single file
        asyncio.run(process_single_file(args.file))
    elif args.once:
        # Single cycle
        count = asyncio.run(run_automation_cycle())
        print(f"[{datetime.now().isoformat()}] Processed {count} file(s)")
    else:
        # Continuous mode
        interval_seconds = args.interval * 3600
        logger.info(f"Starting continuous automation. Interval: {args.interval} hours")
        
        while True:
            count = asyncio.run(run_automation_cycle())
            print(f"[{datetime.now().isoformat()}] Cycle complete. Processed: {count}")
            logger.info(f"Sleeping for {args.interval} hours...")
            time.sleep(interval_seconds)

if __name__ == "__main__":
    main()
