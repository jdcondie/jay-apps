# AI Implementation Consulting Playbook

> **The opportunity:** Every small business right now is AI curious, AI hungry, and AI clueless at the same time. That gap is the business. This is the SMMA moment, except the market is bigger and the barrier to entry is lower.

* **Essential insights:**
  * **The model is proven:** Social media marketing agencies printed money for years on the same premise. Businesses knew social mattered. Didn't know how to use it. Someone bridged the gap. That's this.
  * **The timing is now:** Most business owners are overwhelmed and don't know where to start. They don't have Twitter. They don't have a nerd network. They need someone to show them.
  * **Niche down fast:** Do it once for one dentist. Then do it for 50 dentists. Same audit, same use cases, same implementation. Different name on the door.

---

## Phase 1: Build Your Foundation

*Before you sell anything, you need enough working knowledge to run an audit and demo something live. This takes nights and weekends, not a degree.*

### What to learn

* **Prompting:** How to extract useful outputs from Claude, ChatGPT, and Grok for business use cases.
* **Voice agents:** How they work, what platforms build them (Bland, Synthflow, Vapi), and how to connect them to a calendar.
* **Vibe coding basics:** Enough Replit or similar to build a simple working tool in a meeting.
* **The demo method:** Practice building live in front of someone. Speed matters. The close happens when they see something real appear in 10 minutes.

### What not to do first

* Don't get an LLC. Don't build a website. Don't spend money on tools.
* Find customers before you build anything. The harder task is always demand, not fulfillment.

---

## Phase 2: Get in the Room

*Two proven entry paths. Choose based on where you're starting from.*

### Path A: The Seminar (Chris Corner method)

*Best if you have no warm network and need volume.*

Step 1. **Contact your local Chamber of Commerce**
   *Offer to give a free AI tutorial. Prompting basics, vibe coding, what AI can do for a business. Free, no pitch.*

Step 2. **Bring someone with a clipboard**
   *Sign interested attendees up for a free AI audit at the end of the session.*

Step 3. **Run the audit as the second foot in the door**
   *By this point you're the only AI person they know. The close is close to inevitable.*

### Path B: The Demo (MFM method)

*Best if you have one warm business relationship to start with.*

Step 1. **Get one meeting with a business owner you know**
   *No pitch. Frame it as: "I want to show you something that might be useful."*

Step 2. **Run the live demo in the meeting**
   *Open Claude. Prompt: "I'm a [business type]. This is my business. Give me 10 ways I should be using AI." Pick one output. Prompt: "Give me the prompt to build use case #1." Throw it into Replit or Perplexity Computer. Show them the working tool.*

Step 3. **Let the reaction close the deal**
   *The shopping center owner's response: "Can we do a call today? What the hell just happened?" That's the close.*

---

## Phase 3: The Audit Framework

*What you're looking for in every audit. Find 2 to 3 high-value use cases, not 10.*

### Discovery call discipline

**The first call is discovery only. No solutioning.**

As soon as you start prescribing, discovery stops. The goal of the first call is to surface monetizable problems, not demonstrate your knowledge. Open with sentiment before substance:

* "Where are you personally with AI right now?"
* "What have you already tried?"
* "What excites or concerns you about it?"

Then move into workflow mapping. Ask these in sequence until you hit friction:

* What do you do 10 to 20 times a week that's repetitive and information-dependent?
* Where does your team spend time on things that follow a pattern?
* Where do you lose leads or customers because of slow response times?
* What data do you have sitting somewhere that nobody's doing anything with?
* What happens next? Who touches it? How long does that step take?

Close the call with: *"Let me synthesize what I heard and come back with options."* Never demo, whiteboard, or promise outcomes on the discovery call.

### Dual-track discovery (for mid-market audits)

For companies with 50+ employees, a single discovery call with the CEO misses half the picture. Run two separate interview tracks to surface the gap between what leadership believes and what the frontline experiences.

**Track 1: Stakeholder interviews (the 30,000-foot view)**
Target the CEO, department heads, and process owners. Focus on goals, KPIs, strategic pain, and how success is measured.

