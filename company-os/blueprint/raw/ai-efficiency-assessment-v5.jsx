import { useState, useEffect } from "react";

const CAL_LINK = "https://cal.com/jay-condie/free-ai-efficiency-audit";
const SOCIAL_PROOF_COUNT = 247;

const BIZ_TILES = [
  { label: "Home Services", sub: "HVAC, plumbing, electrical, landscaping", icon: "🔧", type: "service" },
  { label: "Construction", sub: "General contracting, remodeling, trades", icon: "🏗️", type: "service" },
  { label: "Healthcare", sub: "Medical, dental, chiro, therapy", icon: "🏥", type: "healthcare" },
  { label: "Legal or Accounting", sub: "Law firm, CPA, financial advisory", icon: "⚖️", type: "b2b" },
  { label: "Real Estate", sub: "Brokerage, property management, investing", icon: "🏠", type: "b2b" },
  { label: "Retail or E-commerce", sub: "Storefront, online store, DTC brand", icon: "🛍️", type: "retail" },
  { label: "Restaurant or Hospitality", sub: "Restaurant, hotel, events, catering", icon: "🍽️", type: "hospitality" },
  { label: "Marketing or Agency", sub: "Creative, digital, PR, consulting", icon: "📣", type: "agency" },
  { label: "Manufacturing", sub: "Production, distribution, wholesale", icon: "🏭", type: "b2b" },
  { label: "Financial Services", sub: "Insurance, lending, wealth management", icon: "💼", type: "b2b" },
];

// Derive biz category from tile or custom input
function getBizCategory(answers) {
  const bt = answers.business_type;
  if (!bt) return "service";
  if (bt.tile !== null && bt.tile !== undefined) return BIZ_TILES[bt.tile]?.type || "service";
  // For custom text, do a simple keyword match
  const label = (bt.label || "").toLowerCase();
  if (/retail|store|shop|ecommerce|e-commerce|dtc|brand/.test(label)) return "retail";
  if (/restaurant|food|cafe|hotel|hospitality|catering/.test(label)) return "hospitality";
  if (/health|medical|dental|clinic|therapy|chiro|pharma/.test(label)) return "healthcare";
  if (/agency|marketing|creative|pr|advertising|design/.test(label)) return "agency";
  if (/law|legal|account|finance|insurance|lending|wealth|cpa/.test(label)) return "b2b";
  return "service";
}

function getTeamCategory(answers) {
  const ts = answers.team_size;
  if (ts === 0) return "solo";
  if (ts <= 2) return "small"; // 2-10
  return "larger"; // 11+
}

// ── Adaptive question builders ────────────────────────────────────────────────

function getQ3(answers) {
  const cat = getBizCategory(answers);
  const bizLabel = answers.business_type?.label || "your business";

  const map = {
    service: {
      question: "When a potential customer calls or messages to book a job, what usually happens?",
      subtext: "Be honest — this one matters.",
      options: [
        "Goes to voicemail, we call back next day (or forget)",
        "We respond same day but it's manual and inconsistent",
        "Someone on the team follows up within an hour",
        "We have a system that responds and books automatically",
      ],
    },
    healthcare: {
      question: "When a new patient reaches out after hours or on weekends, what happens?",
      subtext: "Be honest — this one matters.",
      options: [
        "They get voicemail and we call back the next business day",
        "They get an auto-reply but no real booking happens",
        "Someone checks and responds within a few hours",
        "We have an automated system that schedules them immediately",
      ],
    },
    b2b: {
      question: "When a new prospect reaches out or fills out a form, how quickly do you respond?",
      subtext: "Be honest — this one matters.",
      options: [
        "Next business day at best — sometimes longer",
        "Same day, but it's manual and depends who sees it",
        "Within a few hours — we have someone watching",
        "Within minutes — we have an automated follow-up system",
      ],
    },
    retail: {
      question: "When a customer abandons a cart, sends a question, or visits without buying, what happens?",
      subtext: "Be honest — this one matters.",
      options: [
        "Nothing — we don't have a recovery system",
        "They get a generic automated email eventually",
        "Someone follows up manually when they notice",
        "We have automated sequences that re-engage them immediately",
      ],
    },
    hospitality: {
      question: "When someone inquires about a reservation or booking outside business hours, what happens?",
      subtext: "Be honest — this one matters.",
      options: [
        "They wait until we open and call back",
        "They get an auto-reply with no real next step",
        "Someone checks messages and responds within a few hours",
        "We have an automated system that confirms or captures the booking",
      ],
    },
    agency: {
      question: "When a new prospect reaches out for a quote or proposal, what's your typical response time?",
      subtext: "Be honest — this one matters.",
      options: [
        "Next business day or longer",
        "Same day, but it requires someone to manually respond",
        "Within a few hours — we have a process",
        "Within minutes — automated intake and follow-up handles it",
      ],
    },
  };

  return { id: "lead_response", type: "single", ...map[cat] };
}

function getQ4(answers) {
  const cat = getBizCategory(answers);

  const map = {
    service: {
      question: "Which of these does your team do manually every week?",
      subtext: "Select all that apply.",
      options: [
        "Answering the same customer questions by phone or text",
        "Writing estimates or quotes from scratch each time",
        "Scheduling, rescheduling, and sending reminders",
        "Following up on unpaid invoices",
        "Entering job notes or data into software",
        "Ordering materials or managing inventory",
      ],
    },
    healthcare: {
      question: "Which of these does your practice handle manually every week?",
      subtext: "Select all that apply.",
      options: [
        "Appointment reminders and follow-up calls",
        "Insurance verification and prior authorizations",
        "Answering the same patient questions repeatedly",
        "Intake forms and paperwork",
        "Billing and collections follow-up",
        "Referral coordination and scheduling",
      ],
    },
    b2b: {
      question: "Which of these does your team handle manually every week?",
      subtext: "Select all that apply.",
      options: [
        "Writing proposals or scopes of work from scratch",
        "Researching prospects and qualifying leads",
        "Following up with leads who went cold",
        "Updating CRM records and tracking deal stages",
        "Generating reports or pulling pipeline numbers",
        "Coordinating internal handoffs between teams",
      ],
    },
    retail: {
      question: "Which of these does your team handle manually every week?",
      subtext: "Select all that apply.",
      options: [
        "Answering repetitive customer questions via email or chat",
        "Processing returns, refunds, or exchanges",
        "Tracking inventory and reordering stock",
        "Creating and scheduling social posts or ads",
        "Pulling sales reports or performance data",
        "Writing product descriptions or email campaigns",
      ],
    },
    hospitality: {
      question: "Which of these does your team handle manually every week?",
      subtext: "Select all that apply.",
      options: [
        "Answering reservation questions and availability requests",
        "Coordinating staff schedules and shift changes",
        "Following up on reviews and guest feedback",
        "Processing special requests and event inquiries",
        "Pulling revenue reports or occupancy data",
        "Writing menu updates, social posts, or promotional copy",
      ],
    },
    agency: {
      question: "Which of these does your team handle manually every week?",
      subtext: "Select all that apply.",
      options: [
        "Writing status updates and reports for clients",
        "Creating proposals or scopes from scratch",
        "Tracking time, deliverables, and project status",
        "Researching prospects or preparing for sales calls",
        "Briefing creative or pulling together assets",
        "Scheduling meetings and managing client communication",
      ],
    },
  };

  return { id: "repetitive_tasks", type: "multi", ...map[cat] };
}

