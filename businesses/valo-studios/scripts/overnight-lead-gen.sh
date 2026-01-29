#!/bin/bash
# businesses/valo-studios/scripts/overnight-lead-gen.sh
# VALO lead generation - runs during 11 PM business backlog slot

set -e

cd "$(dirname "$0")/../.."

echo "🎯 VALO Overnight Lead Generation - $(date)"

# Check if lead-gen is the priority for tonight
# This will be called by the main backlog processor when VALO lead-gen is P1

# Clone the valo-automation repo if not exists
if [[ ! -d "../valo-automation" ]]; then
    echo "📥 Cloning valo-automation repo..."
    gh repo clone valochris/valo-automation ../valo-automation
fi

cd ../valo-automation/overnight-lead-gen

# Check for required environment variables
if [[ -z "$ANTHROPIC_API_KEY" ]] || [[ -z "$SUPABASE_URL" ]] || [[ -z "$RESEND_API_KEY" ]]; then
    echo "❌ Missing required environment variables"
    echo "Need: ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_API_KEY"
    exit 1
fi

# Install dependencies if needed
if [[ ! -d "node_modules" ]]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🚀 Running lead generation..."

# Run the lead gen job
npm run lead-gen

# Log completion
echo "✅ Lead generation completed: $(date)"

# Create a summary for the daily log
echo "## $(date '+%Y-%m-%d %H:%M') - VALO Lead Gen Completed ✅" >> ../../clawd/memory/$(date +%Y-%m-%d).md
echo "" >> ../../clawd/memory/$(date +%Y-%m-%d).md
echo "Processed overnight lead generation workflow." >> ../../clawd/memory/$(date +%Y-%m-%d).md
echo "Checked Google Sheets → Scraped websites → Generated AI content → Sent emails" >> ../../clawd/memory/$(date +%Y-%m-%d).md
echo "" >> ../../clawd/memory/$(date +%Y-%m-%d).md
