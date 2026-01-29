# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:
- Camera names and locations
- SSH hosts and aliases  
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras
- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH
- home-server → 192.168.1.100, user: admin

### TTS
- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

## Antigravity + MiniMax Setup

**Goal:** Use cost-effective MiniMax model in Antigravity instead of Claude/Gemini

**Setup Process:**
1. **Install Client Extension** 
   - Open Antigravity → Extensions → Install "Client" extension
   - Enables external API connections

2. **Configure MiniMax 2.1**
   - Open Client extension (bottom left panel)
   - Select **Minimax 2.1** as model
   - Input API key: Same key from Clawdbot config (`minimax:default` profile)

3. **Enable "Act" Mode**
   - Switch to "Act" mode in agent interface
   - Allows direct file creation/modification

4. **Usage Workflow**
   - Use Manager View/Chat interface for high-level instructions
   - Example: "Build a React-based CRM dashboard with login flow"
   - Antigravity will generate code directly in project files

**Benefits:**
- Same MiniMax model across Clawdbot + Antigravity (consistency)
- 15¢/M input tokens vs premium Claude pricing
- 200k context window for large codebases
- Direct GitHub sync when combined with project repos

**GitHub Integration:**
- Every new product/project gets dedicated repo under `jarvismcmenemy-source`
- Ensure Antigravity workspace is connected to GitHub repo
- Sync all development work throughout process

---

Add whatever helps you do your job. This is your cheat sheet.