* "What are the main goals your team is responsible for this quarter?"
* "Where do you see the biggest bottlenecks or delays?"
* "If you had a magic wand, what one problem would you solve overnight?"
* "How does your team generally respond to new technology?"

**Track 2: End-user interviews (the ground-level reality)**
Target the people doing the actual work, 3 to 5 interviews at 30 to 45 minutes each. Focus on daily tasks, step-by-step workflows, tool frustrations, and where time disappears.

* "Walk me through a typical day in your role."
* "Which part of [specific task] is the most manual or time-consuming?"
* "What information do you need to find or reference, and where do you get it from?"
* "If you had an assistant, what tasks would you hand off immediately?"

**Why two tracks matter:** The gap between these perspectives is where the highest-value opportunities hide. Leadership often underestimates how much time frontline staff spend on workarounds. End-users often can't articulate the strategic cost of their friction. Your job is to connect both layers.

For smaller engagements (under 50 employees), a single CEO/owner discovery call is sufficient. Scale the interview depth to the engagement size.

### The "No Solution" rule and transcript method

If a client presses you for a solution during discovery, use this script: *"That's a great question. There are 2 or 3 tools that could handle that, but I don't want to give you a generic answer. I want to go away, test them against your specific workflow, and come back with the right one in the report. Sound good?"*

This makes you look thoughtful, not unprepared. It also protects the value of the deliverable.

**Record every audit call.** Use Fireflies.ai (free tier) or Google Meet's built-in recording. You are not taking notes during the call, you are listening. The transcript becomes your raw material.

After the call, feed the full transcript into Claude with this frame: *"You are my senior consultant partner. Here is the transcript from a discovery call with [business type]. Analyze the business, identify the top friction points, quantify the time and cost impact where possible, and recommend investigation areas for the audit report."*

This takes 30 minutes. You get back a full business snapshot, the exact quotes that prove the problem, and a research direction for each opportunity. Reports that used to take 4 to 5 hours now take 90 minutes, and the quality is higher because you're working from verbatim client language.

### Solution tiers (Level 1 / 2 / 3)

Not every problem needs a custom build. Scope each opportunity to the lowest viable level before escalating.

| Level | What It Is | When to Use |
|---|---|---|
| **Level 1 — Native AI** | Using built-in AI features (ChatGPT, Claude) to save time immediately | Fast wins, visible productivity gains. Start here always. |
| **Level 2 — AI + Automation** | Connecting tools (Zapier, Make) with AI in the loop | 80% of the value at a fraction of the cost. Covers most use cases. |
| **Level 3 — Custom Systems** | Vibe-coded apps, custom agents, full workflow orchestration | Only when Levels 1 and 2 are genuinely insufficient. |

**Rule:** Start at Level 1. Escalate only when the client has exhausted the lower tier and the ROI justifies the build complexity.

### Solution Brief template

Every opportunity surfaced in discovery gets captured in a Solution Brief before any work begins. This makes your process look systematic and gives leadership a comparable, prioritizable backlog.

| Field | What to Fill In |
|---|---|
| Problem | One sentence description of the pain |
| Current workflow | Step-by-step how it works today |
| Time and cost today | Hours per week, people involved, dollar estimate |
| Stakeholders | Who owns this process |
| Solution level | 1, 2, or 3 |
| Estimated ROI | Time saved, hire avoided, revenue recovered |

### The Ops Canvas and Opportunity Matrix

Solution Briefs capture individual opportunities. The Ops Canvas and Opportunity Matrix rank and sequence them visually for the CEO. This is what makes a $10K+ audit feel like a $10K+ audit.

**Step 1: Build the Ops Canvas.** Map the client's core operations into three engines: Acquisition (how they find and sign customers), Delivery (how they deliver their product or service), and Support (how they handle post-sale issues). Use the interview data to plot each step. Tag steps that are time sinks (highly manual, repetitive, high hours) or quality risks (prone to human error, inconsistent output).

**Step 2: Build the Opportunity Matrix.** Take every tagged item from the Ops Canvas and plot it on a 2x2 grid. X-axis is business impact (low to high). Y-axis is implementation effort (low to high). This creates four quadrants:

