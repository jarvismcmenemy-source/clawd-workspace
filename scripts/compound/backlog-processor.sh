#!/bin/bash
# scripts/compound/backlog-processor.sh  
# Business backlog processor - picks top priority item and implements it

set -e

cd "$(dirname "$0")/../.."

echo "🚀 Starting business backlog processing: $(date)"

# Fetch latest (including tonight's compound review updates)
git fetch origin main
git reset --hard origin/main

# Read the business backlog to find next priority item
BACKLOG_FILE="BUSINESS_BACKLOG.md"

if [[ ! -f "$BACKLOG_FILE" ]]; then
    echo "❌ No business backlog found at $BACKLOG_FILE"
    exit 1
fi

echo "📋 Reading business backlog..."

# Extract the first P1 item (this is a simplified version - could be made more sophisticated)
NEXT_ITEM=$(grep -A 10 "### P1:" "$BACKLOG_FILE" | head -1 | sed 's/### P1: //')

if [[ -z "$NEXT_ITEM" ]]; then
    echo "🎉 No P1 items remaining - checking P2..."
    NEXT_ITEM=$(grep -A 10 "### P2:" "$BACKLOG_FILE" | head -1 | sed 's/### P2: //')
fi

if [[ -z "$NEXT_ITEM" ]]; then
    echo "ℹ️  No urgent items in backlog"
    exit 0
fi

echo "🎯 Selected priority item: $NEXT_ITEM"

# Create branch name from item title
BRANCH_NAME="feature/$(echo "$NEXT_ITEM" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')"
echo "🌿 Creating branch: $BRANCH_NAME"

# Create feature branch
git checkout -b "$BRANCH_NAME"

# Execute the implementation
echo "⚡ Starting implementation..."

clawdbot session create backlog-$(date +%Y%m%d)-implementation "
PRIORITY IMPLEMENTATION TASK: $NEXT_ITEM

Your mission:
1. Read BUSINESS_BACKLOG.md to understand the full context of this item
2. Review USER.md to understand Chris's business (VALO Studios)
3. Create a new repository under jarvismcmenemy-source for this feature
4. Build a working MVP implementation
5. Follow these standards:
   - Professional quality code
   - README with setup/usage instructions
   - Ready for production deployment
   - VALO Studios branding where applicable

Technical approach:
- Use modern web technologies (React, Node.js, etc.)
- Focus on business impact over technical complexity
- Make it deployable (Netlify, Vercel, etc.)
- Include proper error handling and user feedback

After building:
1. Commit all work to the new repo
2. Come back to this workspace
3. Update BUSINESS_BACKLOG.md - move completed item to 'Completed ✅' section
4. Commit the backlog update
5. Log what was built in memory/$(date +%Y-%m-%d).md

Build something that immediately adds value to Chris's VALO Studios business.
" --model claude --cleanup keep

# Wait for implementation to complete
echo "⏳ Implementation in progress..."
echo "📝 Implementation will be logged to memory/$(date +%Y-%m-%d).md"

# Create PR (this will be done by the implementation session, but backup here)
echo "🔄 Creating PR for review..."

# Note: The actual PR creation will be handled by the implementation session
# This is just a placeholder for the automation

echo "✅ Business backlog processing completed: $(date)"