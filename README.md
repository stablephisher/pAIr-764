# Policy Ingestion Agent: Autonomous Compliance Intelligence

**An Agentic AI System for Indian MSMEs**

This system serves as an intelligent compliance officer for small businesses. It continuously monitors policy sources, autonomously analyzes complex government regulations, and generates instant, actionable compliance plans—without requiring user intervention.

---

## 🤖 System Architecture: The Multi-Agent Swarm

This project is not a simple wrapper; it is a multi-agent system where four distinct AI agents collaborate to solve the compliance problem:

### 1. Ingestion Agent
- **Role**: The Gateway
- **Function**: Monitors file streams and uploads. It handles PDF parsing, OCR text extraction, and prepares raw data for analysis.
- **Capability**: Handles complex government gazettes and notifications.

### 2. Policy Analyst Agent (Powered by Gemini 2.0 Flash)
- **Role**: The Legal Expert
- **Function**: Reads the raw policy text and performs deep semantic reasoning.
- **Output**: Structured JSON intelligence identifying:
    - Legal Obligations
    - Penalties & Risks
    - Applicability Criteria
    - Deadlines

### 3. Compliance Planning Agent (Powered by Gemini 2.0 Flash-Lite)
- **Role**: The Strategist
- **Function**: Takes the *structured intelligence* from the Analyst and reasons about *implications* for a business owner.
- **Output**: A prioritized, step-by-step **Action Plan** (e.g., "Do this first," "Risk is High," "file form X by date Y").
- **Key Feature**: It speaks business language, not legal jargon.

### 4. Background Monitoring Agent (Autonomous Watchdog)
- **Role**: The Automator
- **Function**: A persistent background service that watches designated policy sources (e.g., local directories simulating government portals).
- **Behavior**:
    - 📡 **Detects**: Instantly notices new policy documents.
    - ⚡ **Triggers**: Automatically launches the analysis pipeline.
    - 💾 **Saves**: Pushes results to the system history.
    - **Zero-Touch**: No human click is needed. The dashboard updates live.

---

## 🔄 Modes of Operation

The system demonstrates true flexibility by operating in two distinct modes:

### Mode 1: Interactive (User-Driven)
*Best for: Ad-hoc analysis of specific documents.*
1. User uploads a PDF via the Premium UI.
2. The agent swarm executes sequentially (Ingest → Analyze → Plan).
3. Results are displayed immediately with a "Check AI Logic" debug view.

### Mode 2: Autonomous (Agent-Driven)
*Best for: "Set and Forget" continuous compliance.*
1. The **Monitoring Agent** runs silently in the background.
2. When a new policy drops (e.g., into `backend/monitored_policies`), the agent wakes up.
3. It autonomously orchestrates the Analyst and Planner agents.
4. The Frontend UI auto-refreshes to alert the user: *"New Policy Analyze: [Policy Name]"*.

---

## 🚀 Key Technologies
- **Orchestration**: Python (FastAPI + AsyncIO background tasks)
- **Intelligence**: Google Gemini 2.0 Flash & Flash-Lite (via `google-generativeai`)
- **Interface**: React + Vite (Modern, responsive dashboard)
- **State Management**: JSON-based persistent history

---

## 🎯 Final Goal
To empower non-legal MSME owners to say:
> *"This system continuously monitors policy sources and automatically triggers analysis and compliance planning without user input."*
