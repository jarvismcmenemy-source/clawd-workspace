#!/bin/bash

# Setup script for Daily AI Digest cron job
# This will run every day at 8:00 AM UK time

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
DIGEST_SCRIPT="$SCRIPT_DIR/ai-digest/run-daily-digest.js"

echo "Setting up Daily AI Digest cron job..."
echo "Script location: $DIGEST_SCRIPT"

# Check if the script exists
if [ ! -f "$DIGEST_SCRIPT" ]; then
    echo "Error: Digest script not found at $DIGEST_SCRIPT"
    exit 1
fi

echo ""
echo "Add this line to your crontab (run 'crontab -e'):"
echo ""
echo "# Daily AI Digest at 8:00 AM UK time"
echo "0 8 * * * cd $SCRIPT_DIR && node ai-digest/run-daily-digest.js >> /tmp/ai-digest.log 2>&1"
echo ""
echo "This will:"
echo "- Run every day at 8:00 AM"
echo "- Generate content ideas from 18 AI accounts"
echo "- Send you a Telegram summary"
echo "- Save full digest to ai-digest/data/digests/"
echo "- Log output to /tmp/ai-digest.log"
echo ""
echo "Manual test: node $DIGEST_SCRIPT"