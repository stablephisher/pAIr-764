import json
import os

# "Artifacts" is the term used by Google Antigravity for agent outputs.
HISTORY_FILE = "artifacts.json"
STATE_FILE = "automation_state.json"

def save_plan(plan):
    history = []
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, 'r') as f:
                history = json.load(f)
        except json.JSONDecodeError:
            pass
            
    history.append(plan)
    
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=4)

def load_state():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            pass
    return {}

def save_state(state):
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=4)
