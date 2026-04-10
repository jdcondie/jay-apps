const workflowData = [
  {
    id: "after-hours-leads",
    category: "lead",
    emoji: "🌙",
    name: "After-Hours Lead Capture",
    preview: "Never miss a lead after closing time",
    level: 2,
    problem: "Leads come in outside business hours and get a voicemail. By the time someone calls back, the prospect has already moved on — or booked with a competitor who responded first. Studies show a 5-minute response window dramatically outperforms a next-day callback.",
    discoveryQs: [
      "What happens when someone calls or submits a form after 5pm?",
      "How many leads do you estimate come in outside business hours each week?",
      "What's your typical callback time for a new inquiry?"
    ],
    steps: [
      { label: "Trigger", detail: "New lead submits form or calls after hours" },
      { label: "AI responds instantly", detail: "Text or voice message fires within 60 seconds acknowledging the inquiry" },
      { label: "Qualify via SMS", detail: "AI sends 2–3 qualifying questions via text to gather job details" },
      { label: "Book the appointment", detail: "AI checks calendar availability and books directly or sends a link" },
      { label: "CRM entry created", detail: "Lead, answers, and booking land in CRM automatically — zero manual entry", isLast: true }
    ],
    roi: { time: "6–10 hrs/week", cost: "$0 in missed leads", hire: "Replaces after-hours staff", speed: "< 60 sec response" },
    pitch: "That person who called at 8pm on Friday? Right now they're either booked with you automatically or they already hired your competitor. This fixes that permanently.",
    tools: [
      { badge: "trigger", name: "Bland / Synthflow / Vapi", desc: "Voice agent intercepts calls 24/7" },
      { badge: "ai", name: "Claude / GPT", desc: "Qualifies lead via SMS conversation" },
      { badge: "output", name: "Cal.com / Calendly", desc: "Books appointment directly to calendar" },
      { badge: "output", name: "CRM (HubSpot / GoHighLevel)", desc: "Auto-creates contact and deal record" }
    ]
  },
  {
    id: "appointment-booking",
    category: "lead",
    emoji: "📅",
    name: "Appointment Booking & Reminders",
    preview: "Eliminate back-and-forth scheduling friction",
    level: 2,
    problem: "Scheduling still happens over the phone or by email — multiple touchpoints to confirm a single appointment. No-shows happen because reminders are manual and inconsistent. Staff spend 30–60 minutes a day just managing the calendar.",
    discoveryQs: [
      "Walk me through how an appointment gets booked today — start to finish.",
      "How many no-shows do you average per week? What does that cost you?",
      "Who handles scheduling? How much of their time goes to it?"
    ],
    steps: [
      { label: "Lead confirms interest", detail: "Via phone, form, chat, or reply to a sequence" },
      { label: "AI sends booking link or books direct", detail: "Synced to real calendar with buffer times and capacity rules built in" },
      { label: "Confirmation fires immediately", detail: "Email + SMS confirmation with job details, address, and what to expect" },
      { label: "Reminder sequence runs automatically", detail: "24-hour reminder and 2-hour reminder — no manual send" },
      { label: "No-show follow-up triggered", detail: "If they miss the appointment, AI reschedules or sends rebooking link", isLast: true }
    ],
    roi: { time: "3–5 hrs/week", cost: "Eliminate no-show revenue loss", hire: "Replaces manual booking admin", speed: "Zero back-and-forth" },
    pitch: "Every no-show is a hole in your revenue. An automated reminder sequence cuts that by 60–80%. And your front desk gets back 30 minutes a day they're currently spending on the phone.",
    tools: [
      { badge: "trigger", name: "Zapier / Make", desc: "Detects booking confirmation and fires sequence" },
      { badge: "ai", name: "Cal.com / Acuity", desc: "Intelligent scheduling with rules and buffers" },
      { badge: "output", name: "Twilio / SMS", desc: "Automated reminder and follow-up texts" },
      { badge: "output", name: "Email (Klaviyo / Mailchimp)", desc: "Confirmation and reminder emails" }
    ]
  },
  {
    id: "lead-followup-sequence",
    category: "lead",
    emoji: "🔁",
    name: "Lead Follow-Up Sequences",
    preview: "Automate 5-touch follow-up for cold or unresponsive leads",
    level: 2,
    problem: "Leads come in, get one call, and if they don't answer — they're forgotten. The team is too busy to manually follow up 4 or 5 times. Most deals are won on the 5th to 8th contact. Most teams stop after 1 or 2.",
    discoveryQs: [
      "When a lead doesn't respond to the first call, what happens next?",
      "How many times does your team follow up before moving on?",
      "What percentage of your leads would you say fall through the cracks?"
    ],
    steps: [
      { label: "Lead goes cold or no-shows", detail: "Trigger: no response after X hours, or appointment missed" },
      { label: "Sequence initiates automatically", detail: "Day 1: text. Day 2: email. Day 4: call task assigned to rep. Day 7: final follow-up" },
      { label: "AI personalizes each touchpoint", detail: "Uses lead name, business type, and inquiry details in every message" },
      { label: "Response routes to human", detail: "The moment they reply, the sequence pauses and routes to the right rep" },
      { label: "Non-responders tagged and archived", detail: "After sequence completes, lead is tagged for future reactivation", isLast: true }
    ],
    roi: { time: "4–8 hrs/week", cost: "Recover 20–40% of dead leads", hire: "Replaces manual follow-up effort", speed: "Fires within minutes of trigger" },
    pitch: "Your sales team is leaving money in the inbox right now. Every lead that didn't get a 5th touchpoint is a potential deal that went to your competitor. This runs the sequence automatically — they only pick up the phone when someone responds.",
    tools: [
      { badge: "trigger", name: "CRM / Zapier", desc: "Detects no-response status and fires workflow" },
      { badge: "ai", name: "Claude / GPT + template", desc: "Personalizes each message with lead context" },
      { badge: "output", name: "GoHighLevel / ActiveCampaign", desc: "Manages multi-step sequence across SMS + email" },
      { badge: "output", name: "Rep task queue", desc: "Assigns manual call tasks at the right moment" }
    ]
  },
  {
    id: "faq-handling",
    category: "lead",
    emoji: "💬",
    name: "FAQ & Customer Inquiry Handling",
    preview: "Handle repetitive customer questions automatically",
    level: 1,
    problem: "Your team answers the same 10 to 15 questions every single day — pricing, availability, service areas, what to expect. These calls take 3–5 minutes each and consume hours of staff time weekly. Many come in after hours and get no response.",
    discoveryQs: [
      "What are the top 5 questions customers ask before booking or buying?",
      "How many calls or messages per day would you say are just basic questions?",
      "Who handles those — a dedicated person or whoever picks up?"
    ],
    steps: [
      { label: "Customer contacts via phone, chat, or SMS", detail: "Inbound channel detected and routed to AI agent" },
      { label: "AI identifies question type", detail: "Matches to knowledge base: pricing, availability, service area, process, etc." },
      { label: "AI answers using business-specific data", detail: "Not generic internet answers — your actual prices, policies, and process" },
      { label: "Escalation trigger fires when needed", detail: "Complex or complaint-type messages automatically routed to human" },
      { label: "Conversation logged to CRM", detail: "Full transcript and outcome recorded automatically", isLast: true }
    ],
    roi: { time: "5–12 hrs/week", cost: "Reduce inbound call volume 40–60%", hire: "Frees receptionist / admin time", speed: "Instant response 24/7" },
    pitch: "Right now someone on your team is answering the same questions about price and availability they answered yesterday. We build a knowledge base around your exact business and let AI handle that — so your people only pick up when it's a real conversation worth having.",
    tools: [
      { badge: "trigger", name: "Vapi / Bland / Synthflow", desc: "Handles inbound phone calls" },
      { badge: "ai", name: "Claude / GPT with knowledge base", desc: "Answers using your specific business info" },
      { badge: "output", name: "Website chatbot (Tidio / Intercom)", desc: "Handles text-based inquiries on your site" },
      { badge: "output", name: "CRM log", desc: "All conversations recorded and tagged" }
    ]
  },
  {
    id: "crm-updates",
    category: "admin",
    emoji: "🗂️",
    name: "CRM Data Entry Automation",
    preview: "Stop entering data manually after every call",
    level: 2,
    problem: "After every call, visit, or meeting, someone has to manually update the CRM. It either doesn't happen, happens late, or happens inconsistently. Reps hate it. Data quality suffers. Leadership can't trust the numbers.",
    discoveryQs: [
      "How does your team currently log call notes or job updates — when does that actually happen?",
      "How confident are you that your CRM reflects what's actually going on in the pipeline?",
      "What tool does your team use to communicate internally — Slack, text, something else?"
    ],
    steps: [
      { label: "Rep finishes call or visit", detail: "Logs a quick update in Slack, a form, or via voice memo" },
      { label: "Zapier detects the new entry", detail: "Watches the Slack channel or form submission for new input" },
      { label: "AI extracts structured data", detail: "Pulls: customer name, status, next step, notes, dollar amount from the raw message" },
      { label: "CRM record updated automatically", detail: "Correct fields populated in HubSpot, Salesforce, or GoHighLevel with zero manual entry" },
      { label: "Confirmation sent to rep", detail: "Quick Slack message confirms what was logged — rep can correct if needed", isLast: true }
    ],
    roi: { time: "8–15 hrs/week across team", cost: "Eliminate CRM data quality issues", hire: "Frees reps for actual selling", speed: "Real-time updates" },
    pitch: "Your CRM is only as good as what gets entered into it. Right now your reps are either logging late or not at all. We set it up so they type one line in Slack and the CRM updates itself. No friction. No behavior change.",
    tools: [
      { badge: "trigger", name: "Slack / Google Form / Voice", desc: "Rep input method — easiest possible friction" },
      { badge: "ai", name: "Claude / GPT via Zapier", desc: "Parses unstructured input into structured fields" },
      { badge: "output", name: "HubSpot / Salesforce / GoHighLevel", desc: "Auto-populates the right fields in the CRM" },
      { badge: "output", name: "Slack confirmation", desc: "Rep gets immediate feedback on what was logged" }
    ]
  },
  {
    id: "proposal-generation",
    category: "admin",
    emoji: "📄",
    name: "Proposal & Estimate Generation",
    preview: "Turn a short intake form into a professional proposal",
    level: 2,
    problem: "Writing proposals takes 45 minutes to 2 hours each time. The format is mostly the same — only the details change. Sales reps start from scratch or copy an old one and make mistakes. Slow proposals mean lost deals.",
    discoveryQs: [
      "How long does it take your team to put together a proposal or estimate after a discovery call?",
      "Is there a standard format you use, or does it vary by rep?",
      "How quickly does a proposal need to go out to stay competitive in your market?"
    ],
    steps: [
      { label: "Discovery call ends", detail: "Rep fills a short intake form: client name, scope, pricing tier, key details" },
      { label: "AI pulls the proposal template", detail: "Selects the right template based on job type or service line" },
      { label: "AI customizes with client context", detail: "Populates name, scope, pricing, timeline, and relevant case studies or proof points" },
      { label: "Draft sent to rep for review", detail: "Takes under 5 minutes. Rep makes minor edits if needed" },
      { label: "Proposal sent and tracked", detail: "Sent via DocuSign or PDF with open-tracking enabled", isLast: true }
    ],
    roi: { time: "2–4 hrs/day across sales team", cost: "Send proposals 10x faster", hire: "No extra proposal coordinator needed", speed: "Draft ready in under 5 min" },
    pitch: "Speed kills in sales. Every hour between the call and the proposal is a window for your competitor to close them. We cut that from 90 minutes to under 5. Same quality. Faster delivery. Better close rate.",
    tools: [
      { badge: "trigger", name: "Intake form (Typeform / Jotform)", desc: "Rep fills quick post-call form" },
      { badge: "ai", name: "Claude / GPT", desc: "Customizes template with client-specific content" },
      { badge: "output", name: "Google Docs / Word / DocuSign", desc: "Generates clean, formatted proposal" },
      { badge: "output", name: "Email tracking", desc: "Notifies rep when prospect opens the proposal" }
    ]
  },
  {
    id: "invoice-followup",
    category: "admin",
    emoji: "💳",
    name: "Invoice Follow-Up & Collections",
    preview: "Automated payment reminders that escalate without awkwardness",
    level: 2,
    problem: "Chasing unpaid invoices is uncomfortable, inconsistent, and time-consuming. Someone has to manually track due dates and decide when to follow up. Late payments hurt cash flow and the conversation is awkward for everyone.",
    discoveryQs: [
      "What's your current average time to collect on an invoice after sending it?",
      "Who owns collections follow-up right now — is there a consistent process?",
      "What percentage of invoices would you say come in late?"
    ],
    steps: [
      { label: "Invoice sent to client", detail: "Via your accounting or billing system (QuickBooks, Wave, etc.)" },
      { label: "Due date monitored automatically", detail: "System watches for payment status — no manual tracking needed" },
      { label: "Reminder sequence fires on schedule", detail: "Day of: friendly reminder. Day 3 overdue: second notice. Day 7: escalated tone. Day 14: formal notice" },
      { label: "Payment detected and sequence stops", detail: "The moment payment clears, all future reminders are cancelled automatically" },
      { label: "Unresolved flagged for human review", detail: "30+ days overdue alerts are escalated to owner or billing manager", isLast: true }
    ],
    roi: { time: "2–4 hrs/week in admin", cost: "Reduce average collection time by 30–50%", hire: "No dedicated collections staff needed", speed: "Never miss a due date again" },
    pitch: "Right now someone on your team is awkwardly writing reminder emails and keeping a spreadsheet of who owes what. This runs the whole thing automatically — and the reminders are professionally worded so there's no relationship damage.",
    tools: [
      { badge: "trigger", name: "QuickBooks / FreshBooks / Stripe", desc: "Detects invoice status and due dates" },
      { badge: "ai", name: "Zapier + email templates", desc: "Fires escalating reminder sequence" },
      { badge: "output", name: "Email / SMS", desc: "Automated payment reminders to client" },
      { badge: "output", name: "Owner alert", desc: "Flags 30+ day overdue for human intervention" }
    ]
  },
  {
    id: "reporting",
    category: "admin",
    emoji: "📊",
    name: "Automated Reporting for Leadership",
    preview: "Weekly business summaries without pulling a single number manually",
    level: 2,
    problem: "Leadership spends 3–6 hours a week pulling numbers from multiple systems, formatting them into a report, and emailing it out. The data is already in the systems — it just needs to be assembled and summarized. This is pure admin overhead.",
    discoveryQs: [
      "How do you currently get a read on how the business is performing each week?",
      "How long does it take to pull that together — and who does it?",
      "What data sources does it pull from — CRM, accounting, ops software?"
    ],
    steps: [
      { label: "Weekly trigger fires automatically", detail: "Scheduled every Monday morning or Friday afternoon — your choice" },
      { label: "AI pulls data from connected systems", detail: "Reads CRM, accounting, job management software via API or Zapier" },
      { label: "AI generates narrative summary", detail: "Not just numbers — actual sentences explaining what changed and why" },
      { label: "Report emailed to leadership", detail: "Clean, formatted summary in inbox before the work week starts" },
      { label: "Interactive version available on demand", detail: "CEO can ask questions directly to a dashboard — like talking to the data", isLast: true }
    ],
    roi: { time: "3–6 hrs/week saved", cost: "Eliminate report-building labor", hire: "No analyst or operations coordinator needed for reports", speed: "Ready every Monday, automatically" },
    pitch: "Your leadership team is spending hours every week assembling a report when the data already exists in your systems. We connect those systems and let AI write the summary. You get the report in your inbox every Monday without anyone touching it.",
    tools: [
      { badge: "trigger", name: "Zapier scheduled trigger", desc: "Fires on a set schedule automatically" },
      { badge: "ai", name: "Claude / GPT", desc: "Interprets data and writes human-readable summary" },
      { badge: "output", name: "Email to leadership", desc: "Clean formatted report delivered automatically" },
      { badge: "output", name: "Retool / custom dashboard", desc: "Interactive CEO dashboard for on-demand questions" }
    ]
  },
  {
    id: "job-scheduling",
    category: "ops",
    emoji: "🗓️",
    name: "Job Scheduling & Dispatch",
    preview: "Assign and notify field staff without manual coordination",
    level: 2,
    problem: "Dispatching jobs requires someone to check technician availability, match skills to the job, notify the tech, and confirm with the client — all manually. Scheduling conflicts, double-bookings, and late notifications are common.",
    discoveryQs: [
      "Walk me through how a new job gets scheduled and assigned to a technician — every step.",
      "How often do scheduling conflicts or double-bookings happen?",
      "How does the tech find out about a job? How does the client know who's coming?"
    ],
    steps: [
      { label: "New job confirmed and details logged", detail: "In the job management system or CRM" },
      { label: "AI checks technician availability and skills", detail: "Matches job type to available tech with the right certifications or experience" },
      { label: "Job assigned automatically", detail: "Tech receives notification via SMS, app push, or Slack with job address and details" },
      { label: "Client confirmation sent", detail: "Client gets automated message with tech name, photo, arrival window, and prep instructions" },
      { label: "Status updates flow automatically", detail: "On the way, arrived, completed — triggered by tech check-ins", isLast: true }
    ],
    roi: { time: "4–8 hrs/week in dispatch labor", cost: "Eliminate scheduling errors", hire: "Reduces dispatcher workload significantly", speed: "Instant assignment and notification" },
    pitch: "Your dispatcher is spending half their day on logistics that a system could handle in seconds. The same job that takes 10 minutes of phone calls and texts to coordinate can be assigned and confirmed in under 30 seconds.",
    tools: [
      { badge: "trigger", name: "ServiceTitan / Jobber / Housecall Pro", desc: "Job management system triggers the workflow" },
      { badge: "ai", name: "Zapier + scheduling logic", desc: "Matches job to available tech based on rules" },
      { badge: "output", name: "SMS / Slack", desc: "Tech receives job details instantly" },
      { badge: "output", name: "Client SMS / email", desc: "Auto-confirmation with tech details" }
    ]
  },
  {
    id: "status-updates",
    category: "ops",
    emoji: "📡",
    name: "Field-to-Office Status Updates",
    preview: "Eliminate the check-in call. Updates flow automatically.",
    level: 2,
    problem: "Field staff have to call or text the office to update job status. The office has to follow up if they don't hear back. Leadership has no real-time visibility into what's happening in the field. Communication gaps cause client complaints.",
    discoveryQs: [
      "How does your team in the field communicate status back to the office right now?",
      "How often does leadership have to chase someone for a status update?",
      "When a job is completed, what's the process for notifying the client?"
    ],
    steps: [
      { label: "Tech marks job status in app", detail: "Simple tap: En Route / On Site / Job Complete — takes 3 seconds" },
      { label: "Zapier detects status change", detail: "Monitors the job management system for updates in real time" },
      { label: "Office and leadership notified", detail: "Slack or dashboard updates automatically — no phone call needed" },
      { label: "Client notification fires on completion", detail: "Automated message: job done, summary of work, link to invoice or review request" },
      { label: "AI generates completion summary", detail: "Pulls job details and writes a professional service summary for the client record", isLast: true }
    ],
    roi: { time: "2–4 hrs/day across field + office", cost: "Eliminate coordination overhead", hire: "Reduces office admin burden", speed: "Real-time visibility for everyone" },
    pitch: "Right now your front office is playing telephone with your field team. We remove all of that — one tap on a phone triggers the whole chain: office knows, client knows, record is updated. Zero phone calls needed.",
    tools: [
      { badge: "trigger", name: "ServiceTitan / Jobber / custom app", desc: "Field tech updates job status" },
      { badge: "ai", name: "Zapier + Claude", desc: "Generates professional completion summary" },
      { badge: "output", name: "Slack", desc: "Real-time status visible to office and leadership" },
      { badge: "output", name: "Client SMS / email", desc: "Automated completion notification and review request" }
    ]
  },
  {
    id: "employee-onboarding",
    category: "ops",
    emoji: "🆕",
    name: "Employee Onboarding Automation",
    preview: "Consistent onboarding experience without the manual coordination",
    level: 2,
    problem: "Onboarding a new hire requires a manager to remember every step, manually send documents, schedule training, and follow up on completion. It's inconsistent, time-consuming, and the new employee often feels lost in the first two weeks.",
    discoveryQs: [
      "Walk me through what happens the day a new hire starts — who manages that process?",
      "How consistent is the onboarding experience across different hires or departments?",
      "How do you track whether a new employee has completed their training and paperwork?"
    ],
    steps: [
      { label: "New hire added to HR system", detail: "Trigger: new employee record created in HRIS or via form" },
      { label: "Automated welcome sequence fires", detail: "Email + Slack: welcome message, first-day logistics, what to expect" },
      { label: "Day-by-day task sequence activates", detail: "Day 1: paperwork. Day 2: system access. Day 3: training video 1. Week 2: check-in meeting booked" },
      { label: "AI chatbot answers questions", detail: "New hire can ask anything about policies, benefits, or processes via Slack bot — AI answers using your actual docs" },
      { label: "Completion tracked and reported", detail: "Manager gets weekly summary of what's done and what's outstanding", isLast: true }
    ],
    roi: { time: "5–10 hrs per new hire saved", cost: "Reduce new hire ramp time by 30–40%", hire: "No dedicated HR coordinator needed per hire", speed: "Consistent every time, zero drop-offs" },
    pitch: "Every inconsistent onboarding costs you a slower ramp and a more confused employee. We build this once and every new hire gets the same experience automatically — manager barely needs to touch it.",
    tools: [
      { badge: "trigger", name: "BambooHR / Rippling / Gusto", desc: "New employee record triggers the sequence" },
      { badge: "ai", name: "Claude with knowledge base", desc: "Answers new hire questions about policies and process" },
      { badge: "output", name: "Email / Slack sequence", desc: "Day-by-day onboarding task delivery" },
      { badge: "output", name: "Manager dashboard", desc: "Tracks completion status across all active new hires" }
    ]
  },
  {
    id: "inventory-reorder",
    category: "ops",
    emoji: "📦",
    name: "Inventory Monitoring & Reorder Alerts",
    preview: "Get alerted before you run out — not after",
    level: 2,
    problem: "Someone has to manually check stock levels, decide when to reorder, and draft a purchase order. This either happens too late (stockout) or too early (overstock tying up cash). The data to predict this perfectly already exists in the system.",
    discoveryQs: [
      "How do you currently know when you're about to run out of a key supply or product?",
      "How often do stockouts happen — and what does that cost you in downtime or lost sales?",
      "Who manages purchasing decisions right now, and how much time does it take?"
    ],
    steps: [
      { label: "Inventory level monitored daily", detail: "System checks stock against defined minimum thresholds each morning" },
      { label: "Reorder threshold hit", detail: "Trigger fires when any SKU drops below the minimum level" },
      { label: "AI calculates optimal reorder quantity", detail: "Based on current rate of use, lead time, and historical patterns" },
      { label: "Draft purchase order created", detail: "Formatted PO sent to manager for one-click approval — no manual drafting" },
      { label: "Order confirmed and delivery tracked", detail: "Expected arrival date logged and team notified", isLast: true }
    ],
    roi: { time: "3–5 hrs/week in manual tracking", cost: "Eliminate stockouts and overstock", hire: "No dedicated purchasing admin needed", speed: "Alert fires days before a problem" },
    pitch: "You're either running out of things unexpectedly or ordering too much and tying up cash. Both of those are data problems. This system watches your inventory daily and tells you exactly when to order and how much — before the problem hits.",
    tools: [
      { badge: "trigger", name: "Inventory system / Shopify / QBO", desc: "Monitors stock levels in real time" },
      { badge: "ai", name: "Claude / GPT via Zapier", desc: "Calculates reorder quantity and drafts PO" },
      { badge: "output", name: "Email / Slack alert", desc: "Manager receives approval request with one click" },
      { badge: "output", name: "Supplier email / portal", desc: "PO sent automatically on approval" }
    ]
  },
  {
    id: "lead-qualification",
    category: "sales",
    emoji: "🎯",
    name: "Lead Qualification & Scoring",
    preview: "Know which leads are worth calling before you pick up the phone",
    level: 2,
    problem: "Your sales team treats every inbound lead the same — calling tire-kickers and serious buyers with equal effort. Time is wasted on bad-fit prospects while high-intent leads don't get fast enough attention.",
    discoveryQs: [
      "What makes a lead a good fit versus a bad fit for your business?",
      "How does your team currently decide who to call first?",
      "What percentage of your inbound leads would you say are actually qualified?"
    ],
    steps: [
      { label: "New lead enters the system", detail: "From website form, ad, referral, or inbound call" },
      { label: "AI scores against ideal client criteria", detail: "Checks: business size, service area, budget signals, urgency indicators, fit criteria" },
      { label: "Lead tagged hot / warm / cold", detail: "Automatically in CRM — no manual decision needed" },
      { label: "Hot leads routed to sales instantly", detail: "SMS or Slack alert fires to the right rep with lead context and score" },
      { label: "Cold leads enter nurture sequence", detail: "Not discarded — fed into long-term follow-up automation", isLast: true }
    ],
    roi: { time: "2–4 hrs/week in wasted sales calls", cost: "Increase close rate on qualified leads", hire: "No SDR needed for initial qualification", speed: "Hot leads contacted within 5 minutes" },
    pitch: "Right now your best salespeople are wasting time on leads that were never going to buy. We score every lead the moment it comes in and make sure your team only picks up the phone when it matters.",
    tools: [
      { badge: "trigger", name: "CRM / form submission", desc: "New lead detected and sent to scoring" },
      { badge: "ai", name: "Claude / GPT + scoring criteria", desc: "Evaluates lead against your ideal customer profile" },
      { badge: "output", name: "CRM tags", desc: "Hot / warm / cold assigned automatically" },
      { badge: "output", name: "Slack / SMS alert to rep", desc: "Hot leads routed immediately" }
    ]
  },
  {
    id: "outbound-prospecting",
    category: "sales",
    emoji: "📤",
    name: "Outbound Prospecting at Scale",
    preview: "Research and personalize 100 outreach messages in the time it takes to write 5",
    level: 2,
    problem: "Manual outbound research takes 20–30 minutes per prospect. Writing personalized messages takes another 15. At that rate, a rep can reach 10–15 new prospects per day max. The volume required to build a pipeline is impossible to hit manually.",
    discoveryQs: [
      "How many new outreach messages does your team send per day right now?",
      "How long does it take to research a prospect and write a personalized message?",
      "What's your current conversion rate from outreach to booked meeting?"
    ],
    steps: [
      { label: "Target list defined and uploaded", detail: "Company names, URLs, and target contacts — from LinkedIn, Apollo, or internal list" },
      { label: "AI researches each prospect", detail: "Scans website, LinkedIn, news, and recent activity for relevant context" },
      { label: "Personalized first-line generated for each", detail: "Specific to their business — not a template variable. Real personalization." },
      { label: "Full message drafted and loaded to sequence", detail: "Ready to send — rep reviews and approves in batches, not one by one" },
      { label: "Responses routed to rep for follow-up", detail: "AI handles the sequence; human takes over the moment a real conversation starts", isLast: true }
    ],
    roi: { time: "15–20 hrs/week in manual research", cost: "10x outreach volume with same team size", hire: "Replaces 1–2 SDR hires", speed: "100 personalized messages in 2 hours" },
    pitch: "Your sales team can send 15 personalized messages a day manually. With this, they can review and approve 100. Same quality. Seven times the volume. Pipeline grows without headcount.",
    tools: [
      { badge: "trigger", name: "Apollo / LinkedIn / CSV upload", desc: "Prospect list feeds into research workflow" },
      { badge: "ai", name: "Claude / GPT + web research", desc: "Researches prospect and writes personalized opener" },
      { badge: "output", name: "Instantly / Smartlead / Lemlist", desc: "Loads and sends approved sequences at scale" },
      { badge: "output", name: "CRM", desc: "All activity logged automatically" }
    ]
  },
  {
    id: "sales-call-coaching",
    category: "sales",
    emoji: "🎙️",
    name: "Sales Call Recording & Coaching",
    preview: "Every call automatically scored and coached — no manager required",
    level: 2,
    problem: "Sales managers can only listen to a handful of calls per week. Most calls go unreviewed. Reps don't get consistent feedback. Patterns that are killing conversion rates — talk ratio, objection handling, closing language — go unnoticed for months.",
    discoveryQs: [
      "How many sales calls does your team run per week?",
      "How do managers currently coach reps — how often, and based on what?",
      "Do you know what your top-performing reps do differently from average ones?"
    ],
    steps: [
      { label: "Sales call happens", detail: "Rep calls from any phone or video platform" },
      { label: "Call automatically recorded and transcribed", detail: "Fireflies, Gong, or similar — full transcript ready within minutes" },
      { label: "AI scores the call", detail: "Measures: talk ratio, questions asked, objection handling, next-step clarity, tone signals" },
      { label: "Coaching summary sent to rep", detail: "2–3 specific, actionable points — not a wall of text. What to do differently next time." },
      { label: "Manager dashboard updated", detail: "All calls, scores, and trends visible in one place — manager reviews exceptions, not everything", isLast: true }
    ],
    roi: { time: "5–8 hrs/week of manager time saved", cost: "10–20% improvement in close rate with consistent coaching", hire: "No dedicated sales coach needed", speed: "Every rep coached after every call" },
    pitch: "Right now your best call is only as good as the rep who made it — and nobody else learns from it. We record, transcribe, and score every call automatically so your whole team improves continuously, not just the ones whose calls your manager happened to listen to.",
    tools: [
      { badge: "trigger", name: "Fireflies.ai / Gong / Chorus", desc: "Auto-joins and records every sales call" },
      { badge: "ai", name: "Claude / GPT with scoring criteria", desc: "Analyzes transcript against best-practice framework" },
      { badge: "output", name: "Email / Slack to rep", desc: "Coaching summary with 2–3 specific improvements" },
      { badge: "output", name: "Manager dashboard", desc: "Team-wide patterns, scores, and exception flagging" }
    ]
  },
  {
    id: "pipeline-visibility",
    category: "sales",
    emoji: "📈",
    name: "Pipeline Visibility & Deal Alerts",
    preview: "Know which deals are stalling before they die",
    level: 2,
    problem: "Deals go cold because nobody notices they've gone quiet. CRM data is stale. Managers have to ask reps for updates in meetings instead of knowing. Deals fall through cracks that a simple alert would have caught.",
    discoveryQs: [
      "How do you currently know which deals are moving and which are stuck?",
      "How often do deals slip through without the team realizing until it's too late?",
      "What does your weekly pipeline review process look like right now?"
    ],
    steps: [
      { label: "Daily pipeline scan fires automatically", detail: "System reviews all open deals in CRM each morning" },
      { label: "AI flags stale deals", detail: "Any deal with no activity in 3+ days flagged for attention" },
      { label: "Rep receives prioritized action list", detail: "Clear list: these deals need a touch today. In order of value and urgency." },
      { label: "Manager receives summary of at-risk deals", detail: "One email or Slack message — no meeting required to get visibility" },
      { label: "Deal status trends tracked over time", detail: "Win rate, average deal age, and stage-by-stage conversion tracked weekly", isLast: true }
    ],
    roi: { time: "3–5 hrs/week in pipeline review meetings", cost: "Recover 10–15% of stalled deals", hire: "No dedicated ops manager needed for pipeline tracking", speed: "Issues surface daily, not weekly" },
    pitch: "Your pipeline meeting is you asking reps to tell you what's in the CRM — which they also haven't updated. We reverse that: the system tells the manager and the rep exactly what needs attention every morning, automatically.",
    tools: [
      { badge: "trigger", name: "CRM scheduled scan (Zapier)", desc: "Daily check of all open deal activity" },
      { badge: "ai", name: "Claude / GPT", desc: "Identifies stale deals and prioritizes by value" },
      { badge: "output", name: "Slack / email to rep", desc: "Daily prioritized action list" },
      { badge: "output", name: "Manager summary", desc: "At-risk deals and team pipeline health" }
    ]
  },
  {
    id: "employee-qa",
    category: "knowledge",
    emoji: "🤖",
    name: "Internal Employee Q&A Bot",
    preview: "Answer employee questions instantly using your own documents",
    level: 1,
    problem: "Employees ask HR, managers, or each other the same questions about policies, procedures, benefits, and processes every week. The answers are in your documents — but nobody can find them. Manager time gets consumed by questions that a document already answers.",
    discoveryQs: [
      "What are the most common questions your HR or operations team gets from employees?",
      "Where does your team go to find answers about policies or processes — is there a central place?",
      "How much time do you estimate managers spend answering routine employee questions?"
    ],
    steps: [
      { label: "Employee asks a question in Slack", detail: "Natural language — no special formatting needed" },
      { label: "AI bot searches your connected knowledge base", detail: "Scans: employee handbook, SOPs, policy docs, benefits info, onboarding materials" },
      { label: "AI returns the answer with source", detail: "Direct, specific answer — plus a link to the actual document section it came from" },
      { label: "Unknown questions escalated to HR", detail: "If the AI can't find the answer, it routes to the right person automatically" },
      { label: "Question log reviewed monthly", detail: "Frequently asked questions used to identify documentation gaps", isLast: true }
    ],
    roi: { time: "3–6 hrs/week of manager and HR time", cost: "Zero time wasted repeating answers", hire: "Reduces HR admin burden significantly", speed: "Instant answers 24/7" },
    pitch: "Your HR team is answering the same 15 questions on repeat. The answers are already written down — in your handbook, your policy docs, your SOPs. We connect those documents to a bot so employees get the answer in seconds and HR only gets interrupted for the things that actually need a human.",
    tools: [
      { badge: "trigger", name: "Slack bot", desc: "Employee asks question naturally" },
      { badge: "ai", name: "Claude with RAG (document retrieval)", desc: "Searches connected documents and returns specific answer" },
      { badge: "output", name: "Slack response with source link", desc: "Answer delivered in the same thread" },
      { badge: "output", name: "HR ticket (if escalated)", desc: "Unknown questions routed appropriately" }
    ]
  },
  {
    id: "new-hire-training",
    category: "knowledge",
    emoji: "🎓",
    name: "Role-Specific Training Delivery",
    preview: "Sequenced training that runs itself for every new hire",
    level: 2,
    problem: "Training is inconsistent because it relies on whoever has time to deliver it. New hires learn different things depending on who onboards them. Training materials exist but aren't delivered in any structured sequence. The best training lives in people's heads, not in any system.",
    discoveryQs: [
      "How is new employee training currently delivered — is it structured or ad hoc?",
      "How long does it typically take a new hire to feel fully productive in their role?",
      "What's the biggest gap in how you currently train people?"
    ],
    steps: [
      { label: "New hire role and department identified", detail: "Assigned in HR system or via form at start date" },
      { label: "Role-specific training path activates", detail: "Different sequence for each role: sales rep, ops, field tech, admin, etc." },
      { label: "Training content delivered day by day", detail: "Video links, document reads, quizzes, and shadowing tasks delivered via email or Slack on schedule" },
      { label: "AI available for questions throughout", detail: "New hire can ask the AI about any content — gets immediate clarification without bothering a manager" },
      { label: "Completion tracked and reported", detail: "Manager sees real-time status — who's on track, who's behind, what's been completed", isLast: true }
    ],
    roi: { time: "5–10 hrs per new hire saved across team", cost: "Reduce time-to-productivity by 30–40%", hire: "No dedicated training coordinator needed", speed: "Consistent every time — zero drop-offs" },
    pitch: "Your best employees took 3 months to figure things out because training was scattered. The next cohort can be productive in 6 weeks if the knowledge is packaged and delivered on schedule. We build the sequence once and it runs automatically forever.",
    tools: [
      { badge: "trigger", name: "HR system / Zapier", desc: "New hire start date triggers training sequence" },
      { badge: "ai", name: "Claude with training content", desc: "Answers questions and reinforces learning" },
      { badge: "output", name: "Email / Slack sequence", desc: "Daily training content delivered on schedule" },
      { badge: "output", name: "Manager tracking view", desc: "Completion status for all active training" }
    ]
  },
  {
    id: "document-retrieval",
    category: "knowledge",
    emoji: "📁",
    name: "Internal Document Search & Retrieval",
    preview: "Find any document or policy in seconds — not minutes of searching",
    level: 1,
    problem: "Documents are scattered across Google Drive, email threads, shared folders, and individual desktops. Employees spend 15–30 minutes tracking down the right version of a document. Outdated versions get used because they're easier to find than the current ones.",
    discoveryQs: [
      "Where do your employees go when they need to find an internal document or policy?",
      "How often do you hear people say they can't find something or don't know where to look?",
      "What's the most commonly-needed document that's the hardest to find?"
    ],
    steps: [
      { label: "Employee needs a document or policy", detail: "Types a plain-language request: 'What's our refund policy?' or 'Find the new hire paperwork'" },
      { label: "AI searches connected knowledge base", detail: "Searches Google Drive, Notion, SharePoint, or wherever docs are stored" },
      { label: "Returns the right document with context", detail: "Not just a link — a direct answer plus the source document" },
      { label: "Employee confirms or asks follow-up", detail: "Can ask follow-up questions in the same conversation" },
      { label: "Search log identifies documentation gaps", detail: "Frequently searched, unanswered queries flag what needs to be documented", isLast: true }
    ],
    roi: { time: "15–30 min saved per employee per day", cost: "Eliminate outdated-document errors", hire: "No document management coordinator needed", speed: "Any document found in seconds" },
    pitch: "Your team is spending real hours every week hunting for documents they know exist but can't find. We connect all your storage — Drive, Notion, wherever — to an AI that can find anything in seconds. They ask. It answers. Done.",
    tools: [
      { badge: "trigger", name: "Slack bot / chat interface", desc: "Employee asks in plain language" },
      { badge: "ai", name: "Claude with Google Drive / Notion integration", desc: "Searches and retrieves relevant document sections" },
      { badge: "output", name: "Direct answer + document link", desc: "Specific answer with source for verification" },
      { badge: "output", name: "Gap report", desc: "Monthly log of unanswered queries for documentation improvement" }
    ]
  }
];