* **Quick Wins (low effort, high impact):** Your #1 priority. These are the "no-brainer" projects that deliver visible value fast. Start here always. This is what earns trust and justifies the retainer.
* **Big Swings (high effort, high impact):** Larger, more transformative projects. These become the retainer roadmap. Position them as: "Once the Quick Wins are in place, these are what we tackle next."
* **Nice-to-Haves (low effort, low impact):** Small improvements. Good for adding extra value but never the focus of a proposal.
* **Deprioritize (high effort, low impact):** Time and money pits. Identifying and actively avoiding these is part of the value you provide.

**Step 3: Validate with the client.** Before finalizing the report, review the matrix with your key stakeholder in a collaborative session. Ask: "Which of these Quick Wins resonates most with the challenges your team described?" and "Are there any team dynamics or hidden steps that could complicate this?" This co-creation step builds trust and means you're presenting a plan you've already agreed on together.

**Why this matters:** The matrix gives the CEO a single visual that makes the entire audit tangible. It creates a natural roadmap: Quick Wins first, Big Swings on the retainer. It also makes deprioritization a deliverable, which is valuable. Knowing what not to do saves as much money as knowing what to build.

### ROI quantification method

When a client mentions a painful task during discovery, quantify it immediately. This is the difference between a "good" audit and one that closes.

**The three questions to ask every time:**
* "Roughly how many hours a week do you spend on that?"
* "Who is doing that task? Is it you, or a junior admin?"
* "Ballpark, what's the hourly cost for that role? Are we talking $20/hr or $100/hr?"

**Direct cost savings formula:**
Hours saved per week x average hourly rate = weekly savings. Weekly savings x 52 = annual savings. Annual savings / your implementation cost = ROI multiple.

**Revenue uplift formula (use conservatively):**
Estimate what percentage of saved time can be reallocated to revenue-generating work (use 50% as a conservative baseline). Multiply reallocated hours by the revenue value of that activity. Example: if a sales rep gets back 5 hours/week and each hour of selling is worth $500, that's $2,500/week or $130K/year in potential revenue uplift.

Present both numbers in the audit report. Cost savings are the floor. Revenue uplift is the ceiling. The retainer price should sit well below the floor.

### Universal high-value use cases

| Use Case | Who It's For | What It Does | Market Pricing Reference |
|---|---|---|---|
| Voice agent (inbound) | Any business that takes phone calls | Answers phone, books appointments, handles FAQs. Never misses a call. | $1,500 to $12,500 setup + monthly retainer |
| Voice agent (outbound) | Real estate, B2B, charities | Mass cold calling, lead qualification, appointment setting at scale | $2,000 to $10,000/month or per-appointment pricing |
| AI lead magnet | Agencies, e-commerce, B2B | Interactive tool on website that generates personalized reports, qualifies leads, captures detailed data | $2,500 to $7,200 |
| Lead/data tracker | Real estate, retail, B2B sales | Scrapes public sources, flags signals, builds hit lists automatically | $1,300 to $2,500 setup + per-lead fees |
| Text-based customer support | E-commerce, property mgmt, SaaS | 24/7 chatbot across website, WhatsApp, SMS. Handles FAQs, order tracking, booking. | $2,500 to $15,000 |
| Personalized outreach | Any B2B with a sales motion | AI-researched, hyper-personalized emails and sequences at 10x the volume of manual outreach | $1,300 to $7,200 or per-lead pricing |
| Internal knowledge retrieval | Manufacturing, legal, healthcare | AI agent that answers employee questions using company docs, SOPs, and policies | $5,000 to $20,000/year |
| Sales call analysis | Any business with a sales team | Records, transcribes, scores, and coaches on every sales call automatically | $550 to $5,000 |
| Content repurposing | Creators, agencies, coaches | Turns one long-form piece into platform-specific content for 5+ channels | $2,000 to $4,000 or $25 to $1,800/month |
| AI recruitment screening | Any business hiring at volume | Automated resume scoring, pre-screening questionnaires, candidate ranking | $580 to $3,000 + $500/month |
| Lease/contract monitor | Real estate, legal, property mgmt | Uploads all docs, flags expiration dates, cross-references health signals | Custom scoping |
| Communication coach | Any business with a team | Reads Slack/email, advises on how to communicate with specific personalities | Custom scoping |
| Custom CRM | Mid-size businesses on expensive SaaS | Replaces $4K/month tools with a custom-built alternative for $15K upfront | $15,000 setup |

