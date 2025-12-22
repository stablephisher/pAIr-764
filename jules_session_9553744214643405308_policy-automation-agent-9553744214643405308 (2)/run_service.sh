#!/bin/bash
# Starts the automation service in the background
# The service runs every 12 hours (default)

nohup python3 automation.py --interval 12 > automation.log 2>&1 &
echo "Automation service started in background. Check automation.log for output."
