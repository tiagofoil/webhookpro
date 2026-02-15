# WebhookPro Development Journey - Summary for Content Creation

## Project Overview
**Project Name:** WebhookPro  
**Type:** Open-source webhook testing/debugging tool  
**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, Upstash Redis  
**Live URL:** https://webhookpro.vercel.app  
**GitHub:** https://github.com/tiagofoil/webhookpro  

## The Initial Goal (Day 1)
Build a simple webhook debugging tool similar to webhook.site or ngrok's inspector. The tool should:
- Generate unique webhook URLs instantly
- Capture and display HTTP requests in real-time
- Show headers, body, query params, and metadata
- Work without user signup
- Be deployable on Vercel (free tier)

## The Obstacles & Challenges

### 1. Storage Architecture Crisis
**Problem:** Initially used in-memory storage (JavaScript Map). This doesn't work on Vercel's serverless architecture because each request may hit a different instance.

**Symptoms:**
- Webhooks captured but not retrievable
- Data lost between requests
- "Waiting for webhooks..." even after successful POST

**Solution:** Migrated to Upstash Redis (serverless Redis) for persistent storage across instances.

### 2. Breaking Changes in Next.js 16
**Problem:** Upgraded from Next.js 14 to 16 mid-project, causing multiple breaking changes:
- Route handlers now require `await` for params
- `request.ip` removed, had to use headers instead
- JSX transform issues with async components

**Time Lost:** 3+ hours debugging cryptic errors.

### 3. Monorepo Mess
**Problem:** Started as a monorepo with other projects. Created git chaos:
- Submodule conflicts
- Wrong GitHub Actions paths
- Git history pollution

**Solution:** Migrated to standalone repository with clean git history.

### 4. Field Naming Inconsistency
**Problem:** Database saved `createdAt` (camelCase) but frontend expected `created_at` (snake_case). Result: "Unknown time" displayed instead of actual timestamps.

**Root Cause:** TypeScript types didn't match actual Redis storage format.

### 5. UX Nightmares
**Problems discovered after "working" backend:**
- Landing page showed example curl but no webhooks appeared
- Refresh lost the endpoint (back to landing page)
- No auto-update - user had to refresh manually
- Inconsistent card heights in inspector
- Collapse/expand feature caused layout shifts

**Solutions:**
- Auto-redirect to `/e/{id}` after creating endpoint
- Real-time polling (every 2 seconds)
- Fixed-height cards with internal scroll
- Removed distracting animations
- Added "New Webhook" button for easy creation

### 6. Windows Compatibility
**Problem:** curl example used single quotes which break in Windows PowerShell.

**Solution:** Added both Mac/Linux and Windows PowerShell examples.

### 7. Build Failures
**Issues:**
- `@import` in wrong position in CSS
- Unescaped strings in TypeScript
- Missing dependencies (lucide-react)

**Time Lost:** 2+ hours in CI/CD debugging.

## Key Learnings

### Technical
1. **Always design for serverless first** - In-memory storage is a trap on serverless platforms
2. **Don't upgrade frameworks mid-project** - Next.js 14 → 16 broke everything
3. **Match database fields exactly** - TypeScript types are lies if data doesn't match
4. **Test on Windows** - 50% of developers use it, curl syntax differs

### Product/UX
1. **Backend working ≠ Product working** - UX flow matters more than APIs
2. **Refresh should never lose state** - Single-page behavior is critical
3. **Auto-update beats manual refresh** - Real-time builds trust
4. **Remove distractions** - Animations that don't add value hurt usability

### Process
1. **Start simple, stay simple** - Resist adding features until core works
2. **User feedback > assumptions** - Every UX fix came from actual testing
3. **Deployment early and often** - Found issues only in production (Vercel ≠ localhost)

## The Pivot

**Original Plan:** Build a micro-SaaS with paid tiers ($9/mo Pro plan)

**Reality Check:** 
- 8+ hours just to get basic functionality working
- Competitors (webhook.site, ngrok) exist and are free
- Adding auth, payments, team features = weeks more work

**Final Decision:** 
- Open source under MIT License
- Free forever
- "Buy Me a Coffee" donation model
- Focus on being a portfolio piece and useful tool, not a business

## Final Stats

**Time Invested:** 2 days (~16 hours active work)  
**Lines of Code:** ~3,000 (TypeScript/React)  
**Commits:** 20+  
**Major Refactors:** 3 (storage, routing, UI)  
**Frustration Level:** High → Satisfied  
**Final Result:** Working, deployed, open-source tool

## What Worked Well

1. **Linear-inspired UI** - Dark theme, cyan accents, professional look
2. **Terminal demo** - Static visual that explains the tool instantly
3. **Auto-polling** - Users see webhooks appear in real-time
4. **No signup required** - Instant gratification
5. **Open source** - Builds trust, potential for contributions

## Advice for Future Projects

1. Choose boring technology (Next.js 14 stable, not 16 canary)
2. Design for serverless from day one
3. Build the "happy path" first, edge cases later
4. Test on real deployment, not just localhost
5. If a competitor exists and is free, match their model first
6. Perfect is the enemy of shipped

## Emotional Journey

**Day 1 Morning:** Excited, confident  
**Day 1 Evening:** Frustrated, considering giving up  
**Day 2 Morning:** Determined to fix it  
**Day 2 Evening:** Satisfied, learned a lot  

## Quotes from Development

> "You pick and start... don't be idle for more than 15 minutes"
> "Never give up or guess things"
> "Backend working is not enough - UX is everything"

## Call to Action for Posts

**Blog Post Angle:** "Building a Webhook Debugger: 8 Obstacles I Didn't Expect"
- Technical deep dive
- Lessons learned
- Transparency about struggles

**LinkedIn Post Angle:** "I spent 2 days building a free tool instead of a SaaS. Here's why."
- Pivot story
- Open source wins
- Community over profit

**Hashtags:** #opensource #webdev #nextjs #saas #buildinpublic #developerexperience #webhooks

---

**Contact:** Tiago Foil  
**Links:** 
- Live Tool: https://webhookpro.vercel.app
- GitHub: https://github.com/tiagofoil/webhookpro
- Support: https://buymeacoffee.com/tiagofoil