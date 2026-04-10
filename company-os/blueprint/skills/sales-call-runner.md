# Sales Call Runner

> **Trigger:** "Prep me for a sales call with..." or "I have a call with [company]" or "Help me prep for [prospect name]"
> **Purpose:** Generate a customized pre-call brief and STE framework script tailored to a specific prospect. Optionally, debrief after a call with follow-up email draft.

---

## What This Skill Does

**Pre-call mode:** Takes prospect info (company name, industry, what you know about them) and produces:
1. A 30-second company snapshot
2. Customized STE framework talking points for their specific situation
3. Anticipated objections with prepared responses
4. 3-5 discovery questions tailored to their industry and likely pain points
5. Use case trigger map for their business type

**Post-call mode:** Takes call notes or transcript and produces:
1. Pain points surfaced (in their words)
2. Use cases identified with solution level (1/2/3)
3. ROI estimate based on quantified pain
4. Follow-up email draft (3-5 sentences, their words, 2-3 opportunity areas)
5. Recommended next step and proposal tier

---

## Pre-Call Brief Template

### 30-Second Version

**Company:** [Name]
**Industry:** [Sub-niche within home services]
**Size:** [Employees] / [Estimated revenue]
**How they entered pipeline:** [Seminar / LinkedIn / cold outreach / referral]
**What we know:** [Any intel from LinkedIn, website, reviews, prior conversation]

### Pain Hypothesis

Based on [industry] and [company size], their top pain points are likely:
1. [Most common pain for this sub-niche]
2. [Second most common]
3. [Third]

### Customized STE Talking Points

**Strategy opener (the fear):**
> "[Industry-specific version of: 'Your competitors are probably already looking at this. Here's what I'm seeing in [their space]...']"

**Transformation anchor (the ROI):**
> "[Based on their estimated size, use specific numbers: 'A company your size typically has [X] manual hours/week in [process]. That's [Y] annually. We usually cut that by 60-80%.']"

**Education closer (expand value):**
> "With [estimated headcount] employees, a 20% productivity gain is the equivalent of [X] new hires without [X] new salaries."

### Anticipated Objections

Based on their profile, prepare for:

| Likely objection | Prepared response |
|---|---|
| [Based on company size/stage] | [Matched response from objection handling playbook] |
| [Based on industry] | [Matched response] |

### Discovery Questions (Prioritized for This Prospect)

1. [Most relevant from the 6-part question bank based on their industry]
2. [Follow-up based on likely workflow]
3. [Pain quantification question tied to their specific situation]
4. [Use case matching question for their most likely use case]
5. [Niche signal question if this is a new sub-niche]

### Use Case Trigger Map (for their industry)

| If they say... | Likely use case | Next question |
|---|---|---|
| [Industry-specific trigger 1] | [Use case] | [Follow-up] |
| [Industry-specific trigger 2] | [Use case] | [Follow-up] |
| [Industry-specific trigger 3] | [Use case] | [Follow-up] |

---

## Post-Call Debrief Template

### Pain Points Surfaced

| Pain (in their words) | Hours/week | Cost impact | Use case | Level |
|---|---|---|---|---|
| "[Exact quote]" | [X] | $[Y]/week | [Voice agent / automation / etc.] | [1/2/3] |

### ROI Estimate

**Direct cost savings:** [Hours saved/week] x [hourly rate] x 52 = $[annual]
**Hire avoidance:** [Roles] x [monthly cost] x 12 = $[annual]
**Revenue uplift (conservative):** [Reallocated hours] x [revenue value] x 50% = $[annual]
**Total annual value:** $[sum]
**Recommended retainer:** $[amount]/month (should be well below the floor)

### Follow-Up Email Draft

> Hey [Name],
>
> Thanks for the conversation today. Here's what I heard:
>
> [2-3 sentences recapping their pain in their exact words]
>
> Based on that, I see 2-3 specific opportunities:
> 1. [Opportunity 1, brief, with estimated value]
> 2. [Opportunity 2]
> 3. [Opportunity 3]
>
> I'll put together a more detailed breakdown and come back to you with options. Does [specific day] work to reconnect?
>
> Thanks,
> Jay

### Recommended Next Step

- **If strong fit, high urgency:** Propose retainer ($10-15K/month) on next call
- **If interested but cautious:** Propose assessment ($5-10K one-time) as stepping stone
- **If interested but not ready:** Schedule follow-up in 2-4 weeks, add to nurture pipeline
- **If not a fit:** Thank them, ask for referrals to other business owners

---

## Key Numbers to Reference on Calls

- 78% of jobs go to the first company to respond
- 20-30% of home services leads lost to slow follow-up
- 35-40% of calls arrive outside business hours
- 5-minute response = 9x higher conversion rate
- Average home services company can recover $5-15K/month with AI
- AI voice agent: < $1/hr vs $15-20/hr answering service
- Estimate follow-up sequences recover 20-30% of ghosted quotes

---

## Rules

- Never solution on the first call. Discovery closes the deal, not demos.
- Get at least one dollar figure or time figure attached to each pain point.
- Ask "what happens next?" at least 5 times. Real pain is 3-4 steps deep.
- Silence is fine. Ask a question, then wait.
- Repeat their words back to them. It signals you're listening.
- Every call ends with a scheduled next step.
- Record every call. Feed transcript to Claude for analysis after.

---

## Voice Rules for All Output

- Short paragraphs (1-2 sentences, 3 max)
- Contractions always
- No em dashes. Use commas, periods, or parentheses.
- Specific numbers over vague claims
- Lead with the problem, then the solution
- Banned words: delve, realm, harness, unlock, tapestry, paradigm, cutting-edge, revolutionize, landscape, leverage, synergy, innovative, game-changer, seamless, optimize, scalable, robust, breakthrough, empower, streamline, elevate, transformative, frictionless, utilize, supercharge