function getQ5(answers) {
  const teamCat = getTeamCategory(answers);
  const cat = getBizCategory(answers);

  const soloSuffix = "you personally";
  const teamSuffix = "your team";
  const subject = teamCat === "solo" ? soloSuffix : teamSuffix;

  const contextMap = {
    service: `follow up with a new job inquiry`,
    healthcare: `follow up with a new patient inquiry`,
    b2b: `respond to a new inbound lead or prospect`,
    retail: `respond to a new customer question or inquiry`,
    hospitality: `respond to a new booking inquiry`,
    agency: `respond to a new prospect or referral`,
  };

  return {
    id: "lead_followup",
    question: `How long does it typically take ${subject} to ${contextMap[cat] || "follow up with a new lead"}?`,
    type: "single",
    options: [
      "Within minutes — there's a system for it",
      "Within a few hours",
      "Same day, when we get to it",
      "Next business day",
      "Honestly, some fall through the cracks",
    ],
  };
}

function getQ7(answers) {
  const cat = getBizCategory(answers);
  const teamCat = getTeamCategory(answers);

  const map = {
    service: {
      question: "What's the single biggest time drain in your business right now?",
      subtext: "Pick the one that costs you the most.",
      options: [
        "Phone calls — quoting, scheduling, answering the same questions",
        "Admin work — invoicing, data entry, paperwork",
        "Lead follow-up — leads go cold before we get to them",
        "Scheduling chaos — changes, no-shows, reminders",
        teamCat === "solo" ? "Doing everything myself — no systems" : "Managing the team — tracking jobs and people",
        "Not knowing my numbers — revenue, costs, margins",
      ],
    },
    healthcare: {
      question: "What's the single biggest operational drain in your practice?",
      subtext: "Pick the one that costs you the most.",
      options: [
        "Phone volume — scheduling, reminders, patient questions",
        "Admin and paperwork — intake, billing, authorizations",
        "No-shows and last-minute cancellations",
        "Patient follow-up and recall — people who drop off",
        "Staff coordination and coverage gaps",
        "Reporting and knowing what's actually happening financially",
      ],
    },
    b2b: {
      question: "What's the single biggest time drain on your team right now?",
      subtext: "Pick the one that costs you the most.",
      options: [
        "Lead generation — not enough quality pipeline",
        "Slow sales cycle — deals take too long to close",
        "Proposal and scope writing — takes too long each time",
        "Client communication and status updates",
        teamCat === "solo" ? "Doing everything myself — no leverage" : "Managing the team and tracking deliverables",
        "Reporting — pulling numbers and proving ROI",
      ],
    },
    retail: {
      question: "What's the single biggest drag on your business right now?",
      subtext: "Pick the one that costs you the most.",
      options: [
        "Customer support volume — questions, returns, complaints",
        "Inventory management — stockouts, overstock, tracking",
        "Acquiring new customers — CAC is too high",
        "Retaining customers — people buy once and don't come back",
        "Marketing and content — too much to produce, never enough time",
        "Knowing your numbers — margins, LTV, what's actually working",
      ],
    },
    hospitality: {
      question: "What's the single biggest operational drag right now?",
      subtext: "Pick the one that costs you the most.",
      options: [
        "Staffing — scheduling, turnover, training",
        "Guest communication — inquiries, complaints, reviews",
        "Booking and reservation management",
        "Marketing and filling slow periods",
        "Food or supply costs and vendor management",
        "Knowing your numbers — revenue per cover, occupancy, margins",
      ],
    },
    agency: {
      question: "What's the single biggest drag on your agency right now?",
      subtext: "Pick the one that costs you the most.",
      options: [
        "New business — not enough qualified leads coming in",
        "Scope creep and client management — projects go over budget",
        "Reporting — too much time building decks for clients",
        "Team capacity — always at the edge of bandwidth",
        "Retaining clients — churn is eating growth",
        "Knowing your numbers — utilization, margins, profitability",
      ],
    },
  };

  return { id: "biggest_pain", type: "single", ...map[cat] };
}

// Build the full question list dynamically based on answers so far
function buildQuestions(answers) {
  return [
    {
      id: "business_type",
      question: "What type of business do you run?",
      subtext: "Select one or describe your own below.",
      type: "biz_type",
    },
    {
      id: "team_size",
      question: "How many people are on your team?",
      type: "single",
      options: ["Just me", "2–10", "11–50", "51–200", "200+"],
    },
    getQ3(answers),
    getQ4(answers),
    getQ5(answers),
    {
      id: "ai_current_use",
      question: "How is your team currently using AI tools (like ChatGPT)?",
      type: "single",
      options: [
        "Not using AI at all",
        "A few of us use it occasionally for writing help",
        "We use it regularly but mostly for one-off tasks",
        "We have some AI tools connected to our workflows",
        "AI is embedded in multiple core processes",
      ],
    },
    getQ7(answers),
  ];
}

// ── Scoring ───────────────────────────────────────────────────────────────────

