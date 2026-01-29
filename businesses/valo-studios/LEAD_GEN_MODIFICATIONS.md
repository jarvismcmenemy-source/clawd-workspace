# Lead Gen Modifications

## Source Repository
Original: https://github.com/valochris/valo-automation

## Modifications Made

### 1. Status Filter (2026-01-29)
**File:** `overnight-lead-gen/src/index.js`

**Change:** Only process prospects with BLANK status
```javascript
// BEFORE: Processed blank, pending, or failed
prospects = allProspects.filter(p => {
  const status = (p.status || '').toLowerCase().trim();
  return !status || status === 'pending' || status === 'failed';
});

// AFTER: Only process blank status
prospects = allProspects.filter(p => {
  const status = (p.status || '').toLowerCase().trim();
  return !status || status === '';
});
```

**Reason:** Cleaner pipeline - only fresh prospects get processed

### 2. Brave Search Integration (2026-01-29)
**Files:** 
- `src/brave-search.js` (new)
- `src/scraper.js` (modified)

**Change:** Added Brave Search API as primary data source
- Replaces/supplements Puppeteer browser scraping
- No browser needed - API-based
- Better for automation environment

### 3. Target-Based Processing (2026-01-29)
**File:** `targeted-lead-gen.mjs` (new)

**Change:** Ensures exactly 50 successful completions
- Processes in batches until target hit
- Handles rate limits with delays
- Filters by status column

## Pipeline Flow

```
Google Sheets → Filter (blank only) → Brave Search → Claude AI → 
Supabase Landing Page → Resend Email → Update Status → "processed"
```

## Status Values

| Status | Meaning | Action |
|--------|---------|--------|
| (blank) | Fresh prospect | ✅ Process |
| processing | Currently being worked on | ⏭️ Skip |
| processed | Already completed | ⏭️ Skip |
| skipped-invalid | Bad data | ⏭️ Skip |
| skipped-malformed | CSV parsing issue | ⏭️ Skip |
| failed | Previous attempt failed | ⏭️ Skip |

## Re-applying Modifications

After fresh clone of valo-automation:

```bash
cd valo-automation/overnight-lead-gen

# Apply status filter change
sed -i '' "s/return !status || status === 'pending' || status === 'failed';/return !status || status === '';/" src/index.js

# Copy brave-search.js
cp /path/to/brave-search.js src/

# Add import to scraper.js
sed -i '' "1a\\
import { extractCompanyInfo } from './brave-search.js';" src/scraper.js
```
