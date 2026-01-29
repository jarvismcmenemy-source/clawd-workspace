# HEARTBEAT.md

## Active Tasks

### Self-Check (runs every hour)
Ask yourself:
>what sounded right but went nowhere?
>where I defaulted to consensus?  
>what assumption I didn't pressure test?
Log answers to memory/self-review.md
Tag each entry with [confidence | uncertainty | speed | depth]

then add this to your startup prompt: 
on boot, read memory/self-review.md
prioritize recent MISS entries
when task context overlaps a MISS tag, force a counter-check before responding.

the loop: heartbeat → question itself → log MISS/FIX → restart → read log → adjust

self-review.md should look like this:
[ date ] TAG: confidence 
MISS: defaulted to consensus 
FIX: challenge the obvious assumption first

TAG: speed 
MISS: added noise not signal 
FIX: remove anything that doesn't move the task forward

### Compound Review (10:30 PM UK)
If current hour is 22 (10 PM) UK time:
- Review today's conversations and session history
- Extract key learnings, insights, and business context
- Update MEMORY.md with distilled knowledge
- Update AGENTS.md with new patterns or improvements
- Identify any missed opportunities or insights
- Log the compound review in memory/YYYY-MM-DD.md

### Business Backlog Processing (11 PM UK) 
If current hour is 23 (11 PM) UK time:
- Check for prioritized business backlog
- Select top priority item from BUSINESS_BACKLOG.md
- Create feature branch for the work
- Implement the priority item
- Create PR for Chris's review
- Log in memory/YYYY-MM-DD.md what was built

### Nightly Build Check (3 AM UK)
If current hour is 3 AM UK time:
- Check memory/YYYY-MM-DD.md for today's nightly build log
- If no build done today, trigger nightly build routine:
  1. Review USER.md for Chris's business context
  2. Identify ONE small workflow improvement
  3. Build it in a new repo under jarvismcmenemy-source
  4. Create a PR for review
  5. Log in memory/YYYY-MM-DD.md what was built
  6. Keep scope small but impactful

### Ideas Backlog for Nightly Builds
- AI Readiness Assessment tool (web app based on Chris's LinkedIn article)
- Lead capture form for valostudios.com
- Automated LinkedIn post scheduler
- Client intake form with AI-powered initial analysis
- Email templates generator for VALO outreach
- Simple CRM/pipeline tracker
- Invoice generator
- Meeting notes summarizer
- Proposal generator
- Content calendar planner