function scoreAnswers(answers, questions) {
  let score = 100;
  const gaps = [];

  // Q3 — lead response
  const lrIdx = answers.lead_response;
  const lrMap = { 0: -25, 1: -15, 2: -5, 3: 0 };
  if (lrIdx !== undefined) {
    score += lrMap[lrIdx] || 0;
    if (lrIdx <= 1)
      gaps.push({
        title: "Slow Lead Response",
        detail: "The first business to respond wins — every time. An AI system can respond instantly, qualify the lead, and get them booked before your competitor sees the notification.",
        hours: "Revenue leak — 5-min vs next-day response = 9x conversion gap",
        icon: "⚡",
      });
  }

  // Q4 — repetitive tasks
  const repTasks = answers.repetitive_tasks || [];
  score -= repTasks.length * 6;
  if (repTasks.length >= 2) {
    gaps.push({
      title: "Manual Process Overload",
      detail: `Your team is running ${repTasks.length} categories of repetitive work that AI can handle automatically — freeing your people for higher-value work.`,
      hours: `${repTasks.length * 3}–${repTasks.length * 5} hrs/week`,
      icon: "⚙️",
    });
  }

  // Q5 — follow-up speed
  const fuMap = { 0: 0, 1: -8, 2: -15, 3: -20, 4: -25 };
  const fuIdx = answers.lead_followup;
  if (fuIdx !== undefined) {
    score += fuMap[fuIdx] || 0;
    if (fuIdx >= 3)
      gaps.push({
        title: "Leads Falling Through the Cracks",
        detail: "Every lead that doesn't get a same-day response has a dramatically lower chance of converting. An automated follow-up sequence ensures nothing gets missed.",
        hours: "High-value revenue leak — hard to see but compounding",
        icon: "📞",
      });
  }

  // Q6 — AI usage
  const aiMap = { 0: -10, 1: -5, 2: -3, 3: 0, 4: 5 };
  const aiIdx = answers.ai_current_use;
  if (aiIdx !== undefined) score += aiMap[aiIdx] || 0;

  score = Math.max(10, Math.min(98, score));
  return { score, gaps: gaps.slice(0, 3) };
}

