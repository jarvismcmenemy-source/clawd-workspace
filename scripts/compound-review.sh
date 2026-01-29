#!/bin/bash
# scripts/compound-review.sh
# Daily compound review - extracts learnings from conversations and updates knowledge base

set -e

cd "$(dirname "$0")/.."

echo "🧠 Starting compound review: $(date)"

# Ensure we're on main and up to date
git checkout main
git pull origin main

echo "📚 Reviewing today's conversations and extracting learnings..."

# Create the compound review session
# This will review today's memory file and update MEMORY.md with distilled insights
clawdbot session create compound-review-$(date +%Y%m%d) "
Load today's memory file: memory/$(date +%Y-%m-%d).md

Your task: COMPOUND REVIEW
1. Read through today's conversations and sessions
2. Extract key learnings, insights, patterns, and business context
3. Identify any missed opportunities or important takeaways
4. Update MEMORY.md with distilled knowledge (add new insights, don't replace existing content)
5. Update AGENTS.md if you discovered new workflow patterns or improvements
6. Commit and push changes to main branch

Focus on:
- Business insights about Chris's VALO Studios
- Technical patterns or solutions discovered
- Process improvements or workflow optimizations  
- Context that would help future sessions
- Mistakes to avoid or lessons learned

Write your updates directly to the files and commit them. This is institutional memory building.
" --model claude --cleanup delete

echo "✅ Compound review completed: $(date)"

# Log the compound review
echo "## $(date '+%Y-%m-%d %H:%M') - Compound Review Completed ✅" >> memory/$(date +%Y-%m-%d).md
echo "" >> memory/$(date +%Y-%m-%d).md
echo "Reviewed today's conversations and updated MEMORY.md with distilled learnings." >> memory/$(date +%Y-%m-%d).md
echo "Key focus: Business context, technical patterns, process improvements." >> memory/$(date +%Y-%m-%d).md
echo "" >> memory/$(date +%Y-%m-%d).md