*Pricing references are based on real closed deals in the AI agency market. Use as benchmarks for scoping, not as fixed rates.*

---

## Phase 4: Pricing and Packaging

*A conversion ladder, not a binary ask. Meet the client where they are and move them up.*

### The Offer Stack

The biggest pricing mistake is making the retainer the only option. Some prospects need a stepping stone. The offer stack gives you multiple conversion points so a "not yet" becomes a "let's start here."

**Tier 1: AI Assessment / Audit ($5,000 to $15,000, one-time)**
The diagnostic that shows the opportunity. Includes discovery interviews, Ops Canvas, Opportunity Matrix, ROI calculations, and a live presentation of findings. This is the foot in the door. Most clients who see the report ask: "Can you just set this up for me?" That question is the conversion to Tier 2.

**Tier 2: Implementation Sprint ($5,000 to $15,000, one-time)**
Pick the top 1 to 2 Quick Wins from the audit and build them. Focused, time-boxed, visible ROI within 30 days. This proves you can deliver before they commit to ongoing work.

**Tier 3: Training and Education Package ($3,000 to $5,000, one-time)**
Structured AI training for the team. Covers prompt engineering for their specific roles, vibe coding basics, and workflow-specific tool adoption. Can be sold standalone or bundled with the sprint.

**Tier 4: Fractional CAIO Retainer ($10,000 to $25,000/month)**
The full STE model. Strategy, Transformation, Education on a monthly basis. This is the primary revenue driver, but it converts better when the client has already experienced Tiers 1 through 3.

**Tier 5: Dev Partner Commissions ($2,000 to $10,000 per referral)**
For Level 3 builds that require dedicated development beyond your scope, partner with vetted builders and take a referral cut. You stay in the strategy seat. They handle the technical execution. The client gets a single point of contact (you).

**How the stack works in practice:** A Chamber of Commerce seminar lead books a free discovery call. You sell the $10K audit. The audit surfaces 3 Quick Wins and 2 Big Swings. You sell a $10K implementation sprint for the Quick Wins. The sprint delivers visible ROI. You propose the $15K/month retainer to tackle the Big Swings and ongoing optimization. Total first-year value from one lead: $190K+.

### Small business model (barber shop model)

* **Setup fee:** $2,500
* **Monthly retainer:** $250
* **Rule of thumb:** Monthly = 10% of setup fee
* **Pitch:** "Make more money. Never talk on the phone again." (Voice agent pitch)
* **Why it works:** Copy/paste the same agent, swap name, hours, and calendar connection.

### Mid-market model (John Cheney model)

* **Setup fee:** $15,000
* **Monthly retainer:** $1,500 to $25,000/month
* **Rule of thumb:** Same 10% ratio
* **What you're building:** Custom vibe-coded apps on Replit. CRMs, workflow tools, communication systems.
* **Why it works:** Immediate ROI. They stop paying $4K/month for a tool that doesn't fit. Yours fits perfectly.

**Note:** The small business tier and mid-market tier serve different client profiles. The Offer Stack above maps to the mid-market model. For small business clients, the path is simpler: demo → setup → monthly retainer.

---

## Phase 5: Delivery — The Fractional CAIO Model

*What happens after the contract is signed.*

### Month 1: CEO Dashboard (quick win)

Build the CEO a single dashboard connected to all their existing systems, CRM, accounting, project management. Make it interactive with AI so they can ask questions and pull custom reports. This is the first "wow" moment. It takes a few days to build. The perceived value is enormous.

### Month 1 to 2: Process Automation (saving money)

Identify the 3 to 5 most time-consuming manual processes and automate them. Common targets: CRM data entry, lead qualification, reporting, scheduling, and follow-up sequences. Each automation you build saves visible hours every week, which reinforces the ROI of the retainer.

### Ongoing: The AI Operator

**Identify and develop an internal champion inside the client's organization.** This is the highest-leverage move in the entire engagement.