function getLevel(score) {
  if (score >= 80) return { label: "AI-Ready", color: "#22c55e", bg: "rgba(34,197,94,0.1)" };
  if (score >= 60) return { label: "AI-Aware", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" };
  if (score >= 40) return { label: "AI-Behind", color: "#f97316", bg: "rgba(249,115,22,0.1)" };
  return { label: "AI-Exposed", color: "#ef4444", bg: "rgba(239,68,68,0.1)" };
}

function getTopUseCase(answers) {
  const cat = getBizCategory(answers);
  const pain = answers.biggest_pain;

  const useCaseMap = {
    service: [
      { title: "24/7 Voice Agent", desc: "Answers calls, books jobs, handles FAQs — even at 2am.", roi: "Businesses using voice agents recover 15–20% more booked jobs." },
      { title: "Automated Invoicing + Follow-Up", desc: "Invoices send automatically and follow up until paid — no chasing.", roi: "Avg reduces outstanding invoices by 30–40% within 30 days." },
      { title: "AI Lead Follow-Up System", desc: "Responds to new inquiries instantly, qualifies them, gets them booked.", roi: "5-min response vs next-day = 9x higher conversion rate." },
      { title: "Smart Scheduling System", desc: "Handles booking, reminders, and reschedules automatically.", roi: "Reduces no-shows by 40–60% and saves 5–8 hrs/week in coordination." },
      { title: "AI Operations Dashboard", desc: "See every job, team member, and revenue number in one place.", roi: "Most owners save 4–6 hrs/week previously spent chasing updates." },
      { title: "AI Business Intelligence", desc: "Automated reporting on revenue, margins, and job profitability.", roi: "Know your numbers without spending hours building reports." },
    ],
    healthcare: [
      { title: "Patient Communication AI", desc: "Handles appointment reminders, FAQs, and follow-ups automatically.", roi: "Reduces no-shows by 30–50% and frees front desk for complex tasks." },
      { title: "Automated Admin Stack", desc: "Intake forms, insurance verification, and billing follow-up — automated.", roi: "Saves 8–12 hrs/week of front desk time per practice." },
      { title: "No-Show Reduction System", desc: "Smart reminders and re-booking sequences that fill cancelled slots.", roi: "Recovering one no-show per day = significant monthly revenue impact." },
      { title: "Patient Recall System", desc: "Automated outreach to patients due for follow-ups or annual visits.", roi: "Most practices recover 15–25% more reactivated patients per quarter." },
      { title: "Staff Coordination AI", desc: "Scheduling, coverage alerts, and shift management — automated.", roi: "Reduces scheduling conflicts and saves 4–6 hrs/week in coordination." },
      { title: "Practice Intelligence Dashboard", desc: "Revenue, collections, and patient flow visible in one place.", roi: "Know your numbers without waiting for end-of-month reports." },
    ],
    b2b: [
      { title: "AI Lead Generation System", desc: "Researches, qualifies, and enriches prospects automatically.", roi: "Most B2B teams save 8–12 hrs/week on manual prospect research." },
      { title: "Automated Sales Follow-Up", desc: "Keeps deals moving with timed, personalized follow-up sequences.", roi: "Increases pipeline conversion by 20–35% by eliminating dropped balls." },
      { title: "Proposal Automation", desc: "Generates first-draft proposals from a brief in minutes.", roi: "Cuts proposal time from 4+ hours to under 30 minutes per deal." },
      { title: "Client Communication AI", desc: "Automated status updates, check-ins, and reporting for clients.", roi: "Saves 5–8 hrs/week in account management overhead." },
      { title: "AI Operations Dashboard", desc: "Pipeline, team output, and revenue in one place — updated in real time.", roi: "Most leaders save 4–6 hrs/week chasing status updates." },
      { title: "Revenue Intelligence System", desc: "Automated reporting on pipeline, margins, and team performance.", roi: "Know your numbers without building decks or pulling spreadsheets." },
    ],
    retail: [
      { title: "AI Customer Support", desc: "Handles FAQs, returns, and order questions automatically — 24/7.", roi: "Deflects 60–80% of support volume with no human required." },
      { title: "Inventory Intelligence System", desc: "Predicts stockouts, flags slow movers, and triggers reorders automatically.", roi: "Reduces lost sales from stockouts and overstock costs by 20–40%." },
      { title: "AI Acquisition System", desc: "Automated ad creative testing, audience research, and campaign optimization.", roi: "Most brands reduce CAC by 15–30% with systematic creative testing." },
      { title: "Customer Retention Engine", desc: "Automated sequences that win back lapsed customers and increase LTV.", roi: "Recovering 10% of lapsed customers often 2–3x the ROI of new acquisition." },
      { title: "Content Automation Stack", desc: "Product descriptions, email campaigns, and social content — generated automatically.", roi: "Saves 10–15 hrs/week of content production time." },
      { title: "Ecommerce Intelligence Dashboard", desc: "Margins, LTV, ad performance, and inventory in one place.", roi: "Faster decisions = faster scaling. Most founders save 5+ hrs/week." },
    ],
    hospitality: [
      { title: "AI Staffing Scheduler", desc: "Builds schedules, handles shift swaps, and sends coverage alerts automatically.", roi: "Saves 6–10 hrs/week of manager time and reduces coverage gaps." },
      { title: "Guest Communication AI", desc: "Handles inquiries, reservation questions, and reviews automatically.", roi: "Responds to guests 24/7 and increases booking conversion by 15–25%." },
      { title: "Smart Booking System", desc: "Captures and confirms reservations automatically across channels.", roi: "Eliminates missed bookings and reduces no-shows by 30–40%." },
      { title: "AI Marketing Engine", desc: "Automated email campaigns, social posts, and promotional offers for slow periods.", roi: "Most venues fill 10–20% more covers during low periods with targeted outreach." },
      { title: "Vendor and Cost AI", desc: "Tracks food costs, flags variance, and automates vendor reordering.", roi: "Avg saves 2–4% of food cost through better visibility and ordering." },
      { title: "Revenue Intelligence Dashboard", desc: "Covers, occupancy, revenue per seat — visible in real time.", roi: "Faster decisions on pricing, staffing, and promotions." },
    ],
    agency: [
      { title: "AI New Business System", desc: "Researches prospects, personalizes outreach, and tracks follow-up automatically.", roi: "Most agencies 2–3x their outreach volume without adding headcount." },
      { title: "Automated Client Reporting", desc: "Pulls data and builds client-ready reports and dashboards automatically.", roi: "Saves 3–5 hrs/week per client in reporting time." },
      { title: "Proposal and SOW Generator", desc: "First-draft proposals from a brief — in minutes, not hours.", roi: "Cuts proposal time from a half-day to under 30 minutes." },
      { title: "Capacity and Utilization Dashboard", desc: "See team bandwidth, project status, and billability in real time.", roi: "Most agencies find 10–15% billable time they were losing to poor visibility." },
      { title: "Client Retention System", desc: "Automated check-ins, NPS tracking, and proactive risk flagging.", roi: "Reducing churn by 1 client/month compounds to significant ARR protection." },
      { title: "Profitability Intelligence", desc: "Project margins, team utilization, and client ROI — all visible automatically.", roi: "Know which clients and projects are actually making you money." },
    ],
  };

  const list = useCaseMap[cat] || useCaseMap.service;
  return list[pain !== undefined && pain < list.length ? pain : 0];
}

function buildAnswerContext(answers, questions) {
  const bizLabel = answers.business_type?.label || "business";
  const teamSize = ["solo operator", "2–10 person team", "11–50 person team", "51–200 person team", "200+ person org"][answers.team_size] || "team";
  const cat = getBizCategory(answers);

  // Q3 labels vary by category
  const lrLabels = {
    service: ["goes to voicemail, next-day callback", "responds same day but manually", "responds within an hour", "handled automatically"],
    healthcare: ["voicemail, next business day", "auto-reply, no booking", "responds within a few hours", "automated scheduling immediately"],
    b2b: ["next business day or longer", "same day, manually", "within a few hours", "within minutes, automated"],
    retail: ["no recovery system", "generic automated email", "manual follow-up", "automated re-engagement immediately"],
    hospitality: ["wait until open", "auto-reply, no next step", "responds within a few hours", "automated booking confirmation"],
    agency: ["next business day or longer", "same day, manually", "within a few hours, process exists", "within minutes, automated intake"],
  };

  const lrLabel = (lrLabels[cat] || lrLabels.service)[answers.lead_response] || "unknown";
  const fuLabel = ["within minutes", "within a few hours", "same day", "next business day", "inconsistently"][answers.lead_followup] || "unknown";
  const aiLabel = ["not using AI", "occasionally for writing", "regularly for one-off tasks", "some tools connected to workflows", "AI in multiple core processes"][answers.ai_current_use] || "unknown";

  // Get the actual question objects to pull repetitive task labels
  const q4 = questions.find(q => q.id === "repetitive_tasks");
  const repTaskLabels = q4?.options || [];
  const repTasks = (answers.repetitive_tasks || []).map(i => repTaskLabels[i]).filter(Boolean).join(", ") || "none identified";

  const q7 = questions.find(q => q.id === "biggest_pain");
  const painLabel = q7?.options?.[answers.biggest_pain] || "unknown";

  return `Business type: ${bizLabel}
Team size: ${teamSize}
Initial lead/customer response: ${lrLabel}
Repetitive manual tasks: ${repTasks}
Follow-up speed: ${fuLabel}
Current AI usage: ${aiLabel}
Biggest time drain: ${painLabel}`;
}

async function generateAIReport(answers, score, userName, questions) {
  const context = buildAnswerContext(answers, questions);
  const firstName = userName ? userName.split(" ")[0] : "the business owner";
  const level = getLevel(score);

  const prompt = `You are an AI business consultant writing a short, sharp assessment for a business owner who just completed an AI efficiency quiz. Write a 3-4 sentence personalized summary that feels written specifically for them — not a template.

Here are their answers:
${context}

Their AI Efficiency Score: ${score}/100 (${level.label})
Their name: ${firstName}

Write 3-4 sentences that:
1. Name their specific situation directly (business type, team size, the actual tasks they're struggling with)
2. Call out the single biggest gap their answers reveal — be specific, not generic
3. Make the cost of inaction concrete (time, money, or competitive position)
4. End with one sentence that makes booking a call feel like the obvious next move

Rules:
- Write in second person ("your", "you")
- Be direct and confident — no hedging, no filler
- Sound like a peer operator, not a chatbot
- No bullet points — flowing paragraph only
- Do not mention the score or the quiz
- Max 80 words`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  return data.content?.find(b => b.type === "text")?.text?.trim() || "";
}

// ── Components ────────────────────────────────────────────────────────────────

function Landing({ onStart }) {
  return (
    <div style={s.card}>
      <div style={s.freeBadge}>FREE</div>
      <div style={s.iconBox}>⚡</div>
      <h1 style={s.landingTitle}>Business AI Efficiency Assessment</h1>
      <p style={s.landingSubtitle}>
        Find out exactly where AI could save your business time and money — in under 3 minutes.
      </p>
      <div style={s.checkList}>
        {[
          "7 questions tailored to your specific business",
          "AI-generated personalized efficiency report",
          "Your top gaps + specific use case recommendations",
          "No account required",
        ].map((item, i) => (
          <div key={i} style={s.checkItem}>
            <span style={s.checkIcon}>✓</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
      <button style={s.primaryBtn} onClick={onStart}>Start Free Assessment →</button>
      <div style={s.socialProof}>
        <div style={s.avatarStack}>
          {["👩‍💼", "👨‍💻", "👩‍⚕️", "👨‍🔧"].map((e, i) => (
            <span key={i} style={{ ...s.avatar, marginLeft: i === 0 ? 0 : -8 }}>{e}</span>
          ))}
        </div>
        <span style={s.socialProofText}>
          Join <strong style={{ color: "#06b6d4" }}>{SOCIAL_PROOF_COUNT}+ business owners</strong> who've taken the assessment
        </span>
      </div>
    </div>
  );
}

function BizTypeCard({ q, index, total, answer, onAnswer, onNext, onBack }) {
  const progress = (index / total) * 100;
  const selectedTile = answer?.tile ?? null;
  const customText = answer?.custom ?? "";
  const canNext = selectedTile !== null || customText.trim().length > 0;

  function selectTile(i) {
    onAnswer({ tile: i, custom: "", label: BIZ_TILES[i].label });
  }

  function handleCustomChange(val) {
    onAnswer({ tile: null, custom: val, label: val });
  }

  return (
    <div style={s.card}>
      <div style={s.qHeader}>
        <span style={s.qLabel}>Question {index + 1} of {total}</span>
        <span style={s.qTimer}>⏱ ~{Math.ceil((total - index) * 0.25)} min left</span>
      </div>
      <div style={s.progressBar}>
        <div style={{ ...s.progressFill, width: `${progress}%` }} />
      </div>
      <h2 style={s.qText}>{q.question}</h2>
      {q.subtext && <p style={s.qSubtext}>{q.subtext}</p>}
      <div style={s.tileGrid}>
        {BIZ_TILES.map((tile, i) => {
          const selected = selectedTile === i;
          return (
            <button
              key={i}
              style={{ ...s.tile, ...(selected ? s.tileSelected : {}) }}
              onClick={() => selectTile(i)}
            >
              <span style={s.tileIcon}>{tile.icon}</span>
              <span style={s.tileLabel}>{tile.label}</span>
              <span style={s.tileSub}>{tile.sub}</span>
            </button>
          );
        })}
      </div>
      <div style={s.customWrap}>
        <label style={s.customLabel}>Or describe your business:</label>
        <input
          style={{ ...s.input, ...(customText ? s.inputActive : {}) }}
          placeholder="e.g. Commercial cleaning franchise, SaaS startup..."
          value={customText}
          onChange={e => handleCustomChange(e.target.value)}
        />
      </div>
      <div style={s.navRow}>
        {index > 0 && <button style={s.backBtn} onClick={onBack}>← Back</button>}
        <button
          style={{ ...s.nextBtn, marginLeft: "auto", opacity: canNext ? 1 : 0.35 }}
          onClick={onNext} disabled={!canNext}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function QuestionCard({ q, index, total, answer, onAnswer, onNext, onBack }) {
  const progress = (index / total) * 100;
  const isMulti = q.type === "multi";
  const canNext = isMulti
    ? Array.isArray(answer) && answer.length > 0
    : answer !== undefined;

  return (
    <div style={s.card}>
      <div style={s.qHeader}>
        <span style={s.qLabel}>Question {index + 1} of {total}</span>
        <span style={s.qTimer}>⏱ ~{Math.ceil((total - index) * 0.25)} min left</span>
      </div>
      <div style={s.progressBar}>
        <div style={{ ...s.progressFill, width: `${progress}%` }} />
      </div>
      <h2 style={s.qText}>{q.question}</h2>
      {q.subtext && <p style={s.qSubtext}>{q.subtext}</p>}
      <div style={s.optionsList}>
        {q.options.map((opt, i) => {
          const selected = isMulti ? (answer || []).includes(i) : answer === i;
          return (
            <button
              key={i}
              style={{ ...s.optionBtn, ...(selected ? s.optionBtnSelected : {}) }}
              onClick={() => {
                if (isMulti) {
                  const prev = answer || [];
                  onAnswer(prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
                } else {
                  onAnswer(i);
                }
              }}
            >
              <span style={{ ...s.radio, ...(selected ? s.radioSelected : {}) }}>
                {selected && <span style={s.radioDot} />}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      <div style={s.navRow}>
        {index > 0 && <button style={s.backBtn} onClick={onBack}>← Back</button>}
        <button
          style={{ ...s.nextBtn, marginLeft: "auto", opacity: canNext ? 1 : 0.35 }}
          onClick={onNext} disabled={!canNext}
        >
          {index === total - 1 ? "See My Results →" : "Next →"}
        </button>
      </div>
    </div>
  );
}

function EmailGate({ onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email."); return; }
    onSubmit({ name: name.trim(), email: email.trim() });
  }

  return (
    <div style={s.card}>
      <div style={s.gateIcon}>📊</div>
      <h2 style={s.gateTitle}>Your report is ready.</h2>
      <p style={s.gateSubtitle}>
        We're generating a personalized AI efficiency report based on your answers. Where should we send it?
      </p>
      <div style={s.fieldGroup}>
        <label style={s.fieldLabel}>Your name</label>
        <input style={s.input} placeholder="Jane Smith" value={name}
          onChange={e => { setName(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()} />
      </div>
      <div style={s.fieldGroup}>
        <label style={s.fieldLabel}>Business email</label>
        <input style={s.input} placeholder="jane@yourbusiness.com" type="email" value={email}
          onChange={e => { setEmail(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()} />
      </div>
      {error && <p style={s.errorText}>{error}</p>}
      <button style={s.primaryBtn} onClick={handleSubmit}>Generate My Report →</button>
      <p style={s.gateNote}>No spam. Unsubscribe anytime.</p>
    </div>
  );
}

function LoadingScreen({ userName }) {
  const [progress, setProgress] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  const firstName = userName ? userName.split(" ")[0] : null;
  const messages = [
    "Analyzing your business profile...",
    "Identifying automation opportunities...",
    "Calculating your efficiency gaps...",
    "Writing your personalized report...",
  ];

  useEffect(() => {
    const t1 = setInterval(() => setProgress(p => Math.min(p + 1.5, 95)), 80);
    const t2 = setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 1500);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  return (
    <div style={s.loadingWrap}>
      <div style={s.spinner} />
      {firstName && <p style={s.loadingName}>Building your report, {firstName}...</p>}
      <p style={s.loadingMsg}>{messages[msgIdx]}</p>
      <div style={s.loadingBarWrap}>
        <div style={{ ...s.loadingBarFill, width: `${progress}%` }} />
      </div>
      <p style={s.loadingPct}>{Math.round(progress)}%</p>
    </div>
  );
}

function BenchmarkBar({ score, bizLabel }) {
  const avg = 57;
  const label = bizLabel ? `other ${bizLabel.toLowerCase()} businesses` : "similar businesses";
  const diff = score - avg;
  const isAhead = diff > 0;
  const color = isAhead ? "#22c55e" : "#ef4444";

  return (
    <div style={s.benchmarkWrap}>
      <div style={s.benchmarkRow}>
        <div style={s.benchmarkItem}>
          <span style={{ ...s.benchmarkScore, color: "#06b6d4" }}>{score}</span>
          <span style={s.benchmarkLabel}>Your score</span>
        </div>
        <div style={s.benchmarkDivider} />
        <div style={s.benchmarkItem}>
          <span style={{ ...s.benchmarkScore, color: "#475569" }}>{avg}</span>
          <span style={s.benchmarkLabel}>Industry avg</span>
        </div>
      </div>
      <div style={{ ...s.benchmarkBadge, background: isAhead ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", borderColor: isAhead ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)", color }}>
        {isAhead ? `↑ ${diff} points ahead of ${label}` : `↓ ${Math.abs(diff)} points behind ${label}`}
      </div>
    </div>
  );
}

function ResultsScreen({ score, gaps, useCase, answers, userName, aiReport }) {
  const level = getLevel(score);
  const C = 2 * Math.PI * 54;
  const offset = C - (score / 100) * C;
  const firstName = userName ? userName.split(" ")[0] : null;
  const bizLabel = answers.business_type?.label || null;

  return (
    <div style={s.resultsWrap}>
      <div style={s.scoreCard}>
        {firstName && <p style={s.greeting}>Here's your report, {firstName}.</p>}
        <svg width="140" height="140" style={{ margin: "0 auto", display: "block" }}>
          <circle cx="70" cy="70" r="54" fill="none" stroke="#1e293b" strokeWidth="10" />
          <circle cx="70" cy="70" r="54" fill="none" stroke={level.color} strokeWidth="10"
            strokeDasharray={C} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 70 70)"
            style={{ transition: "stroke-dashoffset 1.5s ease" }} />
          <text x="70" y="65" textAnchor="middle" fill="white" fontSize="30" fontWeight="800" fontFamily="'DM Sans', sans-serif">{score}</text>
          <text x="70" y="83" textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="'DM Sans', sans-serif">/100</text>
        </svg>
        <div style={{ ...s.levelBadge, color: level.color, borderColor: level.color, background: level.bg }}>
          {level.label}
        </div>
        <h2 style={s.resultsTitle}>Your AI Efficiency Score</h2>
        <BenchmarkBar score={score} bizLabel={bizLabel} />
        {aiReport && (
          <div style={s.aiReportWrap}>
            <div style={s.aiReportHeader}><span style={s.aiReportBadge}>✦ AI Analysis</span></div>
            <p style={s.aiReportText}>{aiReport}</p>
          </div>
        )}
      </div>

      {gaps.length > 0 && (
        <div style={s.section}>
          <h3 style={s.sectionTitle}>Your Top Gaps</h3>
          {gaps.map((gap, i) => (
            <div key={i} style={s.gapCard}>
              <div style={s.gapHeader}>
                <span style={s.gapIcon}>{gap.icon}</span>
                <span style={s.gapTitle}>{gap.title}</span>
              </div>
              <p style={s.gapDetail}>{gap.detail}</p>
              <div style={s.gapStat}>⏱ {gap.hours}</div>
            </div>
          ))}
        </div>
      )}

      <div style={s.section}>
        <h3 style={s.sectionTitle}>#1 Recommended Use Case</h3>
        <div style={s.useCaseCard}>
          <h4 style={s.useCaseTitle}>{useCase.title}</h4>
          <p style={s.useCaseDesc}>{useCase.desc}</p>
          <div style={s.roiRow}><span>💰</span><span>{useCase.roi}</span></div>
        </div>
      </div>

      <div style={s.ctaSection}>
        <h3 style={s.ctaTitle}>See your top 3 AI opportunities mapped to your business — in 30 minutes.</h3>
        <p style={s.ctaSubtitle}>We'll review your results, build out the use cases, and show you exactly what implementation looks like — including estimated ROI.</p>
        <a href={CAL_LINK} target="_blank" rel="noopener noreferrer" style={s.ctaBtn}>
          Book Your Free AI Efficiency Audit →
        </a>
        <p style={s.ctaNote}>Free · No obligation · 30 minutes</p>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [userData, setUserData] = useState(null);
  const [aiReport, setAiReport] = useState(null);

  // Rebuild questions every render based on current answers
  const questions = buildQuestions(answers);
  const currentQ = questions[step];

  function handleStart() { setScreen("quiz"); setStep(0); setAnswers({}); }

  function handleAnswer(val) {
    const id = currentQ.id;
    if (id === "business_type") {
      setAnswers(prev => ({ ...prev, business_type: val, business_type_label: val?.label || "" }));
    } else {
      setAnswers(prev => ({ ...prev, [id]: val }));
    }
  }

  function handleNext() {
    if (step < questions.length - 1) { setStep(s => s + 1); }
    else { setScreen("gate"); }
  }

  function handleBack() { setStep(s => Math.max(0, s - 1)); }

  async function handleGateSubmit({ name, email }) {
    setUserData({ name, email });
    setScreen("loading");

    const finalQuestions = buildQuestions(answers);
    const { score, gaps } = scoreAnswers(answers, finalQuestions);
    const useCase = getTopUseCase(answers);
    setResults({ score, gaps, useCase });

    try {
      const report = await generateAIReport(answers, score, name, finalQuestions);
      setAiReport(report);
    } catch (e) {
      setAiReport(null);
    }

    setScreen("results");
  }

  function renderQuiz() {
    const answer = answers[currentQ?.id];
    if (!currentQ) return null;
    if (currentQ.type === "biz_type") {
      return <BizTypeCard q={currentQ} index={step} total={questions.length}
        answer={answer} onAnswer={handleAnswer} onNext={handleNext} onBack={handleBack} />;
    }
    return <QuestionCard q={currentQ} index={step} total={questions.length}
      answer={answer} onAnswer={handleAnswer} onNext={handleNext} onBack={handleBack} />;
  }

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060b18; }
        button { cursor: pointer; font-family: 'DM Sans', sans-serif; border: none; }
        input { font-family: 'DM Sans', sans-serif; }
        a { text-decoration: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 40px rgba(6,182,212,0.1); } 50% { box-shadow: 0 0 70px rgba(6,182,212,0.2); } }
      `}</style>
      <div style={s.wrap}>
        {screen === "landing" && <Landing onStart={handleStart} />}
        {screen === "quiz" && renderQuiz()}
        {screen === "gate" && <EmailGate onSubmit={handleGateSubmit} />}
        {screen === "loading" && <LoadingScreen userName={userData?.name} />}
        {screen === "results" && results && (
          <ResultsScreen score={results.score} gaps={results.gaps} useCase={results.useCase}
            answers={answers} userName={userData?.name} aiReport={aiReport} />
        )}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  root: { minHeight: "100vh", background: "linear-gradient(160deg, #060b18 0%, #0d1526 60%, #060b18 100%)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px 56px", fontFamily: "'DM Sans', sans-serif" },
  wrap: { width: "100%", maxWidth: 500, animation: "fadeUp 0.5s ease" },
  card: { background: "linear-gradient(160deg, #0f1e35 0%, #0d1828 100%)", border: "1px solid rgba(99,179,237,0.12)", borderRadius: 24, padding: "36px 28px", position: "relative", boxShadow: "0 0 60px rgba(6,182,212,0.08), 0 24px 48px rgba(0,0,0,0.4)", animation: "glow 4s ease infinite" },
  freeBadge: { position: "absolute", top: 0, right: 0, background: "linear-gradient(135deg, #0284c7, #06b6d4)", color: "white", fontWeight: 800, fontSize: 10, letterSpacing: 2.5, padding: "6px 18px", borderRadius: "0 24px 0 16px" },
  iconBox: { width: 56, height: 56, background: "linear-gradient(135deg, #0369a1, #0891b2)", borderRadius: 16, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, boxShadow: "0 8px 24px rgba(6,182,212,0.3)" },
  landingTitle: { color: "white", fontSize: 26, fontWeight: 800, lineHeight: 1.2, marginBottom: 12 },
  landingSubtitle: { color: "#94a3b8", fontSize: 15, lineHeight: 1.65, marginBottom: 28 },
  checkList: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 },
  checkItem: { display: "flex", alignItems: "flex-start", gap: 10, color: "#cbd5e1", fontSize: 14 },
  checkIcon: { color: "#06b6d4", fontWeight: 800, flexShrink: 0, marginTop: 1 },
  primaryBtn: { width: "100%", padding: "16px", background: "linear-gradient(135deg, #0284c7, #06b6d4)", color: "white", borderRadius: 14, fontSize: 16, fontWeight: 700, letterSpacing: 0.2, transition: "opacity 0.2s", boxShadow: "0 8px 24px rgba(6,182,212,0.35)" },
  socialProof: { display: "flex", alignItems: "center", gap: 10, marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" },
  avatarStack: { display: "flex", alignItems: "center" },
  avatar: { width: 28, height: 28, borderRadius: "50%", background: "#1e3a5f", border: "2px solid #0d1828", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 },
  socialProofText: { color: "#64748b", fontSize: 12, lineHeight: 1.4 },
  qHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  qLabel: { color: "#64748b", fontSize: 13, fontWeight: 600 },
  qTimer: { color: "#475569", fontSize: 12 },
  progressBar: { height: 3, background: "#1e293b", borderRadius: 99, marginBottom: 24, overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #0284c7, #06b6d4)", borderRadius: 99, transition: "width 0.4s ease" },
  qText: { color: "white", fontSize: 18, fontWeight: 700, lineHeight: 1.4, marginBottom: 8 },
  qSubtext: { color: "#64748b", fontSize: 13, marginBottom: 16 },
  optionsList: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 },
  optionBtn: { display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, color: "#94a3b8", fontSize: 14, textAlign: "left", lineHeight: 1.45, transition: "all 0.15s ease" },
  optionBtnSelected: { background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.4)", color: "white" },
  radio: { width: 18, height: 18, borderRadius: "50%", border: "2px solid #334155", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" },
  radioSelected: { border: "2px solid #06b6d4", background: "rgba(6,182,212,0.15)" },
  radioDot: { width: 8, height: 8, borderRadius: "50%", background: "#06b6d4" },
  navRow: { display: "flex", alignItems: "center", gap: 10 },
  backBtn: { padding: "12px 18px", background: "transparent", border: "1px solid #1e293b", borderRadius: 10, color: "#475569", fontSize: 14, fontWeight: 600 },
  nextBtn: { padding: "12px 22px", background: "linear-gradient(135deg, #0284c7, #06b6d4)", borderRadius: 10, color: "white", fontSize: 14, fontWeight: 700, transition: "opacity 0.2s" },
  tileGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 },
  tile: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3, padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, textAlign: "left", transition: "all 0.15s ease" },
  tileSelected: { background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.45)" },
  tileIcon: { fontSize: 20, marginBottom: 2 },
  tileLabel: { color: "white", fontSize: 13, fontWeight: 700, lineHeight: 1.2 },
  tileSub: { color: "#475569", fontSize: 11, lineHeight: 1.3 },
  customWrap: { marginBottom: 20 },
  customLabel: { display: "block", color: "#475569", fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 },
  input: { padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "white", fontSize: 14, outline: "none", width: "100%", transition: "border-color 0.2s" },
  inputActive: { border: "1px solid rgba(6,182,212,0.4)" },
  gateIcon: { fontSize: 32, marginBottom: 16, width: 60, height: 60, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" },
  gateTitle: { color: "white", fontSize: 24, fontWeight: 800, marginBottom: 10 },
  gateSubtitle: { color: "#94a3b8", fontSize: 14, lineHeight: 1.6, marginBottom: 24 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 },
  fieldLabel: { color: "#64748b", fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" },
  errorText: { color: "#ef4444", fontSize: 13, marginBottom: 10 },
  gateNote: { color: "#334155", fontSize: 12, textAlign: "center", marginTop: 12 },
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 16, padding: 40 },
  spinner: { width: 44, height: 44, border: "3px solid #1e293b", borderTop: "3px solid #06b6d4", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  loadingName: { color: "white", fontSize: 16, fontWeight: 700 },
  loadingMsg: { color: "#94a3b8", fontSize: 14, textAlign: "center", animation: "pulse 1.2s ease infinite" },
  loadingBarWrap: { width: "100%", height: 4, background: "#1e293b", borderRadius: 99, overflow: "hidden" },
  loadingBarFill: { height: "100%", background: "linear-gradient(90deg, #0284c7, #06b6d4)", borderRadius: 99, transition: "width 0.08s linear" },
  loadingPct: { color: "#06b6d4", fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono', monospace" },
  resultsWrap: { display: "flex", flexDirection: "column", gap: 16 },
  scoreCard: { background: "linear-gradient(160deg, #0f1e35 0%, #0d1828 100%)", border: "1px solid rgba(99,179,237,0.12)", borderRadius: 24, padding: "32px 24px", textAlign: "center", boxShadow: "0 0 60px rgba(6,182,212,0.08)" },
  greeting: { color: "#06b6d4", fontSize: 14, fontWeight: 600, marginBottom: 16 },
  levelBadge: { display: "inline-block", fontSize: 11, fontWeight: 800, letterSpacing: 2, border: "1px solid", borderRadius: 99, padding: "4px 14px", marginTop: 14, textTransform: "uppercase" },
  resultsTitle: { color: "white", fontSize: 20, fontWeight: 800, margin: "12px 0 16px" },
  benchmarkWrap: { marginBottom: 16 },
  benchmarkRow: { display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  benchmarkItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 },
  benchmarkScore: { fontSize: 32, fontWeight: 800, fontFamily: "'DM Mono', monospace" },
  benchmarkLabel: { color: "#475569", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 },
  benchmarkDivider: { width: 1, height: 40, background: "rgba(255,255,255,0.08)", margin: "0 16px" },
  benchmarkBadge: { fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 99, border: "1px solid", display: "inline-block" },
  aiReportWrap: { marginTop: 16, padding: "16px 18px", background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: 14, textAlign: "left" },
  aiReportHeader: { marginBottom: 8 },
  aiReportBadge: { color: "#06b6d4", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" },
  aiReportText: { color: "#cbd5e1", fontSize: 14, lineHeight: 1.75 },
  section: { display: "flex", flexDirection: "column", gap: 10 },
  sectionTitle: { color: "white", fontSize: 15, fontWeight: 800, paddingLeft: 2 },
  gapCard: { background: "linear-gradient(160deg, #0f1e35 0%, #0d1828 100%)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "18px 20px" },
  gapHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 },
  gapIcon: { fontSize: 18 },
  gapTitle: { color: "white", fontWeight: 700, fontSize: 15 },
  gapDetail: { color: "#94a3b8", fontSize: 13, lineHeight: 1.65, marginBottom: 10 },
  gapStat: { color: "#f59e0b", fontSize: 12, fontWeight: 600 },
  useCaseCard: { background: "linear-gradient(135deg, rgba(2,132,199,0.12), rgba(6,182,212,0.07))", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 16, padding: "20px" },
  useCaseTitle: { color: "white", fontWeight: 800, fontSize: 17, marginBottom: 8 },
  useCaseDesc: { color: "#94a3b8", fontSize: 14, lineHeight: 1.6, marginBottom: 12 },
  roiRow: { display: "flex", alignItems: "flex-start", gap: 8, color: "#22c55e", fontSize: 13, fontWeight: 600, lineHeight: 1.5 },
  ctaSection: { background: "linear-gradient(135deg, #0c4a6e 0%, #0e7490 100%)", borderRadius: 24, padding: "28px 24px", textAlign: "center", boxShadow: "0 16px 48px rgba(6,182,212,0.2)" },
  ctaTitle: { color: "white", fontSize: 19, fontWeight: 800, lineHeight: 1.35, marginBottom: 12 },
  ctaSubtitle: { color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 1.6, marginBottom: 20 },
  ctaBtn: { display: "block", padding: "16px 24px", background: "white", color: "#0c4a6e", borderRadius: 14, fontSize: 15, fontWeight: 800, marginBottom: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" },
  ctaNote: { color: "rgba(255,255,255,0.45)", fontSize: 12 },
};
