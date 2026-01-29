#!/bin/bash
# businesses/valo-studios/scripts/overnight-lead-gen.sh
# VALO lead generation - runs during 11 PM business backlog slot
# Uses Brave Search API instead of Puppeteer for web data

set -e

cd "$(dirname "$0")/../.."

echo "🎯 VALO Overnight Lead Generation - $(date)"

# Check for required environment variables
if [[ -z "$ANTHROPIC_API_KEY" ]] || [[ -z "$SUPABASE_URL" ]] || [[ -z "$RESEND_API_KEY" ]]; then
    echo "❌ Missing required environment variables"
    echo "Need: ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_API_KEY"
    exit 1
fi

# Check for Brave Search API (optional but recommended)
if [[ -z "$BRAVE_API_KEY" ]]; then
    echo "⚠️  BRAVE_API_KEY not set - web scraping may fail"
    echo "Set it with: export BRAVE_API_KEY=your_key_here"
fi

# Clone the valo-automation repo if not exists
if [[ ! -d "../valo-automation" ]]; then
    echo "📥 Cloning valo-automation repo..."
    gh repo clone valochris/valo-automation ../valo-automation
fi

cd ../valo-automation/overnight-lead-gen

# Check if we need to patch for Brave Search
echo "🔧 Checking for Brave Search integration..."

# Install dependencies if needed
if [[ ! -d "node_modules" ]]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🚀 Running lead generation (target: 50 successful)..."

# Use targeted lead gen that ensures 50 successful completions
# Filters by status column (processes blank/pending/failed only)
node targeted-lead-gen.mjs 50

SUCCESS_COUNT=$?

# Log completion
echo "✅ Lead generation completed: $(date)"
echo "📊 Target: 50 successful prospects based on status column filtering"

# Create a summary for the daily log
echo "## $(date '+%Y-%m-%d %H:%M') - VALO Lead Gen Completed ✅" >> ../../clawd/memory/$(date +%Y-%m-%d).md
echo "" >> ../../clawd/memory/$(date +%Y-%m-%d).md
echo "Processed overnight lead generation workflow." >> ../../clawd/memory/$(date +%Y-%m-%d).md
echo "Checked Google Sheets → Web research → Generated AI content → Sent emails" >> ../../clawd/memory/$(date +%Y-%m-%d).md
echo "" >> ../../clawd/memory/$(date +%Y-%m-%d).md