The AI Operator is typically a curious, high-agency employee with strong communication skills, not necessarily technical. Their job is to own AI discovery, experimentation, and adoption inside the company. Train them to:

* Run discovery conversations with their own team
* Capture new AI opportunities using the Solution Brief format
* Evaluate whether an idea fits Level 1, 2, or 3
* Reduce their reliance on you for tactical execution over time

**Why this matters operationally:**

* You stop being the bottleneck for every new request
* The client becomes self-sufficient but still needs you for strategy and escalation
* A coach who trained their team is much harder to fire than a consultant who just built a tool
* Engagements become sticky because your methodology is embedded, not just your deliverables

The goal is not dependency. Clients who grow in capability stay longer and refer more.

### Ongoing: Training and upskilling

Run monthly or bi-weekly group training sessions. Start with something fun, have the team build something in Replit. It breaks fear and builds excitement. Then transition to practical skills: using ChatGPT for their specific role, vibe coding simple internal tools, writing better with AI, analyzing data, generating reports. Target 20% productivity gain across all staff on payroll.

### Ongoing: Strategy and competitive intelligence

Monthly CEO presentation: what's new in AI that affects their industry, what competitors are doing, and what the next quarter's roadmap looks like. AI evolves weekly. You'll never run out of material. This is the layer that keeps the CEO engaged and feeling ahead of the curve.

### Adoption personas (who you'll encounter)

When rolling out AI to a team, expect these profiles and manage them accordingly:

| Persona | Risk | Your Move |
|---|---|---|
| Enthusiastic Emma | Burns out fast | Guide and support, don't let her sprint alone |
| Curious Chris | Gets overwhelmed | Give structured learning paths |
| Traditionalist Tim | Resistant to change | Show direct relevance to his specific role |
| Cautious Clara | Fearful of replacement | Address concerns directly, early |
| Principal Pat | Skeptical of ROI | Lead with data, prove before expanding |

---

## Phase 6: Scale the Niche

*The med spa model. One solution, replicated at volume.*

### The framework

1. **Pick one vertical.** Dentists, med spas, HVAC companies, barber shops, retail property owners. Doesn't matter which. Pick one.
2. **Find the universal pain point.** Every business in that vertical has the same problem. Find it.
3. **Build one templated solution.** One tool, one voice agent, one tracker. Built once, deployed many times.
4. **Price for volume.** $50 to $100/month across 500 to 1,000 clients = $50K/month from a single build.

### Example: Med spas

* **Universal pain point:** Curious customers who don't convert because they can't visualize results.
* **Solution:** Website tool that scans the customer's face, shows relevant before/afters, confirms candidacy.
* **Market:** 10,000+ med spas, all with the same need.
* **Revenue potential:** 1,000 clients x $50/month = $50K/month.

---

## The Business Model Shift You're Riding

*This is the structural reason the timing is right.*

Service businesses used to have 40 to 50% gross margins and low multiples because they needed people to scale. One person could only do so much.

AI changed the ratio. One person can now do what five to seven used to do. Gross margins move toward 70 to 75%. The more internal tooling you build, the more clients you serve without adding headcount.

PE firms have already noticed. They're shifting budget from buying SaaS companies to buying AI-enabled service businesses and valuing them at software multiples.

**You're not just building a consulting business. You're building a service-as-software company.**

---

## Entry Point Decision Matrix

| Your Starting Position | Best Path | First Move |
|---|---|---|
| No network, no warm leads | Seminar (Chamber of Commerce) | Book a date, prepare a 45-min AI tutorial |
| 1 warm business relationship | Live demo (MFM method) | Get a meeting, run the demo in the room |
| Already in a niche (marketing, ops, etc.) | Niche audit + template | Build one use case for one client, replicate |
| Technical background | Mid-market vibe-coded apps | Target 10 to 50 person companies, $15K setup |

---

## Decisive Move

Pick one business owner you already know. Get a meeting. Open Claude in front of them and prompt: *"I'm a [their business type]. Give me 10 ways I should be using AI."* Build one of the outputs live. Watch what happens.

That reaction is your market signal. If they lean forward, you have a business.
