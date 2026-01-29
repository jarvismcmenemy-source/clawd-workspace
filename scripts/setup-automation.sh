#!/bin/bash
# scripts/setup-automation.sh
# Sets up cron jobs for the compound engineering loop

cd "$(dirname "$0")/.."
WORKSPACE=$(pwd)

echo "🔧 Setting up compound engineering automation..."

# Create cron jobs
echo "Creating cron jobs..."

# Add compound review at 10:30 PM
(crontab -l 2>/dev/null; echo "30 22 * * * cd $WORKSPACE && ./scripts/compound-review.sh >> logs/compound-review.log 2>&1") | crontab -

# Add backlog processing at 11:00 PM  
(crontab -l 2>/dev/null; echo "0 23 * * * cd $WORKSPACE && ./scripts/compound/backlog-processor.sh >> logs/backlog-processing.log 2>&1") | crontab -

# Create logs directory
mkdir -p logs

echo "✅ Automation setup complete!"
echo ""
echo "📅 Scheduled jobs:"
echo "  10:30 PM - Compound review (extract learnings)"
echo "  11:00 PM - Business backlog processing (implement features)"
echo "   3:00 AM - Nightly builds (existing heartbeat system)"
echo ""
echo "📋 View cron jobs: crontab -l"
echo "📜 View logs: tail -f logs/compound-review.log"
echo "📊 Monitor: tail -f logs/backlog-processing.log"
echo ""
echo "🧠 The compound effect starts tonight!"