# Audit Conductor

> **Trigger:** "Run an audit for..." or "Score this company" or "Analyze this discovery call" or "Build an audit scorecard for..."
> **Purpose:** Conduct an AI efficiency audit from discovery notes or call transcript. Output a completed scorecard with maturity rating, gap identification, workflow analysis, and ROI estimates.

---

## What This Skill Does

Takes discovery call notes, a transcript, or prospect information and produces:

1. **AI Maturity Scorecard** (rated /30)
2. **Top 3 Gaps** with current impact quantified
3. **Workflow Discovery** for 3 key workflows
4. **ROI Snapshot** with annual value estimate
5. **Recommended Use Cases** with solution level and timeline
6. **Recommended Engagement Tier** with pricing

---

## Input Requirements

To run an audit, Claude needs at least:
- Company name, industry, approximate size (employees + revenue)
- Discovery call notes or transcript (preferred)
- Any known pain points, tools in use, or workflow descriptions

If running from a transcript, Claude should first analyze it with this frame:
> "Analyze this business. Identify the top friction points. Quantify the time and cost impact where possible. Recommend investigation areas for the audit report."

---

## AI Maturity Rating

Score each area 1-5 based on discovery findings. Total out of 30.

| Area | Score | Evidence |
|---|---|---|
| Tool awareness | /5 | [What AI tools they know about / have heard of] |
| Current usage | /5 | [What they're actually using and how] |
| Data readiness | /5 | [Is their data organized, accessible, structured?] |
| Process documentation | /5 | [Do they have SOPs? Or is everything in someone's head?] |
| Team openness | /5 | [How does the team feel about new technology?] |
| Leadership urgency | /5 | [Is the CEO driving this or being dragged?] |
| **Total** | **/30** | |

### Maturity Bands

| Score | Band | What it means |
|---|---|---|
| 6-12 | AI-Exposed | Aware AI exists. Not using it. Likely skeptical or overwhelmed. |
| 13-18 | AI-Behind | Some scattered usage (ChatGPT for emails). No strategy. |
| 19-24 | AI-Aware | Engaged and interested. Needs structure and a roadmap. |
| 25-30 | AI-Ready | Aligned, data-ready, team is on board. Ready to implement. |

---

## Top 3 Gaps

For each gap surfaced in discovery:

| # | Problem | Current Impact | Hours/Week | Priority |
|---|---|---|---|---|
| 1 | [Gap description in their words] | [What it costs them] | [X] | High/Med/Low |
| 2 | | | | |
| 3 | | | | |

---

## Workflow Discovery

For each of the top 3 workflows:

### Workflow 1: [Name]

| Field | Details |
|---|---|
| Description | [What the workflow does] |
| Steps | 1. [Step] 2. [Step] 3. [Step]... |
| Who touches it | [Roles involved] |
| Frequency | [Daily / weekly / monthly] |
| Time per cycle | [Hours] |
| Current tools | [What they use now] |
| Where it breaks | [The friction point] |
| AI opportunity | Level [1/2/3] |
| Estimated annual value | [Hours saved x rate x 52] |

### Workflow 2: [Name]
[Same structure]

### Workflow 3: [Name]
[Same structure]

---

## ROI Snapshot

| Category | Calculation | Annual Value |
|---|---|---|
| Productivity gains | [Hours saved/week] x [avg hourly rate] x 52 | $[X] |
| Hire avoidance | [Roles avoided] x [monthly salary] x 12 | $[X] |
| Lead recovery revenue | [Missed leads/month] x [close rate] x [avg deal value] x 12 | $[X] |
| **Total estimated annual value** | | **$[Total]** |

**ROI vs. retainer:** At $[retainer]/month, the annual cost is $[X]. Against $[total annual value], that's a [X]x return.

---

## Recommended Use Cases

| # | Problem | Solution | Level | Timeline | Estimated Value |
|---|---|---|---|---|---|
| 1 | [From gap analysis] | [Specific solution] | 1/2/3 | [Weeks] | $[Annual] |
| 2 | | | | | |
| 3 | | | | | |

### Solution Level Reference

| Level | What it is | When to use |
|---|---|---|
| Level 1: Native AI | ChatGPT, Claude for immediate time savings | Fast wins. Start here always. |
| Level 2: AI + Automation | Zapier/Make connecting tools with AI in loop | 80% of value at fraction of Level 3 cost |
| Level 3: Custom Systems | Vibe-coded apps, custom agents, full orchestration | Only when Levels 1-2 are insufficient |

**Rule:** Start at Level 1. Escalate only when the client has exhausted the lower tier and the ROI justifies the complexity.

---

## Recommended Engagement

Based on maturity score, company size, and gap severity:

| Profile | Recommended Tier | Investment | First 30-Day Focus |
|---|---|---|---|
| Small business (1-20 employees) | Setup + monthly | $2,500 setup + $250/mo | Voice agent + lead follow-up |
| Mid-market, cautious | Assessment + roadmap | $5,000-$10,000 one-time | Audit report + opportunity matrix |
| Mid-market, ready to move | Assessment + sprint | $10,000-$15,000 | Top 2 Quick Wins built |
| Mid-market, high urgency | Fractional CAIO retainer | $10,000-$15,000/month | CEO dashboard + process automation |

---

## Output Format

The completed audit should be formatted as a branded .docx with:
- Navy (#1B2A4A) headers
- Orange (#E8541A) accent lines and highlights
- Plus Jakarta Sans (or Arial for Word)
- Bracketed [fill-in fields] for company-specific details
- Tables with navy header rows and light alternating backgrounds

### Sections in Order

1. Executive Summary (one paragraph, their pain in their words)
2. AI Maturity Scorecard (the /30 rating with band)
3. Top 3 Gaps (table)
4. Workflow Analysis (3 workflows)
5. ROI Snapshot (annual value table)
6. Recommended Use Cases (prioritized table)
7. Recommended Engagement (tier + pricing)
8. Next Steps (specific day to reconnect, what you'll bring)

---

## Key Numbers to Use in Audits

- 78% of jobs go to the first company to respond
- 20-30% of home services leads lost to slow follow-up
- 35-40% of calls arrive outside business hours
- 5-minute response = 9x higher conversion rate
- Average home services company can recover $5-15K/month with AI
- AI voice agent: < $1/hr vs $15-20/hr answering service
- Estimate follow-up sequences recover 20-30% of ghosted quotes
- 20% productivity gain across staff = equivalent of [headcount x 0.2] new hires

---

## Rules

- Use their exact language from the call. When they see their own words, trust compounds.
- Quantify everything. Time, cost, frequency, headcount. Vague pain doesn't close deals.
- Present both cost savings (floor) and revenue uplift (ceiling). Price should sit well below the floor.
- The audit should make the retainer feel like a no-brainer, not a gamble.
- Always end with a specific next step and date.
