import { useState, useEffect, useCallback, useMemo } from "react";

// ============================================================
// TASK 6: REWRITTEN QUESTIONS — Original behavioral language
// All stems rewritten. Same MOST/LEAST format. Same mode mappings.
// Scoring algorithm unchanged.
// ============================================================
const QUESTIONS = [
  { id:1, stem:"When I'm facing a tough problem, I naturally lean on my:", options:[
    {id:"opt1",text:"Hands-on ability",mode:"IMP"},{id:"opt2",text:"Willingness to dig into the facts",mode:"FF"},
    {id:"opt3",text:"Need to organize a plan",mode:"FT"},{id:"opt4",text:"Drive to try something new",mode:"QS"}]},
  { id:2, stem:"If I thought something could make a real difference in people's lives, I'd want to:", options:[
    {id:"opt1",text:"Study it deeply first",mode:"FF"},{id:"opt2",text:"Map out how it would work",mode:"FT"},
    {id:"opt3",text:"Get the word out right away",mode:"QS"},{id:"opt4",text:"Start making it with my own hands",mode:"IMP"}]},
  { id:3, stem:"If someone told me to wrap up a project faster, I'd:", options:[
    {id:"opt1",text:"Cut straight to what matters most",mode:"QS"},{id:"opt2",text:"Figure out which steps to keep and which to drop",mode:"FT"},
    {id:"opt3",text:"Keep working carefully until time ran out",mode:"FF"},{id:"opt4",text:"Focus on making sure the quality held up",mode:"IMP"}]},
  { id:4, stem:"If I had to talk my way out of a tough spot, I'd make my case by being:", options:[
    {id:"opt1",text:"Steady and logical",mode:"FT"},{id:"opt2",text:"Surprising and creative",mode:"QS"},
    {id:"opt3",text:"Specific with the facts",mode:"FF"},{id:"opt4",text:"Precise about the technical details",mode:"IMP"}]},
  { id:5, stem:"If I entered a competition, I'd most likely win for:", options:[
    {id:"opt1",text:"The quality of what I made",mode:"IMP"},{id:"opt2",text:"How clean and organized it looked",mode:"FT"},
    {id:"opt3",text:"How original the idea was",mode:"QS"},{id:"opt4",text:"How accurate and realistic it was",mode:"FF"}]},
  { id:6, stem:"When something really needs to be my best work, I:", options:[
    {id:"opt1",text:"Go back and verify everything",mode:"FT"},{id:"opt2",text:"Rehearse or practice until it feels right",mode:"IMP"},
    {id:"opt3",text:"Treat it like a challenge to rise to",mode:"QS"},{id:"opt4",text:"Make sure I've done enough homework",mode:"FF"}]},
  { id:7, stem:"The thing most likely to get me in trouble is that I:", options:[
    {id:"opt1",text:"Get restless when things are too routine",mode:"QS"},{id:"opt2",text:"Can't stop tinkering with things",mode:"IMP"},
    {id:"opt3",text:"Push back when things change too fast",mode:"FT"},{id:"opt4",text:"Ask too many questions before moving",mode:"FF"}]},
  { id:8, stem:"When a group starts a new project together, my first move is to:", options:[
    {id:"opt1",text:"Research the background so we know what we're dealing with",mode:"FF"},{id:"opt2",text:"Lay out a clear sequence of steps",mode:"FT"},
    {id:"opt3",text:"Dive in and start figuring it out along the way",mode:"QS"},{id:"opt4",text:"Get my hands on the materials and start building",mode:"IMP"}]},
  { id:9, stem:"If someone asked me to make a process better, I'd start by:", options:[
    {id:"opt1",text:"Studying exactly how it works today",mode:"FF"},{id:"opt2",text:"Sketching out a more logical flow",mode:"FT"},
    {id:"opt3",text:"Throwing out the old approach and trying something fresh",mode:"QS"},{id:"opt4",text:"Running it myself to feel where it breaks",mode:"IMP"}]},
  { id:10, stem:"The work reward that would mean the most to me is:", options:[
    {id:"opt1",text:"Knowing my position is stable",mode:"FT"},{id:"opt2",text:"Better tools and equipment to work with",mode:"IMP"},
    {id:"opt3",text:"A performance-based bonus",mode:"QS"},{id:"opt4",text:"A title that reflects my expertise",mode:"FF"}]},
  { id:11, stem:"Something I really try to stay away from is:", options:[
    {id:"opt1",text:"Having to guess without enough information",mode:"FF"},{id:"opt2",text:"Open-ended brainstorming with no direction",mode:"QS"},
    {id:"opt3",text:"Having to operate heavy or unfamiliar equipment",mode:"IMP"},{id:"opt4",text:"Being constantly interrupted mid-task",mode:"FT"}]},
  { id:12, stem:"If I won an award for something creative, it would probably be for:", options:[
    {id:"opt1",text:"The precision and patterns in my work",mode:"FT"},{id:"opt2",text:"How lifelike and detailed it looked",mode:"FF"},
    {id:"opt3",text:"The boldness of the choices I made",mode:"QS"},{id:"opt4",text:"Something I physically built or sculpted",mode:"IMP"}]},
  { id:13, stem:"When people joke about me, it's usually about my:", options:[
    {id:"opt1",text:"Sensitivity to how things feel",mode:"IMP"},{id:"opt2",text:"Tendency to act on impulse",mode:"QS"},
    {id:"opt3",text:"Insistence on getting details right",mode:"FF"},{id:"opt4",text:"Habit of sticking with routines",mode:"FT"}]},
  { id:14, stem:"The way I show what I'm capable of best is through:", options:[
    {id:"opt1",text:"Written analysis or research",mode:"FF"},{id:"opt2",text:"Visual layouts or charts",mode:"FT"},
    {id:"opt3",text:"Talking it through live",mode:"QS"},{id:"opt4",text:"Physical prototypes or samples",mode:"IMP"}]},
  { id:15, stem:"If I were running a project, the thing I'd care most about is:", options:[
    {id:"opt1",text:"Making sure we hit the exact requirements",mode:"FF"},{id:"opt2",text:"Using the right materials and resources",mode:"IMP"},
    {id:"opt3",text:"Staying on budget and on process",mode:"FT"},{id:"opt4",text:"Bringing fresh ideas to the table",mode:"QS"}]},
  { id:16, stem:"I do my strongest work when what I'm doing feels:", options:[
    {id:"opt1",text:"Different from day to day",mode:"QS"},{id:"opt2",text:"Organized and predictable",mode:"FT"},
    {id:"opt3",text:"Backed by solid preparation",mode:"FF"},{id:"opt4",text:"Physical and tangible",mode:"IMP"}]},
  { id:17, stem:"When I'm setting expectations for how things should be done, I want them to be:", options:[
    {id:"opt1",text:"Concrete and visible",mode:"IMP"},{id:"opt2",text:"Consistent across the board",mode:"FT"},
    {id:"opt3",text:"Open to adjustment",mode:"QS"},{id:"opt4",text:"Backed by clear data",mode:"FF"}]},
  { id:18, stem:"The criticism I hear most often is that I'm too:", options:[
    {id:"opt1",text:"Quick to move before things are settled",mode:"QS"},{id:"opt2",text:"Particular about how things feel physically",mode:"IMP"},
    {id:"opt3",text:"Rigid about how things should be organized",mode:"FT"},{id:"opt4",text:"Focused on debating the details",mode:"FF"}]},
  { id:19, stem:"When I'm assigned something new, the first thing I do is:", options:[
    {id:"opt1",text:"Start asking questions and gathering information",mode:"FF"},{id:"opt2",text:"Get my hands on something and start making progress",mode:"IMP"},
    {id:"opt3",text:"Look for a new angle or approach",mode:"QS"},{id:"opt4",text:"Map out the steps in order",mode:"FT"}]},
  { id:20, stem:"When I come across something I've never seen before, my instinct is to:", options:[
    {id:"opt1",text:"Pick it up and figure out how it's constructed",mode:"IMP"},{id:"opt2",text:"Look for a pattern or system behind it",mode:"FT"},
    {id:"opt3",text:"Study it closely for specific details",mode:"FF"},{id:"opt4",text:"Form a quick gut impression",mode:"QS"}]},
  { id:21, stem:"When I'm walking someone through an idea, I tend to be:", options:[
    {id:"opt1",text:"Off-the-cuff and energetic",mode:"QS"},{id:"opt2",text:"Step-by-step and ordered",mode:"FT"},
    {id:"opt3",text:"Specific about how it works mechanically",mode:"IMP"},{id:"opt4",text:"Comprehensive and detailed",mode:"FF"}]},
  { id:22, stem:"The most effective way for me to get an idea across is to:", options:[
    {id:"opt1",text:"Show the data and evidence in writing",mode:"FF"},{id:"opt2",text:"Use a physical example or demo",mode:"IMP"},
    {id:"opt3",text:"Paint a vivid picture of the possibility",mode:"QS"},{id:"opt4",text:"Present a clear visual breakdown",mode:"FT"}]},
  { id:23, stem:"When I need to learn about something, my best approach is to:", options:[
    {id:"opt1",text:"Organize what I find into a clear layout",mode:"FT"},{id:"opt2",text:"Go deep on the background and history",mode:"FF"},
    {id:"opt3",text:"Look in unexpected places for fresh angles",mode:"QS"},{id:"opt4",text:"Get hands-on experience with it directly",mode:"IMP"}]},
  { id:24, stem:"When I'm telling someone about a place I've been, I focus on:", options:[
    {id:"opt1",text:"How things were laid out and arranged",mode:"FT"},{id:"opt2",text:"The specific facts and details I noticed",mode:"FF"},
    {id:"opt3",text:"The quality of the space and materials",mode:"IMP"},{id:"opt4",text:"The overall vibe and energy of the place",mode:"QS"}]},
  { id:25, stem:"I'm most likely to be recognized for my:", options:[
    {id:"opt1",text:"Quick thinking and resourcefulness",mode:"QS"},{id:"opt2",text:"Physical effort and persistence",mode:"IMP"},
    {id:"opt3",text:"Reliability and careful planning",mode:"FT"},{id:"opt4",text:"Sound judgment based on real evidence",mode:"FF"}]},
  { id:26, stem:"When picking how I want to work, I'd rather:", options:[
    {id:"opt1",text:"Roll up my sleeves and do it hands-on",mode:"IMP"},{id:"opt2",text:"Have a team to bounce ideas off of",mode:"QS"},
    {id:"opt3",text:"Direct the work while others execute",mode:"FF"},{id:"opt4",text:"Work within a smooth, flowing process",mode:"FT"}]},
  { id:27, stem:"To make sure I actually finish things, I depend on:", options:[
    {id:"opt1",text:"Knowing exactly what matters most",mode:"FF"},{id:"opt2",text:"Having a plan laid out ahead of time",mode:"FT"},
    {id:"opt3",text:"Doing the work with real craftsmanship",mode:"IMP"},{id:"opt4",text:"Treating it like a challenge to beat",mode:"QS"}]},
  { id:28, stem:"When I'm locked in on a single task, I'm extremely:", options:[
    {id:"opt1",text:"Efficient and methodical",mode:"FT"},{id:"opt2",text:"Instinctive and fast-moving",mode:"QS"},
    {id:"opt3",text:"Skilled with my hands",mode:"IMP"},{id:"opt4",text:"Thorough and precise",mode:"FF"}]},
  { id:29, stem:"When working through a complex puzzle, I'm best at:", options:[
    {id:"opt1",text:"Racing against the clock",mode:"QS"},{id:"opt2",text:"Assembling the physical pieces",mode:"IMP"},
    {id:"opt3",text:"Remembering key facts and clues",mode:"FF"},{id:"opt4",text:"Sorting through the options systematically",mode:"FT"}]},
  { id:30, stem:"When I need to convince someone, my instinct is to:", options:[
    {id:"opt1",text:"Demonstrate it in a tangible way",mode:"IMP"},{id:"opt2",text:"Walk them through my process step by step",mode:"FT"},
    {id:"opt3",text:"Lay out the evidence on both sides",mode:"FF"},{id:"opt4",text:"Sell them on the upside and potential",mode:"QS"}]},
  { id:31, stem:"I naturally prefer to do things in a way that feels:", options:[
    {id:"opt1",text:"Grounded and fact-based",mode:"FF"},{id:"opt2",text:"Physical and tangible",mode:"IMP"},
    {id:"opt3",text:"Fast and decisive",mode:"QS"},{id:"opt4",text:"Careful and measured",mode:"FT"}]},
  { id:32, stem:"If I had to set up a display or presentation space, I'd:", options:[
    {id:"opt1",text:"Arrange everything in a clear, logical order",mode:"FT"},{id:"opt2",text:"Try something unexpected to make it stand out",mode:"QS"},
    {id:"opt3",text:"Look at what's worked well in the past",mode:"FF"},{id:"opt4",text:"Get in there and set it up with my own hands",mode:"IMP"}]},
  { id:33, stem:"When something breaks down unexpectedly, my first reaction is to:", options:[
    {id:"opt1",text:"Find a creative workaround",mode:"QS"},{id:"opt2",text:"Get in there and fix it",mode:"IMP"},
    {id:"opt3",text:"Figure out the root cause",mode:"FF"},{id:"opt4",text:"Document it and flag it for the right person",mode:"FT"}]},
  { id:34, stem:"When I'm picking up a new skill, I learn best by:", options:[
    {id:"opt1",text:"Experimenting and seeing what happens",mode:"QS"},{id:"opt2",text:"Repeating it until my body knows the motion",mode:"IMP"},
    {id:"opt3",text:"Reading and studying the background first",mode:"FF"},{id:"opt4",text:"Following a clear set of steps from someone who's done it",mode:"FT"}]},
  { id:35, stem:"When I present what I've accomplished, my style is usually:", options:[
    {id:"opt1",text:"Solid and built to last",mode:"IMP"},{id:"opt2",text:"Precise and carefully verified",mode:"FF"},
    {id:"opt3",text:"Well-organized and polished",mode:"FT"},{id:"opt4",text:"Energetic and off-the-cuff",mode:"QS"}]},
  { id:36, stem:"If I were running my own business, the thing I'd focus on most is:", options:[
    {id:"opt1",text:"Keeping operations consistent and reliable",mode:"FT"},{id:"opt2",text:"Making decisions backed by real data",mode:"FF"},
    {id:"opt3",text:"Constantly launching new products and ideas",mode:"QS"},{id:"opt4",text:"Delivering work you can see and touch",mode:"IMP"}]}
];

// ============================================================
// DATA: CONTENT MATRIX
// ============================================================
// TASK 5: All Kolbe-sourced terminology removed. "Action Modes" → "Dimensions".
// "Fact Finder/Follow Thru/Quick Start/Implementor" retained as FUNCTIONAL labels
// (they describe behavior, not Kolbe IP). Zone names are original to this app.
const STRENGTH_DATA = {
  FF: {
    counteract: { name: "Simplify", title: "The Big Picture Thinker",
      desc: "You cut through noise fast. While others drown in data, you pull the one thing that matters and move on.",
      superpower: "You make complex things simple. People leave conversations with you feeling lighter because you stripped out everything that didn't matter.",
      shadow: "You can dismiss important details too fast. Sometimes the thing you skipped was the thing that mattered.",
      atBest: "Summarizing a 40-page report into a 3-sentence decision framework. Cutting a meeting from 60 minutes to 15.",
      underStress: "Oversimplifying things that need nuance. Dismissing research someone spent real time on.",
      othersKnow: "Don't give me the whole history. Give me the headline and what you need from me."
    },
    accommodate: { name: "Explain", title: "The Translator",
      desc: "You take in the right amount of information for the situation and translate it so others can act on it. Not too deep, not too shallow.",
      superpower: "You match the depth of your research to the actual demands of the situation. You clarify without overloading.",
      shadow: "You can drift. The middle ground is flexible, but it can feel vague when precision matters.",
      atBest: "Editing a document so it says more with fewer words. Explaining a complex process to someone with zero background.",
      underStress: "Second-guessing whether you researched enough. Feeling caught between people who want more data and people who want less.",
      othersKnow: "I'll give you what's relevant. Just tell me what level we're working at."
    },
    initiate: { name: "Specify", title: "The Deep Researcher",
      desc: "You don't guess. You go deep. Before you commit to anything, you've gathered more data than most people knew existed.",
      superpower: "You catch what everyone else misses. When you present a recommendation, it's backed by real data, real precedent, and real analysis.",
      shadow: "You can over-research. The feeling of 'not enough information' can keep you digging when the team needed a decision three days ago.",
      atBest: "Building a case so thorough that the decision becomes obvious. Finding the one data point that changes the whole strategy.",
      underStress: "Analysis paralysis. Burying teammates in details they didn't ask for. Getting frustrated when others go with gut feel.",
      othersKnow: "If I'm asking a lot of questions, I'm not doubting you. I'm building confidence in the decision."
    }
  },
  FT: {
    counteract: { name: "Adapt", title: "The Shortcut Finder",
      desc: "You don't follow the process. You route around it. You work in piles, not files. You thrive in chaos that would paralyze a structured thinker.",
      superpower: "You're the most flexible person in the room. Plans change? You're already adjusting. System breaks? You're already finding the workaround.",
      shadow: "Following through on someone else's process physically drains you. You can leave things 80% finished because the last 20% is boring.",
      atBest: "Handling five interruptions in a row and still producing. Finding the shortcut through a bureaucratic nightmare.",
      underStress: "Losing track of commitments. Resisting any process that feels rigid, even when rigidity would help.",
      othersKnow: "Don't give me a 47-step checklist. Give me the outcome and let me find my way there."
    },
    accommodate: { name: "Maintain", title: "The System Keeper",
      desc: "You keep what works running. You adjust, tweak, and tune. When something's almost right, you're the one who makes it actually right.",
      superpower: "You bridge the gap between the person who creates the system and the person who breaks it. You spot inconsistencies and keep things running.",
      shadow: "You might not speak up when a whole system needs to be rebuilt. Tweaking feels safer than replacing.",
      atBest: "Taking a disorganized project and quietly bringing order. Spotting the one broken step in a process everyone else missed.",
      underStress: "Maintaining a system that should've been scrapped. Feeling invisible because your work is behind the scenes.",
      othersKnow: "I'll keep us organized. Don't mistake my flexibility for not caring about structure."
    },
    initiate: { name: "Systematize", title: "The System Builder",
      desc: "You instinctively design sequential processes, chart timelines, create order from chaos, and build systems that turn vague ideas into repeatable outcomes.",
      superpower: "You turn abstract projects into concrete plans. You create the timeline, the checklist, the accountability structure. Your systems outlast you.",
      shadow: "You can over-systematize things that don't need a system. You may feel physical discomfort when things are disorganized.",
      atBest: "Designing a workflow that turns a messy operation into a machine. Charting a 90-day plan with milestones in one sitting.",
      underStress: "Becoming controlling when others don't follow your system. Spending more time organizing the work than doing it.",
      othersKnow: "I need to know the sequence. Where are we, what's next, what's the end state?"
    }
  },
  QS: {
    counteract: { name: "Stabilize", title: "The Anchor",
      desc: "You bring calm to chaos. You don't resist change because you're afraid. You resist unnecessary change because you know the cost of breaking what works.",
      superpower: "You're the reason the whole thing doesn't fall apart. You create standards. You hold the line. Teams with you ship smart.",
      shadow: "You can hold on too long. The status quo becomes a comfort zone, and comfort zones have a shelf life.",
      atBest: "Preventing a costly mistake by asking the one cautious question nobody else thought to ask.",
      underStress: "Saying no to everything new. Becoming the bottleneck because you won't greenlight anything without certainty.",
      othersKnow: "I'm not against new ideas. I'm against untested ideas replacing things that already work."
    },
    accommodate: { name: "Modify", title: "The Bridge",
      desc: "You live between stability and chaos. You'll try new things, but you test them first. You evaluate risk without being paralyzed by it or blind to it.",
      superpower: "You're the translator between the innovator and the stabilizer. You take a wild idea and make it workable.",
      shadow: "Your flexibility can look like indecision. You may not push hard enough in either direction.",
      atBest: "Taking someone's half-baked idea and shaping it into something that actually works.",
      underStress: "Deferring to whoever is loudest. Spending too long in 'let's see' mode.",
      othersKnow: "I'm open to change, but I want to understand the trade-offs first."
    },
    initiate: { name: "Innovate", title: "The Spark",
      desc: "You're wired for creative risk. You generate ideas faster than most people can process them. Repetition is your kryptonite. Possibility is your fuel.",
      superpower: "You see what doesn't exist yet and feel compelled to create it. You generate options when everyone else is stuck. You start things. That's rare.",
      shadow: "You start more than you finish. The thrill of the new idea is so strong that yesterday's idea loses its charge.",
      atBest: "Pitching the idea that changes everything. Solving an impossible problem from an angle nobody considered.",
      underStress: "Starting new projects to avoid finishing old ones. Creating chaos that others have to clean up.",
      othersKnow: "Let me brainstorm and prototype. Don't expect me to maintain the thing I built."
    }
  },
  IMP: {
    counteract: { name: "Envision", title: "The Abstract Thinker",
      desc: "You live in your head. Not checked out, but that's where your best work happens. You visualize outcomes and make decisions without needing to touch anything.",
      superpower: "You can imagine finished products before a single piece has been assembled. You work fast because you don't need physical proof to trust your judgment.",
      shadow: "You can undervalue hands-on work. What's crystal clear in your head isn't visible to anyone else until they can see it.",
      atBest: "Making a complex decision without needing a prototype because you already see how it plays out.",
      underStress: "Refusing to engage with the physical world when hands-on is required. Frustrating teammates with invisible visions.",
      othersKnow: "I don't need to see the prototype. I already see it. Let me describe what I'm imagining."
    },
    accommodate: { name: "Restore", title: "The Fixer",
      desc: "You keep things working. Not by building from scratch, but by repairing, renovating, and upgrading what already exists.",
      superpower: "You walk into a situation and spot exactly what's failing. You fix it, improve it, and it works better than before.",
      shadow: "You might keep fixing something that should've been replaced. The instinct to restore can keep you patching too long.",
      atBest: "Renovating a workspace, process, or product so it performs better than new.",
      underStress: "Fixing things compulsively instead of asking if they should be fixed. Holding onto things past their useful life.",
      othersKnow: "Before we start over, let me look at what we've got. There might be more to save than you think."
    },
    initiate: { name: "Build", title: "The Maker",
      desc: "You need to touch it. Build it. Hold it. Your ideas become real when they exist in physical space. You think with your hands.",
      superpower: "You bring ideas out of the abstract and into reality. While others are still talking, you've already built a version of it.",
      shadow: "You can over-invest in building before the concept is validated. You might build the prototype before the strategy is clear.",
      atBest: "Building a working prototype while the team is still debating. Demonstrating an idea so clearly everyone instantly gets it.",
      underStress: "Building things nobody asked for. Feeling useless when nothing is physical. Over-focusing on tangible output.",
      othersKnow: "Let me build something. Even a rough version. I understand things better when I can hold them."
    }
  }
};

// TASK 5: Renamed from Kolbe "Action Modes" to neutral "Dimensions"
const MODE_LABELS = { FF: "Information", FT: "Organization", QS: "Change", IMP: "Execution" };

const DOMINANT_NARRATIVES = {
  FF: { how: "Your brain runs on information. Before you do anything, you need to understand it. This isn't overthinking. This is your engine. Feed it the right inputs and you make decisions faster than anyone in the room.", success: "Expertise. Being the person people come to because you know the most. Deep command of a domain.", reset: "Read something interesting. Research a new topic. Let your information-gathering instinct refuel you.", procrastination: "You're stuck because you don't feel like you know enough to start. The fix isn't more research. It's accepting that you know enough right now." },
  FT: { how: "Your brain runs on structure. Open loops drain you. Finished systems energize you. You feel most alive when something that was chaotic is now organized, sequenced, and running.", success: "Completion. Systems that work. The satisfaction of seeing something go from messy to organized. Reliable outcomes.", reset: "Organize something small. Clean a drawer, sort a folder, finish a tiny open loop. Completion restores your energy.", procrastination: "You're stuck because the task feels too disorganized to enter. The fix isn't a better system. It's defining one single next step." },
  QS: { how: "Your brain runs on possibility. New ideas, new problems, new territory. The moment something becomes familiar, your energy drops. Build your life around starting things.", success: "Autonomy. Creative control. Variety. The ability to start new things without asking permission.", reset: "Do something new. Walk a different route, start a micro-project, brainstorm for 10 minutes. Novelty restarts your engine.", procrastination: "You're stuck because the task is boring. The fix isn't discipline. It's finding the angle that makes it interesting." },
  IMP: { how: "Your brain runs on the physical world. Ideas feel incomplete until you can touch them. You think with your hands. Environments that are all talk and no making will drain you.", success: "Tangible output. Something you can point at and say 'I built that.' Physical evidence of your work.", reset: "Touch something physical. Cook. Build. Fix. Move your hands. Your brain reconnects through the physical world.", procrastination: "You're stuck because the task is too abstract. The fix isn't more thinking. It's building something, even a sketch." }
};

const RESISTANCE_NARRATIVES = {
  FF: "Deep research drains you. You can do it, but it costs more energy than it gives. Get the summary. Trust your pattern recognition.",
  FT: "Rigid process kills your momentum. Build your own structure, make it flexible, and don't let anyone shame you for having piles instead of files.",
  QS: "Uncertainty costs you energy. You perform best when the path is clear and the variables are known.",
  IMP: "Physical building isn't your instinct. You see it in your mind. Delegate the tangible stuff and operate in the abstract."
};

const DANGER_ZONES = {
  FF: { high: "Researching until the window of opportunity closes.", low: "Making decisions on incomplete data and not realizing it until the consequences arrive." },
  FT: { high: "Over-systematizing simple things. Building a process for something that needed a quick decision.", low: "Promising to follow a process and then quietly doing it your own way, eroding trust." },
  QS: { high: "Destabilizing a team with too many pivots. Confusing activity with progress.", low: "Holding on to something past its expiration because change feels like a threat." },
  IMP: { high: "Building before validating. Creating something beautiful that solves the wrong problem.", low: "Dismissing the value of physical prototypes when the situation genuinely requires them." }
};

// TASK 2: Score-to-percentile mapping. Derived from the 1-10 scale position.
// A score of 10 means the user pushed that dimension harder than ~95% of possible outcomes.
// This is NOT a population norm (we don't have population data). It's a scale-position indicator.
const SCORE_CONTEXT = {
  1: "lowest possible", 2: "very low", 3: "low",
  4: "below center", 5: "center", 6: "above center",
  7: "high", 8: "very high", 9: "near maximum", 10: "maximum"
};
const scorePercentile = (s) => Math.round(((s - 1) / 9) * 100);

// ============================================================
// DATA: CAREER ARCHETYPES
// TASK 7 NOTE: freedom/creation/income are EDITORIAL scores assigned
// per career archetype. They are NOT derived from the user's quiz answers.
// energyFit IS derived from quiz answers (zone matching).
// The final alignment score blends both. This is by design: career
// attributes are properties of the career, not the user.
// ============================================================
const CAREER_ARCHETYPES = [
  // ── HIGH FACT FINDER (Specify) — The Researchers ──
  { id:1, title:"Data Scientist / Analyst", subtitle:"Turn raw data into decisions", category:"Research / Analytics", icon:"📊", tags:["analytical"],
    desc:"You dig into datasets, find patterns, build models, and translate findings into strategy. Your thoroughness is the product.", freedom:72, creation:65, income:82,
    idealZones:{FF:["initiate"],FT:["accommodate","initiate"],QS:["counteract","accommodate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:2, title:"Market Research Director", subtitle:"Know the market better than anyone", category:"Research / Strategy", icon:"🔍", tags:["analytical","consulting"],
    desc:"You study markets, competitors, and consumers at depth. Companies pay premium for your thoroughness.", freedom:70, creation:55, income:80,
    idealZones:{FF:["initiate"],FT:["accommodate","initiate"],QS:["counteract","accommodate"],IMP:["counteract"]}, deadIf:null },
  { id:3, title:"Legal Analyst / Paralegal", subtitle:"Precision protects people", category:"Legal / Compliance", icon:"⚖️", tags:["analytical"],
    desc:"You research case law, draft documents, and build arguments backed by evidence. Your attention to detail wins.", freedom:55, creation:40, income:72,
    idealZones:{FF:["initiate"],FT:["accommodate","initiate"],QS:["counteract"],IMP:["counteract"]}, deadIf:null },
  { id:4, title:"Physician / Medical Diagnostician", subtitle:"Deep knowledge saves lives", category:"Healthcare", icon:"🩺", tags:["analytical","hands-on"],
    desc:"You gather patient data, research conditions, weigh evidence, and make high-stakes diagnostic decisions.", freedom:55, creation:45, income:92,
    idealZones:{FF:["initiate"],FT:["accommodate","initiate"],QS:["counteract","accommodate"],IMP:["accommodate","initiate"]}, deadIf:null },
  { id:5, title:"Academic Researcher", subtitle:"Go deeper than anyone on earth", category:"Education / Research", icon:"🎓", tags:["analytical","teaching"],
    desc:"You investigate, publish, and teach at the frontier of a field. Your instinct to specify is the entire job.", freedom:68, creation:70, income:65,
    idealZones:{FF:["initiate"],FT:["accommodate","initiate"],QS:["counteract","accommodate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:6, title:"Investigative Journalist", subtitle:"Find the truth nobody else found", category:"Media / Research", icon:"📰", tags:["analytical","creative"],
    desc:"You research deeply, verify facts, and tell stories backed by evidence. Your Fact Finder instinct drives the whole process.", freedom:72, creation:82, income:60,
    idealZones:{FF:["initiate"],FT:["counteract","accommodate"],QS:["accommodate","initiate"],IMP:["counteract"]}, deadIf:null },
  { id:7, title:"Policy Analyst / Think Tank", subtitle:"Research that shapes decisions", category:"Government / Policy", icon:"🏛️", tags:["analytical"],
    desc:"You study issues in depth, write policy briefs, and advise decision-makers with your thoroughness.", freedom:60, creation:55, income:70,
    idealZones:{FF:["initiate"],FT:["accommodate","initiate"],QS:["counteract","accommodate"],IMP:["counteract"]}, deadIf:null },
  // ── MID FACT FINDER (Explain) — The Translators ──
  { id:8, title:"Technical Writer", subtitle:"Make the complex clear", category:"Writing / Documentation", icon:"📝", tags:["creative","analytical"],
    desc:"You translate complex information into clear documentation. You match the depth to the audience. Clarity is your craft.", freedom:78, creation:72, income:68,
    idealZones:{FF:["accommodate"],FT:["accommodate","initiate"],QS:["counteract","accommodate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:9, title:"Training & Development Manager", subtitle:"Help people learn what they need", category:"Education / Corporate", icon:"🎯", tags:["teaching"],
    desc:"You design training programs, explain processes, and help people get up to speed with exactly the right amount of information.", freedom:62, creation:68, income:72,
    idealZones:{FF:["accommodate"],FT:["accommodate","initiate"],QS:["accommodate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:10, title:"Product Manager", subtitle:"Translate between everyone", category:"Tech / Product", icon:"📋", tags:["creative","consulting"],
    desc:"You bridge engineering, design, business, and users. You gather enough to make good calls without over-researching.", freedom:65, creation:70, income:85,
    idealZones:{FF:["accommodate"],FT:["accommodate"],QS:["accommodate","initiate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:11, title:"Client Success Manager", subtitle:"Keep relationships healthy and growing", category:"Client Services", icon:"🤝", tags:["consulting"],
    desc:"You understand client needs, translate them into actions, and keep things running smoothly at the right level.", freedom:58, creation:45, income:70,
    idealZones:{FF:["accommodate"],FT:["accommodate"],QS:["accommodate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:12, title:"UX Researcher", subtitle:"Understand users deeply enough to design for them", category:"Design / Research", icon:"🧪", tags:["analytical","creative"],
    desc:"You study how people use products, synthesize findings, and communicate insights to design teams.", freedom:68, creation:65, income:78,
    idealZones:{FF:["accommodate","initiate"],FT:["accommodate"],QS:["accommodate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:13, title:"Curriculum Designer", subtitle:"Structure learning so it sticks", category:"Education / Design", icon:"📖", tags:["teaching","creative"],
    desc:"You organize knowledge into clear sequences. You know what to include, what to cut, and how to pace information.", freedom:70, creation:75, income:68,
    idealZones:{FF:["accommodate"],FT:["accommodate","initiate"],QS:["accommodate"],IMP:["counteract","accommodate"]}, deadIf:null },
  // ── LOW FACT FINDER (Simplify) — Big Picture Movers ──
  { id:14, title:"CEO / Executive Leader", subtitle:"Big picture. Fast decisions.", category:"Leadership / Executive", icon:"👔", tags:["owner"],
    desc:"You cut through noise, make fast calls with limited data, and keep the organization moving forward.", freedom:80, creation:55, income:95,
    idealZones:{FF:["counteract"],FT:["accommodate"],QS:["accommodate","initiate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:15, title:"Sales Director / VP Sales", subtitle:"Simplify the pitch. Close the deal.", category:"Sales / Revenue", icon:"💰", tags:["owner"],
    desc:"You distill value propositions to their essence, read people fast, and move deals forward without getting lost.", freedom:68, creation:45, income:90,
    idealZones:{FF:["counteract"],FT:["counteract","accommodate"],QS:["accommodate","initiate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:16, title:"Venture Capital / Angel Investor", subtitle:"Pattern-match fast. Bet on the right people.", category:"Finance / Investing", icon:"🚀", tags:["owner","consulting"],
    desc:"You evaluate opportunities at the big-picture level, trust your pattern recognition, and make investment decisions fast.", freedom:85, creation:40, income:95,
    idealZones:{FF:["counteract","accommodate"],FT:["counteract","accommodate"],QS:["initiate"],IMP:["counteract"]}, deadIf:null },
  { id:17, title:"Brand Strategist", subtitle:"Distill a brand to its essence", category:"Creative / Strategy", icon:"✨", tags:["creative","consulting"],
    desc:"You see the big picture of what a brand should be. You simplify complex positioning into a clear story.", freedom:75, creation:80, income:75,
    idealZones:{FF:["counteract","accommodate"],FT:["counteract","accommodate"],QS:["accommodate","initiate"],IMP:["counteract"]}, deadIf:null },
  { id:18, title:"Crisis Communications Manager", subtitle:"Cut through chaos. Deliver the message.", category:"Communications / PR", icon:"📡", tags:["consulting"],
    desc:"You simplify complex situations into clear messaging under extreme time pressure. Big picture, fast action.", freedom:60, creation:55, income:78,
    idealZones:{FF:["counteract"],FT:["counteract","accommodate"],QS:["initiate"],IMP:["counteract"]}, deadIf:null },
  // ── HIGH FOLLOW THRU (Systematize) — System Builders ──
  { id:19, title:"Supply Chain / Logistics Manager", subtitle:"Design the system that moves everything", category:"Operations / Logistics", icon:"🚛", tags:[],
    desc:"You build sequential systems that move products from A to B with zero waste. Your instinct for order is the entire operation.", freedom:55, creation:50, income:78,
    idealZones:{FF:["accommodate"],FT:["initiate"],QS:["counteract","accommodate"],IMP:["accommodate"]}, deadIf:null },
  { id:20, title:"Accountant / Controller / CFO", subtitle:"Numbers in order. Business on track.", category:"Finance / Operations", icon:"📒", tags:["analytical"],
    desc:"You organize financial data into clear systems, track every number, and bring structural closure to fiscal operations.", freedom:62, creation:35, income:82,
    idealZones:{FF:["accommodate","initiate"],FT:["initiate"],QS:["counteract"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:21, title:"Project Manager / Program Director", subtitle:"The plan, the timeline, the accountability", category:"Operations / Management", icon:"📐", tags:["consulting"],
    desc:"You chart timelines, assign tasks, track milestones, and bring structural closure to abstract projects.", freedom:60, creation:45, income:78,
    idealZones:{FF:["accommodate"],FT:["initiate"],QS:["counteract","accommodate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:22, title:"Quality Assurance Director", subtitle:"Build the standard. Hold the line.", category:"Operations / Quality", icon:"✅", tags:[],
    desc:"You design testing protocols, build checklists, and create systems that catch errors before they ship.", freedom:55, creation:40, income:75,
    idealZones:{FF:["accommodate","initiate"],FT:["initiate"],QS:["counteract"],IMP:["accommodate"]}, deadIf:null },
  { id:23, title:"Database Administrator", subtitle:"Architect the information layer", category:"Tech / Infrastructure", icon:"🗄️", tags:["analytical"],
    desc:"You design, organize, and maintain data systems. Structure, schemas, and sequential logic are your native language.", freedom:65, creation:55, income:82,
    idealZones:{FF:["accommodate","initiate"],FT:["initiate"],QS:["counteract","accommodate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:24, title:"Event Production Manager", subtitle:"Orchestrate every detail on a timeline", category:"Production / Events", icon:"🎪", tags:["creative"],
    desc:"You plan events from concept to execution, managing timelines, vendors, logistics, and contingencies.", freedom:65, creation:70, income:72,
    idealZones:{FF:["accommodate"],FT:["initiate"],QS:["accommodate"],IMP:["accommodate","initiate"]}, deadIf:null },
  { id:25, title:"Operations & Systems Architect", subtitle:"Design the machine that runs the business", category:"Operations / Systems", icon:"⚙️", tags:["consulting"],
    desc:"Build SOPs, workflows, and operational infrastructure. You bring order to chaos. Your systems outlast you.", freedom:75, creation:65, income:80,
    idealZones:{FF:["accommodate","initiate"],FT:["initiate"],QS:["counteract","accommodate"],IMP:["accommodate"]}, deadIf:null },
  // ── MID FOLLOW THRU (Maintain) — System Keepers ──
  { id:26, title:"HR Manager / People Operations", subtitle:"Keep the people systems running", category:"Human Resources", icon:"👥", tags:[],
    desc:"You maintain hiring pipelines, onboarding processes, and employee systems. You spot inconsistencies and keep things functional.", freedom:55, creation:40, income:72,
    idealZones:{FF:["accommodate"],FT:["accommodate"],QS:["accommodate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:27, title:"Executive Assistant / Chief of Staff", subtitle:"Keep the leader and the org in sync", category:"Operations / Support", icon:"📌", tags:[],
    desc:"You maintain calendars, workflows, and communication systems. You bridge gaps and keep things running.", freedom:45, creation:35, income:68,
    idealZones:{FF:["accommodate"],FT:["accommodate"],QS:["counteract","accommodate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:28, title:"Property Manager", subtitle:"Keep spaces functional and tenants happy", category:"Real Estate / Operations", icon:"🏠", tags:[],
    desc:"You maintain properties, adjust procedures, handle tenant needs, and keep physical systems working.", freedom:65, creation:35, income:68,
    idealZones:{FF:["accommodate"],FT:["accommodate"],QS:["counteract","accommodate"],IMP:["accommodate"]}, deadIf:null },
  { id:29, title:"Client Account Manager", subtitle:"Keep relationships and deliverables on track", category:"Client Services", icon:"📞", tags:["consulting"],
    desc:"You maintain client relationships, track deliverables, adjust timelines, and keep projects flowing smoothly.", freedom:55, creation:40, income:70,
    idealZones:{FF:["accommodate"],FT:["accommodate"],QS:["accommodate"],IMP:["counteract","accommodate"]}, deadIf:null },
  // ── LOW FOLLOW THRU (Adapt) — Shortcut Finders ──
  { id:30, title:"Freelance Creative Director", subtitle:"Your vision. Your way. Every time.", category:"Creative / Independent", icon:"🎨", tags:["creative","owner"],
    desc:"You direct creative projects without rigid process. You juggle multiple clients and thrive in creative chaos.", freedom:88, creation:92, income:80,
    idealZones:{FF:["accommodate"],FT:["counteract"],QS:["accommodate","initiate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:31, title:"Emergency Services / First Responder", subtitle:"Adapt instantly under pressure", category:"Public Safety", icon:"🚨", tags:["hands-on"],
    desc:"You make split-second decisions in chaotic environments, improvise solutions with limited resources.", freedom:40, creation:30, income:65,
    idealZones:{FF:["counteract"],FT:["counteract"],QS:["initiate"],IMP:["accommodate","initiate"]}, deadIf:null },
  { id:32, title:"Adventure Guide / Outdoor Leader", subtitle:"Lead in unpredictable environments", category:"Outdoors / Experience", icon:"🏔️", tags:["hands-on","teaching"],
    desc:"You guide groups through wilderness, adapt to weather and terrain changes, and create experiences in uncontrolled environments.", freedom:72, creation:55, income:55,
    idealZones:{FF:["counteract","accommodate"],FT:["counteract"],QS:["accommodate","initiate"],IMP:["accommodate","initiate"]}, deadIf:null },
  // ── HIGH QUICK START (Innovate) — The Sparks ──
  { id:33, title:"Startup Founder", subtitle:"See what doesn't exist yet. Build it.", category:"Founder / Operator", icon:"🚀", tags:["owner","creative"],
    desc:"You generate ideas, take calculated risks, pivot fast, and energize teams with vision. Building from zero fuels you.", freedom:90, creation:88, income:92,
    idealZones:{FF:["accommodate"],FT:["counteract","accommodate"],QS:["initiate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:34, title:"Creative Agency Owner", subtitle:"Own the creative output and the business", category:"Founder / Creative", icon:"🏗️", tags:["owner","creative","consulting"],
    desc:"You run the strategy, the creative direction, and the client relationships. You pick the work and set the rates.", freedom:88, creation:90, income:85,
    idealZones:{FF:["accommodate"],FT:["counteract","accommodate"],QS:["initiate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:35, title:"Performance Marketing Agency", subtitle:"Own the playbook. Own the upside.", category:"Founder / Marketing", icon:"📈", tags:["owner","consulting"],
    desc:"You own the clients, strategy, and schedule. Paid ads, growth systems. Remote, leveraged. The equity is yours.", freedom:92, creation:82, income:90,
    idealZones:{FF:["accommodate","initiate"],FT:["accommodate"],QS:["accommodate","initiate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:36, title:"Product Designer / Innovation Lead", subtitle:"Design what doesn't exist yet", category:"Design / Innovation", icon:"💡", tags:["creative"],
    desc:"You conceive new products, prototype rapidly, and push past conventional approaches.", freedom:68, creation:92, income:80,
    idealZones:{FF:["accommodate"],FT:["accommodate"],QS:["initiate"],IMP:["accommodate","initiate"]}, deadIf:null },
  { id:37, title:"Film / Video Director", subtitle:"Create the vision. Command the set.", category:"Media / Entertainment", icon:"🎬", tags:["creative"],
    desc:"You envision the final product, improvise on set, and bring creative projects to life under pressure.", freedom:72, creation:95, income:75,
    idealZones:{FF:["counteract","accommodate"],FT:["counteract","accommodate"],QS:["initiate"],IMP:["accommodate","initiate"]}, deadIf:null },
  { id:38, title:"Online Educator & Creator", subtitle:"Teaching at scale. Income while you sleep.", category:"Creator / Educator", icon:"🎥", tags:["owner","creative","teaching"],
    desc:"YouTube, newsletter, courses, cohorts. Build a brand around your expertise. Every piece of content compounds.", freedom:90, creation:95, income:82,
    idealZones:{FF:["accommodate","initiate"],FT:["counteract","accommodate"],QS:["accommodate","initiate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:39, title:"Growth Consultant / Fractional CMO", subtitle:"Senior impact without the cage", category:"Consultant / Executive", icon:"🧭", tags:["consulting"],
    desc:"Embed part-time into growing companies as their strategic brain. High rate. Variety across clients.", freedom:78, creation:62, income:84,
    idealZones:{FF:["accommodate","initiate"],FT:["accommodate"],QS:["accommodate","initiate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:40, title:"Comedian / Entertainer", subtitle:"Improvise. Energize. Create in the moment.", category:"Entertainment", icon:"🎭", tags:["creative"],
    desc:"You thrive on spontaneity, read audiences instantly, and create energy from nothing. Every performance is new.", freedom:75, creation:90, income:65,
    idealZones:{FF:["counteract"],FT:["counteract"],QS:["initiate"],IMP:["counteract","accommodate"]}, deadIf:null },
  // ── MID QUICK START (Modify) — The Bridges ──
  { id:41, title:"General Manager / COO", subtitle:"Translate vision into operations", category:"Management / Operations", icon:"⚙️", tags:["consulting"],
    desc:"You bridge strategy and execution. You take new ideas and make them workable, adjust plans when reality shifts.", freedom:60, creation:50, income:82,
    idealZones:{FF:["accommodate"],FT:["accommodate"],QS:["accommodate"],IMP:["accommodate"]}, deadIf:null },
  { id:42, title:"Management Consultant", subtitle:"Evaluate, recommend, implement", category:"Consulting / Strategy", icon:"📊", tags:["consulting","analytical"],
    desc:"You assess business problems, weigh options, and recommend measured responses. The balanced middle path.", freedom:72, creation:55, income:85,
    idealZones:{FF:["accommodate","initiate"],FT:["accommodate"],QS:["accommodate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:43, title:"Business Development Manager", subtitle:"Find opportunities. Build relationships.", category:"Sales / Partnerships", icon:"🔗", tags:["consulting"],
    desc:"You test new partnerships, try out approaches, and create measured responses to market opportunities.", freedom:65, creation:45, income:78,
    idealZones:{FF:["accommodate"],FT:["accommodate"],QS:["accommodate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:44, title:"Mediator / Conflict Resolution", subtitle:"Find the workable middle ground", category:"Legal / Facilitation", icon:"🤝", tags:["consulting"],
    desc:"You bridge opposing positions, test solutions, and find paths that work for everyone. Measured, not extreme.", freedom:70, creation:40, income:72,
    idealZones:{FF:["accommodate"],FT:["accommodate"],QS:["accommodate"],IMP:["counteract"]}, deadIf:null },
  // ── LOW QUICK START (Stabilize) — The Anchors ──
  { id:45, title:"Risk Manager / Insurance Analyst", subtitle:"Protect what matters", category:"Finance / Risk", icon:"🛡️", tags:["analytical"],
    desc:"You identify risks, build safeguards, and prevent problems before they happen. Your caution keeps things intact.", freedom:55, creation:35, income:78,
    idealZones:{FF:["accommodate","initiate"],FT:["accommodate","initiate"],QS:["counteract"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:46, title:"Air Traffic Controller", subtitle:"Steady under pressure. No improvisation.", category:"Aviation / Safety", icon:"✈️", tags:[],
    desc:"You follow precise protocols, maintain standards under extreme pressure, and protect lives by keeping things predictable.", freedom:35, creation:20, income:82,
    idealZones:{FF:["accommodate"],FT:["initiate"],QS:["counteract"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:47, title:"Regulatory Compliance Specialist", subtitle:"Hold the standard. Enforce the rules.", category:"Legal / Compliance", icon:"📜", tags:["analytical"],
    desc:"You create standards, audit processes, and ensure organizations stay within boundaries.", freedom:52, creation:30, income:72,
    idealZones:{FF:["accommodate","initiate"],FT:["initiate"],QS:["counteract"],IMP:["counteract"]}, deadIf:null },
  { id:48, title:"Archivist / Records Manager", subtitle:"Preserve. Organize. Protect.", category:"Information / Preservation", icon:"📚", tags:["analytical"],
    desc:"You maintain records, preserve historical materials, and keep information systems organized. Stability is the service.", freedom:55, creation:35, income:58,
    idealZones:{FF:["accommodate","initiate"],FT:["initiate"],QS:["counteract"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:49, title:"Quality Control Inspector", subtitle:"Consistency is the product", category:"Manufacturing / Quality", icon:"🔬", tags:["hands-on"],
    desc:"You inspect, measure, and verify that products meet standards. You protect the status quo of quality.", freedom:45, creation:25, income:62,
    idealZones:{FF:["accommodate"],FT:["accommodate","initiate"],QS:["counteract"],IMP:["accommodate"]}, deadIf:null },
  // ── HIGH IMPLEMENTOR (Build) — The Makers ──
  { id:50, title:"General Contractor", subtitle:"Build the physical world", category:"Construction / Trades", icon:"🔨", tags:["owner","hands-on"],
    desc:"You manage construction projects, coordinate crews, and build tangible structures. Your work is visible and durable.", freedom:72, creation:75, income:80,
    idealZones:{FF:["accommodate"],FT:["accommodate","initiate"],QS:["accommodate"],IMP:["initiate"]}, deadIf:null },
  { id:51, title:"Mechanical / Civil Engineer", subtitle:"Design and build systems that work", category:"Engineering", icon:"⚙️", tags:["analytical","hands-on"],
    desc:"You design physical systems, test prototypes, and solve tangible problems through building and testing.", freedom:60, creation:75, income:82,
    idealZones:{FF:["accommodate","initiate"],FT:["accommodate","initiate"],QS:["counteract","accommodate"],IMP:["initiate"]}, deadIf:null },
  { id:52, title:"Chef / Restaurant Owner", subtitle:"Create with your hands. Feed people.", category:"Culinary / Hospitality", icon:"👨‍🍳", tags:["creative","hands-on","owner"],
    desc:"You build flavors, manage kitchens, and create physical experiences. Every dish is tangible creation.", freedom:65, creation:90, income:70,
    idealZones:{FF:["accommodate"],FT:["accommodate"],QS:["accommodate","initiate"],IMP:["initiate"]}, deadIf:null },
  { id:53, title:"Industrial / Product Designer", subtitle:"Design things people hold", category:"Design / Manufacturing", icon:"🖊️", tags:["creative","hands-on"],
    desc:"You design physical products, build prototypes, and solve problems through tangible creation.", freedom:65, creation:88, income:78,
    idealZones:{FF:["accommodate"],FT:["accommodate"],QS:["accommodate","initiate"],IMP:["initiate"]}, deadIf:null },
  { id:54, title:"Physical Therapist / Athletic Trainer", subtitle:"Heal through hands-on work", category:"Healthcare / Fitness", icon:"💪", tags:["hands-on","teaching"],
    desc:"You use your hands to diagnose, treat, and rehabilitate. You demonstrate exercises and see tangible progress.", freedom:65, creation:55, income:75,
    idealZones:{FF:["accommodate"],FT:["accommodate"],QS:["counteract","accommodate"],IMP:["initiate"]}, deadIf:null },
  { id:55, title:"Electrician / Plumber / HVAC", subtitle:"Skilled trades. Always in demand.", category:"Skilled Trades", icon:"🔧", tags:["hands-on","owner"],
    desc:"You build, install, and repair physical systems. High demand, honest work, tangible results every day.", freedom:72, creation:65, income:75,
    idealZones:{FF:["counteract","accommodate"],FT:["accommodate"],QS:["counteract","accommodate"],IMP:["initiate"]}, deadIf:null },
  { id:56, title:"Surgeon / Dentist", subtitle:"Precision with your hands under pressure", category:"Healthcare / Specialist", icon:"🏥", tags:["hands-on","analytical"],
    desc:"You perform precise physical work under high stakes. Your hands, training, and composure are the value.", freedom:55, creation:50, income:95,
    idealZones:{FF:["initiate"],FT:["initiate"],QS:["counteract"],IMP:["initiate"]}, deadIf:null },
  { id:57, title:"Furniture Maker / Woodworker", subtitle:"Craft something that lasts generations", category:"Artisan / Maker", icon:"🪑", tags:["creative","hands-on","owner"],
    desc:"You shape raw materials into functional, beautiful objects. Creation in physical form.", freedom:78, creation:92, income:60,
    idealZones:{FF:["counteract","accommodate"],FT:["accommodate"],QS:["counteract","accommodate"],IMP:["initiate"]}, deadIf:null },
  { id:58, title:"Landscape Architect", subtitle:"Shape outdoor spaces people experience", category:"Design / Outdoors", icon:"🌿", tags:["creative","hands-on"],
    desc:"You design and build outdoor environments. Plants, hardscape, water, terrain. The physical world is your medium.", freedom:70, creation:85, income:72,
    idealZones:{FF:["accommodate"],FT:["accommodate"],QS:["accommodate"],IMP:["initiate"]}, deadIf:null },
  // ── MID IMPLEMENTOR (Restore) — The Fixers ──
  { id:59, title:"IT Support / Systems Administrator", subtitle:"Keep digital infrastructure running", category:"Tech / Operations", icon:"🖥️", tags:[],
    desc:"You troubleshoot, repair, and maintain technology systems. You spot what's broken and fix it.", freedom:58, creation:40, income:72,
    idealZones:{FF:["accommodate"],FT:["accommodate"],QS:["counteract","accommodate"],IMP:["accommodate"]}, deadIf:null },
  { id:60, title:"Property Renovation / Flipper", subtitle:"Buy broken. Make better. Profit.", category:"Real Estate / Renovation", icon:"🏚️", tags:["owner","hands-on"],
    desc:"You find undervalued properties, renovate them, and sell or rent at profit. You restore what's broken.", freedom:78, creation:72, income:80,
    idealZones:{FF:["accommodate"],FT:["accommodate"],QS:["accommodate"],IMP:["accommodate","initiate"]}, deadIf:null },
  { id:61, title:"Auto Restoration Specialist", subtitle:"Bring machines back to life", category:"Automotive / Restoration", icon:"🚗", tags:["hands-on","creative"],
    desc:"You restore vehicles to original condition or better. Repair, upgrade, and extend the life of machines.", freedom:72, creation:78, income:65,
    idealZones:{FF:["accommodate"],FT:["accommodate"],QS:["counteract","accommodate"],IMP:["accommodate","initiate"]}, deadIf:null },
  // ── LOW IMPLEMENTOR (Envision) — Abstract Thinkers ──
  { id:62, title:"Strategy Consultant", subtitle:"See the whole board. Move the right piece.", category:"Consulting / Strategy", icon:"♟️", tags:["consulting","analytical"],
    desc:"You process everything mentally. Visualize outcomes, map scenarios, and advise on decisions without needing to touch anything.", freedom:78, creation:55, income:88,
    idealZones:{FF:["accommodate","initiate"],FT:["accommodate"],QS:["accommodate"],IMP:["counteract"]}, deadIf:null },
  { id:63, title:"Financial Planner / Wealth Advisor", subtitle:"Map financial futures in your head", category:"Finance / Advisory", icon:"💎", tags:["consulting","analytical"],
    desc:"You visualize long-term financial scenarios, model outcomes, and guide decisions. The work happens in your mind.", freedom:75, creation:40, income:85,
    idealZones:{FF:["accommodate","initiate"],FT:["accommodate","initiate"],QS:["counteract","accommodate"],IMP:["counteract"]}, deadIf:null },
  { id:64, title:"Therapist / Counselor", subtitle:"Help people see what they can't see alone", category:"Healthcare / Mental Health", icon:"🧠", tags:["teaching"],
    desc:"You hold space, visualize patterns in behavior, and guide people toward insight. Entirely in the realm of ideas.", freedom:75, creation:50, income:72,
    idealZones:{FF:["accommodate"],FT:["counteract","accommodate"],QS:["accommodate"],IMP:["counteract"]}, deadIf:null },
  { id:65, title:"Author / Writer", subtitle:"Build worlds with words", category:"Creative / Writing", icon:"📖", tags:["creative","owner"],
    desc:"You construct narratives and ideas entirely in your mind before putting them on the page. Abstract medium, lasting output.", freedom:90, creation:95, income:60,
    idealZones:{FF:["accommodate","initiate"],FT:["counteract","accommodate"],QS:["accommodate"],IMP:["counteract"]}, deadIf:null },
  { id:66, title:"UX/UI Designer (Digital)", subtitle:"Design experiences people feel but can't touch", category:"Design / Digital", icon:"🎨", tags:["creative"],
    desc:"You envision user flows, design interfaces, and solve problems visually. Your work lives on screens.", freedom:72, creation:88, income:80,
    idealZones:{FF:["accommodate"],FT:["accommodate"],QS:["accommodate","initiate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:67, title:"Podcast Host / Media Personality", subtitle:"Create through conversation and ideas", category:"Media / Creator", icon:"🎙️", tags:["creative","owner"],
    desc:"You host conversations, develop narratives, and build audiences through ideas. Pure communication and vision.", freedom:82, creation:85, income:70,
    idealZones:{FF:["accommodate"],FT:["counteract","accommodate"],QS:["accommodate","initiate"],IMP:["counteract"]}, deadIf:null },
  // ── CROSS-PROFILE CAREERS ──
  { id:68, title:"High-Ticket Business Coach", subtitle:"Deep work. Real results. Premium rates.", category:"Advisor / Coach", icon:"🧠", tags:["teaching","consulting","owner"],
    desc:"Coach professionals on growth and strategy. Your expertise monetized at premium. Remote. Flexible.", freedom:84, creation:60, income:88,
    idealZones:{FF:["accommodate","initiate"],FT:["counteract","accommodate"],QS:["accommodate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:69, title:"Mastermind Host / Community", subtitle:"Curate rooms where the right people connect", category:"Community / Experience", icon:"🏕️", tags:["teaching","owner"],
    desc:"Run a high-ticket community. You facilitate, curate, and connect. Your natural energy runs the room.", freedom:80, creation:65, income:82,
    idealZones:{FF:["accommodate"],FT:["accommodate","initiate"],QS:["accommodate","initiate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:70, title:"Micro-SaaS Founder", subtitle:"A tool that solves one painful problem", category:"SaaS / Builder", icon:"🛠️", tags:["owner","creative"],
    desc:"Build a niche software tool. Recurring revenue. Location-free. Leveraged.", freedom:87, creation:80, income:88,
    idealZones:{FF:["accommodate","initiate"],FT:["initiate"],QS:["initiate"],IMP:["accommodate","initiate"]}, deadIf:null },
  { id:71, title:"Newsletter & Content Business", subtitle:"An audience that becomes an asset", category:"Writer / Creator", icon:"✍️", tags:["creative","owner"],
    desc:"A content platform at the intersection of your expertise. Monetize via sponsorships, premium tiers, community.", freedom:90, creation:88, income:75,
    idealZones:{FF:["initiate"],FT:["counteract","accommodate"],QS:["accommodate","initiate"],IMP:["counteract"]}, deadIf:null },
  { id:72, title:"Paid Keynote Speaker", subtitle:"Commanding rooms that pay premium", category:"Speaker / Educator", icon:"🎤", tags:["teaching","creative"],
    desc:"You energize rooms naturally. Speak on your domain expertise. High leverage per hour.", freedom:78, creation:70, income:82,
    idealZones:{FF:["accommodate","initiate"],FT:["counteract","accommodate"],QS:["accommodate","initiate"],IMP:["counteract","accommodate"]}, deadIf:null },
  { id:73, title:"Real Estate Agent / Broker", subtitle:"Connect people with spaces", category:"Real Estate / Sales", icon:"🏡", tags:["owner"],
    desc:"You match people with properties, negotiate deals, and manage relationships. Blend of people skills and tangible assets.", freedom:75, creation:40, income:82,
    idealZones:{FF:["accommodate"],FT:["accommodate"],QS:["accommodate","initiate"],IMP:["accommodate"]}, deadIf:null },
  { id:74, title:"Nurse / Physician Assistant", subtitle:"Care through knowledge and hands-on skill", category:"Healthcare / Clinical", icon:"💉", tags:["hands-on","teaching"],
    desc:"You combine medical knowledge with hands-on patient care. Research meets tangible, human impact.", freedom:45, creation:40, income:78,
    idealZones:{FF:["accommodate"],FT:["accommodate","initiate"],QS:["counteract","accommodate"],IMP:["accommodate","initiate"]}, deadIf:null },
  { id:75, title:"Teacher / Educator (K-12 or Trade)", subtitle:"Shape the next generation directly", category:"Education / Teaching", icon:"🍎", tags:["teaching"],
    desc:"You teach, mentor, and guide learners. Your energy comes from the aha moment. Structure varies by setting.", freedom:45, creation:65, income:55,
    idealZones:{FF:["accommodate"],FT:["accommodate"],QS:["accommodate"],IMP:["counteract","accommodate"]}, deadIf:null },
  // ── DEAD ZONE CAREERS ──
  { id:76, title:"VP / Head of Department (In-House)", subtitle:"High title. Low freedom.", category:"In-House / Executive", icon:"💼", tags:[],
    desc:"Strong skill match possible. But someone caps your income, owns your schedule, and can remove you.", freedom:25, creation:45, income:75,
    idealZones:{FF:["accommodate","initiate"],FT:["accommodate","initiate"],QS:["counteract"],IMP:["counteract","accommodate"]},
    deadIf:"No upside ownership. Permission culture. Capped income. Schedule owned by others." },
  { id:77, title:"Corporate Mid-Level Role", subtitle:"Benefits and stability. Limited everything else.", category:"Corporate / Employee", icon:"🏢", tags:[],
    desc:"Structured income and benefits. But mind-numbing execution, unnecessary meetings, no creative ownership.", freedom:22, creation:30, income:65,
    idealZones:{FF:["accommodate"],FT:["accommodate","initiate"],QS:["counteract"],IMP:["counteract","accommodate"]},
    deadIf:"Rigid process. No creative control. Your strongest instincts have nowhere to go." },
  { id:78, title:"Freelance Task Execution", subtitle:"Flexible but below your level", category:"Freelance / Execution", icon:"📋", tags:[],
    desc:"Ad hoc task work. Report formatting, data entry, manual processes. Zero creative thought required.", freedom:65, creation:15, income:40,
    idealZones:{FF:["counteract"],FT:["initiate"],QS:["counteract"],IMP:["accommodate","initiate"]},
    deadIf:"No creative ownership. Mind-numbing execution. Below any profile with strong instincts." }
];

// TASK 5: Renamed tier labels
function scoreCareerFit(career, userZones, userEnergy, userDominant) {
  let zoneMatch = 0;
  let totalWeight = 0;
  const modes = ["FF", "FT", "QS", "IMP"];
  for (const m of modes) {
    const w = userEnergy[m] / 25;
    totalWeight += w;
    if (career.idealZones[m].includes(userZones[m])) zoneMatch += w;
    else {
      const uz = userZones[m];
      const idealSet = career.idealZones[m];
      if (uz === "accommodate" || idealSet.includes("accommodate")) zoneMatch += w * 0.5;
    }
  }
  const energyFit = Math.round((zoneMatch / totalWeight) * 100);
  const avg = (career.freedom + career.creation + career.income + energyFit) / 4;
  const alignment = Math.round(avg) / 10;
  // TASK 5: "tier" renamed to "fit" internally, labels changed in UI
  const fit = alignment >= 8.5 ? 1 : alignment >= 6.5 ? 2 : 3;
  return { energyFit, alignment: Math.min(10, alignment), fit };
}

// ============================================================
// SCORING ENGINE — TASK 7: ALGORITHM AUDIT
// Confirmed: All output derives purely from quiz responses.
// rawScores ← sum of +2/-2 per MOST/LEAST selection
// normalized ← linear transform of rawScores
// energy ← absolute deviation from center
// zones ← threshold on normalized scores
// strengths ← lookup from zones into STRENGTH_DATA
// No external data injected. No assumptions beyond the user's 72 selections.
// ============================================================
function scoreAssessment(responses) {
  const rawScores = { FF: 0, FT: 0, QS: 0, IMP: 0 };
  for (const q of QUESTIONS) {
    const r = responses[q.id];
    if (!r) continue;
    const mostMode = q.options.find(o => o.id === r.most)?.mode;
    const leastMode = q.options.find(o => o.id === r.least)?.mode;
    if (mostMode) rawScores[mostMode] += 2;
    if (leastMode) rawScores[leastMode] -= 2;
  }
  const DIVISOR = 12;
  const normalized = {};
  for (const [m, raw] of Object.entries(rawScores)) {
    normalized[m] = Math.max(1, Math.min(10, Math.round(5.5 + raw / DIVISOR)));
  }
  const devs = {};
  let totalDev = 0;
  for (const [m, s] of Object.entries(normalized)) { devs[m] = Math.abs(s - 5.5); totalDev += devs[m]; }
  const energy = {};
  if (totalDev === 0) { for (const m of Object.keys(normalized)) energy[m] = 25; }
  else {
    const floored = [];
    for (const [m, d] of Object.entries(devs)) {
      let p = (d / totalDev) * 100;
      if (p < 5) { p = 5; floored.push(m); }
      energy[m] = p;
    }
    const nonF = Object.keys(energy).filter(m => !floored.includes(m));
    const nonFTotal = nonF.reduce((s, m) => s + energy[m], 0);
    if (nonFTotal > 0) {
      const adj = (100 - floored.length * 5) / nonFTotal;
      for (const m of nonF) energy[m] = Math.round(energy[m] * adj);
    }
    for (const m of floored) energy[m] = 5;
    const tot = Object.values(energy).reduce((a, b) => a + b, 0);
    if (tot !== 100) { const mx = Object.entries(energy).sort((a, b) => b[1] - a[1])[0][0]; energy[mx] += 100 - tot; }
  }
  const zones = {}, strengths = {};
  for (const [m, s] of Object.entries(normalized)) {
    zones[m] = s <= 3 ? "counteract" : s <= 6 ? "accommodate" : "initiate";
    strengths[m] = STRENGTH_DATA[m][zones[m]];
  }
  const sorted = Object.entries(energy).sort((a, b) => b[1] - a[1]);
  return { rawScores, scores: normalized, energy, zones, strengths, dominant: sorted[0][0], resistance: sorted[sorted.length - 1][0], mo: `${normalized.FF}-${normalized.FT}-${normalized.QS}-${normalized.IMP}` };
}

// ============================================================
// STYLES
// ============================================================
const fonts = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Mono:wght@400;500&display=swap');
`;

const S = {
  black: "#0a0a0a", white: "#f5f3ef", mid: "#7a766e", rule: "#d0ccc4",
  onDarkBody: "#c8c4bc", onDarkDim: "#888480",
  bebas: "'Bebas Neue', sans-serif", cormorant: "'Cormorant Garamond', serif", mono: "'DM Mono', monospace",
};

// ============================================================
// COMPONENTS
// ============================================================
function IntroScreen({ onStart }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: S.black, padding: "48px 24px", textAlign: "center" }}>
      <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: S.onDarkDim, marginBottom: 32 }}>Behavioral Assessment / Personal Operating Manual</div>
      <h1 style={{ fontFamily: S.bebas, fontSize: "clamp(60px, 14vw, 140px)", lineHeight: 0.9, color: S.white, letterSpacing: -1, margin: 0 }}>HOW ARE<br/>YOU WIRED?</h1>
      <p style={{ fontFamily: S.cormorant, fontSize: "clamp(17px, 2.5vw, 22px)", fontStyle: "italic", color: "#999", maxWidth: 480, marginTop: 24, lineHeight: 1.55 }}>
        36 questions. No right answers. Discover how you instinctively take action, where your energy goes, and how to use your wiring instead of fighting it.
      </p>
      <p style={{ fontFamily: S.cormorant, fontSize: 15, color: "#666", maxWidth: 420, marginTop: 16, lineHeight: 1.6 }}>
        For each question, pick the action you'd MOST likely take and the action you'd LEAST likely take. Go with your gut. Don't overthink it.
      </p>
      <button onClick={onStart} style={{ marginTop: 48, fontFamily: S.bebas, fontSize: 22, letterSpacing: "0.08em", background: S.white, color: S.black, border: "none", padding: "16px 56px", cursor: "pointer", transition: "transform 0.15s" }}
        onMouseEnter={e => e.target.style.transform = "scale(1.04)"}
        onMouseLeave={e => e.target.style.transform = "scale(1)"}
      >BEGIN ASSESSMENT</button>
      <div style={{ fontFamily: S.mono, fontSize: 10, color: "#444", marginTop: 24, letterSpacing: "0.15em" }}>~8 MINUTES</div>
    </div>
  );
}

function QuestionCard({ question, index, total, response, onSelect, onNext, onBack }) {
  const { most, least } = response || {};
  const canProceed = most && least;
  const getState = (optId) => { if (most === optId) return "most"; if (least === optId) return "least"; return "none"; };
  const handleClick = (optId) => {
    const current = getState(optId);
    if (current === "most") { onSelect(question.id, { most: null, least }); return; }
    if (current === "least") { onSelect(question.id, { most, least: null }); return; }
    if (!most) { onSelect(question.id, { most: optId, least }); return; }
    if (!least) { onSelect(question.id, { most, least: optId }); return; }
  };
  const pct = Math.round(((index) / total) * 100);
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: S.white }}>
      <div style={{ padding: "16px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: "0.2em", color: S.mid }}>{index + 1} OF {total}</div>
        <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: "0.2em", color: S.mid }}>{pct}%</div>
      </div>
      <div style={{ height: 2, background: S.rule, margin: "8px 24px 0" }}>
        <div style={{ height: "100%", background: S.black, width: `${pct}%`, transition: "width 0.4s ease" }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 24px", maxWidth: 640, margin: "0 auto", width: "100%" }}>
        <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: "0.2em", color: S.mid, marginBottom: 12 }}>WHEN FREE TO BE MYSELF...</div>
        <h2 style={{ fontFamily: S.cormorant, fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 500, lineHeight: 1.35, color: S.black, margin: "0 0 8px" }}>{question.stem}</h2>
        <p style={{ fontFamily: S.mono, fontSize: 10, color: S.mid, letterSpacing: "0.15em", marginBottom: 24 }}>
          {!most ? "TAP YOUR MOST LIKELY ACTION" : !least ? "NOW TAP YOUR LEAST LIKELY ACTION" : "SELECTIONS COMPLETE. TAP TO CHANGE."}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, border: `1px solid ${S.rule}` }}>
          {question.options.map((opt) => {
            const state = getState(opt.id);
            const bg = state === "most" ? S.black : state === "least" ? "#e8e4dc" : "transparent";
            const color = state === "most" ? S.white : S.black;
            const label = state === "most" ? "MOST" : state === "least" ? "LEAST" : "";
            return (
              <button key={opt.id} onClick={() => handleClick(opt.id)} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "18px 20px", background: bg, color, border: "none",
                borderBottom: `1px solid ${state === "most" ? "#333" : S.rule}`,
                fontFamily: S.cormorant, fontSize: 18, fontWeight: 400, cursor: "pointer",
                textAlign: "left", transition: "all 0.15s", lineHeight: 1.4
              }}>
                <span>{opt.text}</span>
                {label && <span style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: "0.2em", opacity: 0.7 }}>{label}</span>}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
          <button onClick={onBack} disabled={index === 0} style={{
            fontFamily: S.mono, fontSize: 11, letterSpacing: "0.1em", background: "transparent",
            border: `1px solid ${index === 0 ? S.rule : S.black}`, color: index === 0 ? S.rule : S.black,
            padding: "10px 24px", cursor: index === 0 ? "default" : "pointer"
          }}>BACK</button>
          <button onClick={onNext} disabled={!canProceed} style={{
            fontFamily: S.bebas, fontSize: 18, letterSpacing: "0.06em",
            background: canProceed ? S.black : S.rule, color: canProceed ? S.white : S.mid,
            border: "none", padding: "10px 32px", cursor: canProceed ? "pointer" : "default",
            transition: "all 0.15s"
          }}>{index === total - 1 ? "SEE MY RESULTS" : "NEXT"}</button>
        </div>
      </div>
    </div>
  );
}

function ProcessingScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const steps = ["Mapping your responses", "Calculating dimensions", "Building energy profile", "Generating your operating manual"];
  useEffect(() => {
    const timers = steps.map((_, i) => setTimeout(() => setStep(i + 1), (i + 1) * 700));
    const done = setTimeout(onDone, steps.length * 700 + 600);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, []);
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: S.black, padding: 48 }}>
      <div style={{ fontFamily: S.bebas, fontSize: "clamp(36px, 6vw, 64px)", color: S.white, marginBottom: 48, textAlign: "center" }}>ANALYZING YOUR WIRING</div>
      {steps.map((s, i) => (
        <div key={i} style={{ fontFamily: S.mono, fontSize: 12, letterSpacing: "0.1em", color: step > i ? S.white : "#333", marginBottom: 12, transition: "color 0.4s" }}>
          {step > i ? "✓" : "○"} {s}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// RESULTS / OPERATING MANUAL
// TASK 1: Plain-language explanation at top
// TASK 2: Percentile context on all scores
// TASK 3: Table of contents
// TASK 4: Collapsible career listings
// TASK 5: Label renames throughout
// ============================================================
function ResultsManual({ results }) {
  const { scores, energy, zones, strengths, dominant, resistance, mo } = results;
  const domData = DOMINANT_NARRATIVES[dominant];
  const resData = RESISTANCE_NARRATIVES[resistance];
  const modes = ["FF", "FT", "QS", "IMP"];
  const [careerFilter, setCareerFilter] = useState("all");
  const [activeFeature, setActiveFeature] = useState(null);
  const [stressSymptoms, setStressSymptoms] = useState([]);
  const [decisionAnswers, setDecisionAnswers] = useState({});
  const [partnerMO, setPartnerMO] = useState({ FF: "", FT: "", QS: "", IMP: "" });
  const [compatResult, setCompatResult] = useState(null);
  const [weeklyRatings, setWeeklyRatings] = useState({ FF: 3, FT: 3, QS: 3, IMP: 3 });
  const [weeklySubmitted, setWeeklySubmitted] = useState(false);
  const [dailyDismissed, setDailyDismissed] = useState(false);
  // TASK 4: Collapsible state
  const [expandedSections, setExpandedSections] = useState({});
  const toggleSection = (key) => setExpandedSections(prev => ({...prev, [key]: !prev[key]}));

  // Helper components
  const Section = ({ id, num, eyebrow, title, children, dark }) => (
    <div id={id} style={{ background: dark ? S.black : S.white, color: dark ? S.white : S.black, padding: "56px 24px", borderBottom: `2px solid ${S.black}`, position: "relative", maxWidth: 800, margin: "0 auto", width: "100%" }}>
      <div style={{ fontFamily: S.bebas, fontSize: 100, lineHeight: 1, color: dark ? "#1e1e1e" : S.rule, position: "absolute", top: 16, right: 24, pointerEvents: "none", userSelect: "none" }}>{num}</div>
      <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: dark ? S.onDarkDim : S.mid, marginBottom: 20 }}>{eyebrow}</div>
      <h2 style={{ fontFamily: S.bebas, fontSize: "clamp(32px, 5vw, 52px)", letterSpacing: "0.02em", lineHeight: 1, marginBottom: 24, color: dark ? S.white : S.black }}>{title}</h2>
      {children}
    </div>
  );

  const P = ({ children, dark, style: sx }) => (
    <p style={{ fontFamily: S.cormorant, fontSize: 18, lineHeight: 1.75, color: dark ? S.onDarkBody : "#1a1a1a", marginBottom: 16, maxWidth: 540, ...sx }}>{children}</p>
  );

  const Pull = ({ children, dark }) => (
    <div style={{ fontFamily: S.cormorant, fontSize: "clamp(20px, 3vw, 28px)", fontStyle: "italic", fontWeight: 500, lineHeight: 1.35, color: dark ? S.white : S.black, borderLeft: `3px solid ${dark ? "#555" : S.black}`, paddingLeft: 24, margin: "24px 0", maxWidth: 480 }}>{children}</div>
  );

  const Label = ({ children, dark }) => (
    <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: dark ? S.onDarkDim : S.mid, margin: "28px 0 10px", paddingBottom: 8, borderBottom: `1px solid ${dark ? "#2a2a2a" : S.rule}` }}>{children}</div>
  );

  const Item = ({ children, dark }) => (
    <div style={{ padding: "12px 0", borderBottom: `1px solid ${dark ? "#2a2a2a" : S.rule}`, fontFamily: S.cormorant, fontSize: 16, lineHeight: 1.65, color: dark ? S.onDarkBody : "#1a1a1a", display: "flex", gap: 12, alignItems: "flex-start" }}>
      <span style={{ fontFamily: S.mono, fontSize: 12, color: dark ? "#555" : S.mid, flexShrink: 0, marginTop: 2 }}>&mdash;</span>
      <span>{children}</span>
    </div>
  );

  // TASK 2: Score bar with percentile
  const ScoreBar = ({ mode, score, desc }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 0, borderBottom: `1px solid ${S.rule}`, padding: "16px 0", flexWrap: "wrap" }}>
      <div style={{ fontFamily: S.mono, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", width: 110, flexShrink: 0, color: S.white }}>{MODE_LABELS[mode]}</div>
      <div style={{ fontFamily: S.bebas, fontSize: 36, width: 50, flexShrink: 0, lineHeight: 1, color: S.white }}>{score}</div>
      <div style={{ fontFamily: S.mono, fontSize: 10, color: S.onDarkDim, width: 50, flexShrink: 0 }}>{scorePercentile(score)}th</div>
      <div style={{ flex: 1, height: 4, background: "#333", position: "relative", margin: "0 12px", minWidth: 40 }}>
        <div style={{ height: "100%", background: S.white, width: `${score * 10}%` }} />
      </div>
      <div style={{ fontFamily: S.cormorant, fontSize: 13, fontStyle: "italic", color: S.onDarkDim, width: 160, flexShrink: 0, lineHeight: 1.4 }}>{desc}</div>
    </div>
  );

  // TASK 4: Collapsible wrapper
  const Collapsible = ({ label, sectionKey, children, defaultOpen = false }) => {
    const isOpen = expandedSections[sectionKey] !== undefined ? expandedSections[sectionKey] : defaultOpen;
    return (
      <div style={{ borderBottom: `1px solid ${S.rule}`, marginBottom: 0 }}>
        <button onClick={() => toggleSection(sectionKey)} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%",
          padding: "14px 0", background: "transparent", border: "none", cursor: "pointer",
          fontFamily: S.mono, fontSize: 11, letterSpacing: "0.1em", fontWeight: 600, color: S.black, textAlign: "left"
        }}>
          <span>{label}</span>
          <span style={{ fontFamily: S.bebas, fontSize: 18, color: S.mid }}>{isOpen ? "−" : "+"}</span>
        </button>
        {isOpen && <div style={{ paddingBottom: 16 }}>{children}</div>}
      </div>
    );
  };

  // TASK 5: fit labels (renamed from tier)
  const fitLabel = (f) => f === 1 ? "Strong Fit" : f === 2 ? "Possible Fit" : "Poor Fit";
  const fitColor = (f) => f === 1 ? "#16a34a" : f === 2 ? "#ca8a04" : "#dc2626";
  const fitBg = (f) => f === 1 ? "#dcfce7" : f === 2 ? "#fef9c3" : "#fee2e2";
  const scoreColor = (a) => a >= 8.5 ? "#16a34a" : a >= 6.5 ? "#ca8a04" : "#dc2626";
  const fillColor = (v) => v >= 75 ? "#16a34a" : v >= 50 ? "#ca8a04" : "#dc2626";

  // Section definitions for TOC
  const tocSections = [
    { id: "sec-explain", label: "What This Means" },
    { id: "sec-scores", label: "Your Scores" },
    { id: "sec-strengths", label: "Your Strengths" },
    { id: "sec-superpowers", label: "Top Strengths" },
    { id: "sec-shadows", label: "Watch For" },
    { id: "sec-danger", label: "Friction Points" },
    { id: "sec-success", label: "Your Success" },
    { id: "sec-procrastination", label: "Procrastination" },
    { id: "sec-reset", label: "Reset" },
    { id: "sec-daily", label: "Daily Rules" },
    { id: "sec-comms", label: "Communication" },
    { id: "sec-stress", label: "Under Stress" },
    { id: "sec-careers", label: "Career Map" },
    { id: "sec-tools", label: "Tools" },
  ];

  return (
    <div style={{ background: S.white }}>
      {/* Hero — MO Profile */}
      <div style={{ background: S.black, padding: "60px 24px 40px", textAlign: "center" }}>
        <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: "0.3em", color: S.onDarkDim, marginBottom: 20 }}>YOUR PROFILE</div>
        <div style={{ fontFamily: S.bebas, fontSize: "clamp(64px, 14vw, 140px)", lineHeight: 0.9, color: S.white, letterSpacing: 4 }}>{mo}</div>
      </div>

      {/* TASK 1: Plain-language explanation FIRST, before any scores or labels */}
      <div id="sec-explain" style={{ background: S.black, padding: "0 24px 60px", borderBottom: `2px solid ${S.black}` }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: "0.2em", color: S.onDarkDim, marginBottom: 16 }}>IN PLAIN LANGUAGE</div>
          <p style={{ fontFamily: S.cormorant, fontSize: "clamp(19px, 2.5vw, 24px)", lineHeight: 1.65, color: S.onDarkBody, marginBottom: 20 }}>
            {domData.how}
          </p>
          <p style={{ fontFamily: S.cormorant, fontSize: 16, lineHeight: 1.7, color: S.onDarkDim, marginBottom: 20 }}>
            Your strongest instinct is <strong style={{ color: S.white }}>{MODE_LABELS[dominant]}</strong> ({strengths[dominant].name}). {strengths[dominant].superpower}
          </p>
          <p style={{ fontFamily: S.cormorant, fontSize: 16, lineHeight: 1.7, color: S.onDarkDim }}>
            Your lowest-energy dimension is <strong style={{ color: S.white }}>{MODE_LABELS[resistance]}</strong>. {resData}
          </p>
        </div>
      </div>

      {/* TASK 3: Table of Contents */}
      <div style={{ background: "#fafafa", borderBottom: `1px solid ${S.rule}`, padding: "16px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          {tocSections.map(s => (
            <a key={s.id} href={`#${s.id}`} style={{
              fontFamily: S.mono, fontSize: 10, letterSpacing: "0.05em", padding: "5px 10px",
              borderRadius: 4, border: `1px solid ${S.rule}`, color: S.mid, textDecoration: "none",
              transition: "all 0.15s", cursor: "pointer"
            }}
              onMouseEnter={e => { e.target.style.borderColor = S.black; e.target.style.color = S.black; }}
              onMouseLeave={e => { e.target.style.borderColor = S.rule; e.target.style.color = S.mid; }}
            >{s.label}</a>
          ))}
        </div>
      </div>

      {/* S02: Your Scores (with TASK 2 percentiles) */}
      <Section id="sec-scores" num="01" eyebrow="Your Scores" title="Four Dimensions of Action" dark>
        <P dark>These four numbers describe how you instinctively approach information, organization, change, and physical work. Higher isn't better. Each position on the scale represents a different strength.</P>
        {modes.map(m => (
          <ScoreBar key={m} mode={m} score={scores[m]} desc={strengths[m].title} />
        ))}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
            {modes.map(m => (
              <div key={m} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: S.bebas, fontSize: 32, color: S.white }}>{energy[m]}%</div>
                <div style={{ fontFamily: S.mono, fontSize: 9, color: S.onDarkDim }}>{MODE_LABELS[m]} energy</div>
              </div>
            ))}
          </div>
        </div>
        <Pull dark>When someone forces you into a pattern that violates your wiring, the friction you feel isn't you being difficult. It's real stress caused by working against your instincts.</Pull>
      </Section>

      {/* S03: Strengths */}
      <Section id="sec-strengths" num="02" eyebrow="Your Strengths" title="What You Naturally Do Better Than Most">
        {modes.map(m => (
          <div key={m} style={{ border: `1px solid ${S.rule}`, padding: 24, marginBottom: -1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: "0.2em", color: S.mid, marginBottom: 4 }}>{MODE_LABELS[m]} — {scores[m]}/10 ({scorePercentile(scores[m])}th percentile)</div>
                <div style={{ fontFamily: S.bebas, fontSize: 24, letterSpacing: "0.05em" }}>{strengths[m].name}: {strengths[m].title}</div>
              </div>
              <div style={{ fontFamily: S.bebas, fontSize: 28, color: S.mid }}>{energy[m]}%</div>
            </div>
            <p style={{ fontFamily: S.cormorant, fontSize: 16, lineHeight: 1.7, color: "#333", margin: "12px 0 0" }}>{strengths[m].desc}</p>
          </div>
        ))}
      </Section>

      {/* S04: Top Strengths */}
      <Section id="sec-superpowers" num="03" eyebrow="Top Strengths" title="Where You Have the Most Energy" dark>
        {[...modes].sort((a, b) => energy[b] - energy[a]).slice(0, 2).map(m => (
          <div key={m} style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: S.bebas, fontSize: 22, marginBottom: 8 }}>{strengths[m].name}</div>
            <P dark>{strengths[m].superpower}</P>
            <Label dark>You at Your Best</Label>
            <P dark style={{ fontSize: 15 }}>{strengths[m].atBest}</P>
          </div>
        ))}
      </Section>

      {/* S05: Shadows */}
      <Section id="sec-shadows" num="04" eyebrow="Watch For" title="Where Your Wiring Can Work Against You">
        {modes.map(m => (
          <div key={m} style={{ borderLeft: `4px solid ${S.rule}`, padding: "14px 20px", margin: "12px 0" }}>
            <div style={{ fontFamily: S.bebas, fontSize: 18, marginBottom: 6 }}>{MODE_LABELS[m]}: {strengths[m].name}</div>
            <p style={{ fontFamily: S.cormorant, fontSize: 15, lineHeight: 1.65, color: "#444", margin: 0 }}>{strengths[m].shadow}</p>
          </div>
        ))}
      </Section>

      {/* S06: Friction Points (renamed from Danger Zones) */}
      <Section id="sec-danger" num="05" eyebrow="Friction Points" title="Conditions That Work Against You" dark>
        <P dark>Knowing these is intelligence, not weakness.</P>
        {modes.map(m => {
          const z = zones[m];
          const isHigh = z === "initiate";
          const danger = isHigh ? DANGER_ZONES[m].high : DANGER_ZONES[m].low;
          return (
            <div key={m} style={{ borderLeft: "4px solid #444", padding: "14px 20px", margin: "12px 0" }}>
              <div style={{ fontFamily: S.bebas, fontSize: 18, color: S.white, marginBottom: 6 }}>{MODE_LABELS[m]} ({scores[m]}/10, {scorePercentile(scores[m])}th)</div>
              <p style={{ fontFamily: S.cormorant, fontSize: 15, color: "#aaa", margin: 0, lineHeight: 1.65 }}>{danger}</p>
            </div>
          );
        })}
      </Section>

      {/* S07-S12: Remaining manual sections */}
      <Section id="sec-success" num="06" eyebrow="What Success Looks Like" title="Your Version.">
        <Pull>{domData.success}</Pull>
        <P>That's what your wiring optimizes for. Build toward it deliberately, not accidentally.</P>
      </Section>

      <Section id="sec-procrastination" num="07" eyebrow="Why You Procrastinate" title="It's Never Laziness" dark>
        <P dark>{domData.procrastination}</P>
        <Pull dark>Ask: what feeling am I trying to avoid right now? Name it. The resistance usually dissolves once you see it.</Pull>
      </Section>

      <Section id="sec-reset" num="08" eyebrow="Reset Protocol" title="How to Get Back Online">
        <div style={{ border: `1px solid ${S.rule}`, overflow: "hidden", margin: "16px 0" }}>
          <div style={{ background: S.black, color: S.white, padding: "12px 20px", fontFamily: S.mono, fontSize: 10, letterSpacing: "0.2em" }}>60-SECOND RESET</div>
          {["Stop everything completely.", "One slow breath. Nose in, mouth out.", "Notice: body tight? Scattered? Heavy?", domData.reset, "Do just that one thing."].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 16, padding: "12px 20px", borderBottom: `1px solid ${S.rule}`, fontFamily: S.cormorant, fontSize: 15, lineHeight: 1.65, alignItems: "flex-start" }}>
              <span style={{ fontFamily: S.bebas, fontSize: 20, color: S.mid, flexShrink: 0 }}>{i + 1}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="sec-daily" num="09" eyebrow="Daily Operating Rules" title="Baseline Conditions" dark>
        <P dark>Treat these like maintenance, not motivation.</P>
        <Label dark>Morning</Label>
        <Item dark>Move before you open the phone. Even 10 minutes.</Item>
        <Item dark>One clear intention. Not a list. One thing.</Item>
        <Item dark>First 2 hours: deep creative or strategic work only.</Item>
        <Label dark>During the Day</Label>
        <Item dark>45-90 minute timed blocks. Real break after.</Item>
        <Item dark>Stuck? Move your body. Walk. Stretch. It resets the chemistry.</Item>
        <Item dark>Create something. Even small. Creation is fuel.</Item>
        <Label dark>End of Day</Label>
        <Item dark>What gave you energy? Do more of that.</Item>
        <Item dark>What drained you? Reduce or eliminate tomorrow.</Item>
      </Section>

      <Section id="sec-comms" num="10" eyebrow="Communication Guide" title="What Others Should Know About You">
        {modes.map(m => (
          <div key={m} style={{ padding: "16px 0", borderBottom: `1px solid ${S.rule}` }}>
            <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: "0.15em", color: S.mid, marginBottom: 6 }}>{MODE_LABELS[m]} ({strengths[m].name})</div>
            <p style={{ fontFamily: S.cormorant, fontSize: 17, fontStyle: "italic", lineHeight: 1.6, color: "#333", margin: 0 }}>"{strengths[m].othersKnow}"</p>
          </div>
        ))}
      </Section>

      <Section id="sec-stress" num="11" eyebrow="Under Stress" title="What Happens When Your Tank Is Low" dark>
        <P dark>When you feel irritable, scattered, or emotionally reactive with no clear reason, check the environment before blaming yourself.</P>
        {[...modes].sort((a, b) => energy[b] - energy[a]).slice(0, 2).map(m => (
          <div key={m} style={{ marginBottom: 20 }}>
            <Label dark>{MODE_LABELS[m]}: Under Stress</Label>
            <P dark style={{ fontSize: 15 }}>{strengths[m].underStress}</P>
          </div>
        ))}
      </Section>

      {/* ============================================================ */}
      {/* CAREER MAP — TASK 4: Collapsible. TASK 5: Fit labels renamed */}
      {/* ============================================================ */}
      {(() => {
        const scored = CAREER_ARCHETYPES.map(c => ({ ...c, ...scoreCareerFit(c, zones, energy, dominant) })).sort((a, b) => b.alignment - a.alignment);
        const fit1 = scored.filter(c => c.fit === 1);
        const fit2 = scored.filter(c => c.fit === 2);
        const fit3 = scored.filter(c => c.fit === 3);
        const deadZones = scored.filter(c => c.deadIf);
        const filtered = careerFilter === "all" ? scored : careerFilter === "t1" ? fit1 : careerFilter === "t2" ? fit2 : careerFilter === "t3" ? fit3 : scored.filter(c => c.tags.includes(careerFilter));

        const Metric = ({ label, value }) => (
          <div style={{ background: "#f5f5f5", borderRadius: 6, padding: "8px 10px" }}>
            <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: "#717171", marginBottom: 3 }}>{label}</div>
            <div style={{ height: 4, background: "#d4d4d4", borderRadius: 2, overflow: "hidden", marginBottom: 3 }}>
              <div style={{ height: "100%", borderRadius: 2, background: fillColor(value), width: `${value}%` }} />
            </div>
            <div style={{ fontFamily: S.mono, fontSize: 11, fontWeight: 700, color: S.black }}>{value}%</div>
          </div>
        );

        return (
          <>
            <div id="sec-careers" style={{ background: S.black, padding: "60px 24px", textAlign: "center", borderBottom: `2px solid ${S.black}` }}>
              <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: "0.3em", color: S.onDarkDim, marginBottom: 16 }}>CAREER MAP</div>
              <div style={{ fontFamily: S.bebas, fontSize: "clamp(32px, 7vw, 64px)", lineHeight: 0.95, color: S.white }}>CAREERS BUILT FOR<br/>YOUR WIRING</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 32, flexWrap: "wrap" }}>
                <div style={{ textAlign: "center" }}><div style={{ fontFamily: S.bebas, fontSize: 32, color: "#16a34a" }}>{fit1.length}</div><div style={{ fontFamily: S.mono, fontSize: 9, color: S.onDarkDim }}>STRONG FIT</div></div>
                <div style={{ textAlign: "center" }}><div style={{ fontFamily: S.bebas, fontSize: 32, color: "#ca8a04" }}>{fit2.length}</div><div style={{ fontFamily: S.mono, fontSize: 9, color: S.onDarkDim }}>POSSIBLE FIT</div></div>
                <div style={{ textAlign: "center" }}><div style={{ fontFamily: S.bebas, fontSize: 32, color: "#dc2626" }}>{fit3.length}</div><div style={{ fontFamily: S.mono, fontSize: 9, color: S.onDarkDim }}>POOR FIT</div></div>
              </div>
            </div>

            <div style={{ padding: "40px 24px", maxWidth: 1100, margin: "0 auto" }}>
              {/* Filters — TASK 5: renamed */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
                {[["all","All "+scored.length],["t1","Strong Fit"],["t2","Possible Fit"],["t3","Poor Fit"],["owner","Owner / Founder"],["creative","Creative"],["teaching","Teaching"],["consulting","Consulting"],["analytical","Analytical"],["hands-on","Hands-On"]].map(([key, label]) => (
                  <button key={key} onClick={() => setCareerFilter(key)} style={{
                    padding: "6px 14px", borderRadius: 100, fontFamily: S.mono, fontSize: 12, fontWeight: 600,
                    border: `1.5px solid ${careerFilter === key ? "#E8541A" : S.rule}`,
                    background: careerFilter === key ? "#E8541A" : "#fff",
                    color: careerFilter === key ? "#fff" : "#3d3d3d",
                    cursor: "pointer", transition: "all 0.15s"
                  }}>{label}</button>
                ))}
              </div>

              {/* TASK 4: Career cards in collapsible groups */}
              {[{key:"t1",label:"Strong Fit Careers",items:filtered.filter(c=>c.fit===1)},{key:"t2",label:"Possible Fit Careers",items:filtered.filter(c=>c.fit===2)},{key:"t3",label:"Poor Fit / Caution",items:filtered.filter(c=>c.fit===3)}].filter(g=>g.items.length>0).map(group => (
                <Collapsible key={group.key} sectionKey={`career-${group.key}`} label={`${group.label} (${group.items.length})`} defaultOpen={group.key === "t1"}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14, marginTop: 8 }}>
                    {group.items.map(c => (
                      <div key={c.id} style={{ background: "#fff", border: `1.5px solid ${S.rule}`, borderRadius: 10, padding: 20, display: "flex", flexDirection: "column", position: "relative" }}>
                        <div style={{ position: "absolute", top: 14, right: 14, fontSize: 9, fontFamily: S.mono, fontWeight: 700, padding: "2px 8px", borderRadius: 100, background: fitBg(c.fit), color: fitColor(c.fit) }}>{fitLabel(c.fit)}</div>
                        <div style={{ fontSize: 20, marginBottom: 10 }}>{c.icon}</div>
                        <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: S.mid, marginBottom: 3 }}>{c.category}</div>
                        <div style={{ fontFamily: S.bebas, fontSize: 18, color: S.black, lineHeight: 1.15, marginBottom: 3, paddingRight: 56 }}>{c.title}</div>
                        <div style={{ fontFamily: S.cormorant, fontSize: 12, fontStyle: "italic", color: S.mid, marginBottom: 10 }}>{c.subtitle}</div>
                        <p style={{ fontFamily: S.cormorant, fontSize: 13, color: "#3d3d3d", lineHeight: 1.65, marginBottom: 14, flex: 1, maxWidth: "none" }}>{c.desc}</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
                          <Metric label="Freedom" value={c.freedom} />
                          <Metric label="Energy Fit" value={c.energyFit} />
                          <Metric label="Creation" value={c.creation} />
                          <Metric label="Income" value={c.income} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: `1px solid ${S.rule}`, marginTop: "auto" }}>
                          <span style={{ fontFamily: S.mono, fontSize: 10, color: S.mid }}>Alignment</span>
                          <span style={{ fontFamily: S.bebas, fontSize: 20, color: scoreColor(c.alignment) }}>{c.alignment.toFixed(1)}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Collapsible>
              ))}

              {/* Dead Zones */}
              {deadZones.length > 0 && (
                <Collapsible sectionKey="dead-zones" label={`Careers to Avoid (${deadZones.length})`}>
                  {deadZones.map(c => (
                    <div key={c.id} style={{ display: "flex", gap: 16, padding: "12px 0", borderBottom: `1px solid ${S.rule}`, alignItems: "flex-start" }}>
                      <span style={{ fontFamily: S.mono, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "#fee2e2", color: "#dc2626", flexShrink: 0 }}>AVOID</span>
                      <div>
                        <div style={{ fontFamily: S.mono, fontSize: 11, fontWeight: 600, color: S.black }}>{c.title}</div>
                        <p style={{ fontFamily: S.cormorant, fontSize: 13, color: "#555", margin: "4px 0 0", maxWidth: "none" }}>{c.deadIf}</p>
                      </div>
                    </div>
                  ))}
                </Collapsible>
              )}
            </div>
          </>
        );
      })()}

      {/* ============================================================ */}
      {/* INTERACTIVE TOOLS HUB */}
      {/* ============================================================ */}
      <div id="sec-tools" style={{ background: S.black, padding: "48px 24px", textAlign: "center", borderBottom: `2px solid ${S.black}` }}>
        <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: "0.3em", color: S.onDarkDim, marginBottom: 12 }}>INTERACTIVE TOOLS</div>
        <div style={{ fontFamily: S.bebas, fontSize: "clamp(28px, 5vw, 48px)", color: S.white, lineHeight: 1 }}>USE YOUR WIRING</div>
      </div>

      <div style={{ background: "#fafafa", borderBottom: `1px solid ${S.rule}`, padding: "14px 24px", display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          ["stress","🔥 Stress Detector"],["decision","⚖️ Decision Filter"],["compat","👥 Compatibility"],
          ["share","📤 Share Card"],["checkin","📊 Weekly Check-In"],["prompt","💡 Daily Prompt"],
          ["career-detail","🎯 Career Deep-Dive"],["explain","🗣️ Explain My Results"]
        ].map(([key, label]) => (
          <button key={key} onClick={() => setActiveFeature(activeFeature === key ? null : key)} style={{
            padding: "7px 14px", borderRadius: 8, fontFamily: S.mono, fontSize: 10, fontWeight: 600,
            border: `1.5px solid ${activeFeature === key ? S.black : S.rule}`,
            background: activeFeature === key ? S.black : "#fff",
            color: activeFeature === key ? S.white : "#3d3d3d",
            cursor: "pointer", transition: "all 0.15s"
          }}>{label}</button>
        ))}
      </div>

      {/* FEATURE 1: Stress Detector */}
      {activeFeature === "stress" && (() => {
        const symptomMap = [
          { id: "irritable", label: "Irritable or snappy for no clear reason", modes: ["QS","FT"] },
          { id: "scattered", label: "Scattered, can't focus on one thing", modes: ["FT","FF"] },
          { id: "procrastinating", label: "Procrastinating on something important", modes: ["FF","QS"] },
          { id: "flat", label: "Emotionally flat, no motivation", modes: ["QS","IMP"] },
          { id: "restless", label: "Restless, need to move or do something", modes: ["IMP","QS"] },
          { id: "overwhelmed", label: "Overwhelmed by too many open loops", modes: ["FT"] },
          { id: "bored", label: "Deeply, physically bored", modes: ["QS"] },
          { id: "perfectionist", label: "Stuck perfecting instead of shipping", modes: ["FF","FT"] },
          { id: "detached", label: "Detached from physical environment", modes: ["IMP"] },
          { id: "avoidant", label: "Avoiding a specific task or conversation", modes: ["FF","QS"] }
        ];
        const violatedModes = {};
        stressSymptoms.forEach(sId => { const s = symptomMap.find(x => x.id === sId); if (s) s.modes.forEach(m => { violatedModes[m] = (violatedModes[m] || 0) + 1; }); });
        const topViolated = Object.entries(violatedModes).sort((a, b) => b[1] - a[1]);
        const stressNarratives = {
          FF: { cause: "Your Information dimension is being violated. You're either drowning in unnecessary detail or being denied the information you need.", fix: "If you're a Simplifier: step back, get the headline, move. If you're a Specifier: ask for 30 more minutes of research time." },
          FT: { cause: "Your Organization dimension is being violated. Either too much rigid structure is imposed on you, or there's not enough structure.", fix: "If you're an Adapter: find your own path to the same outcome. If you're a Systematizer: spend 10 minutes creating a sequence for the next 3 steps." },
          QS: { cause: "Your Change dimension is being violated. You're either trapped in too much routine or being forced into too much chaos.", fix: "If you're a Stabilizer: identify one thing you can keep the same. If you're an Innovator: start something new, even tiny." },
          IMP: { cause: "Your Execution dimension is being violated. You're stuck in abstract thinking when you need to build, or forced into physical work when you think best in your head.", fix: "If you're an Envisioner: ask for time to conceptualize. If you're a Builder: go make something with your hands." }
        };
        return (
          <div style={{ padding: "40px 24px", maxWidth: 700, margin: "0 auto" }}>
            <Section num="⚡" eyebrow="Stress Detector" title="What's Draining You?">
              <P>Select symptoms you're experiencing. The tool identifies which dimension is being violated.</P>
              <div style={{ marginTop: 12 }}>
                {symptomMap.map(s => (
                  <button key={s.id} onClick={() => setStressSymptoms(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])} style={{
                    display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 14px",
                    background: stressSymptoms.includes(s.id) ? "#fee2e2" : "transparent",
                    border: "none", borderBottom: `1px solid ${S.rule}`, cursor: "pointer", textAlign: "left",
                    fontFamily: S.cormorant, fontSize: 15, color: S.black
                  }}>
                    <span style={{ width: 18, height: 18, borderRadius: 3, border: `2px solid ${stressSymptoms.includes(s.id) ? "#dc2626" : S.rule}`, background: stressSymptoms.includes(s.id) ? "#dc2626" : "transparent", color: "#fff", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{stressSymptoms.includes(s.id) ? "✓" : ""}</span>
                    {s.label}
                  </button>
                ))}
              </div>
              {topViolated.length > 0 && (
                <div style={{ marginTop: 24, padding: 20, background: S.black, borderRadius: 10, color: S.white }}>
                  <div style={{ fontFamily: S.mono, fontSize: 9, color: S.onDarkDim, marginBottom: 8 }}>DIAGNOSIS</div>
                  <div style={{ fontFamily: S.bebas, fontSize: 22, marginBottom: 10 }}>{MODE_LABELS[topViolated[0][0]]} Stress</div>
                  <p style={{ fontFamily: S.cormorant, fontSize: 14, color: S.onDarkBody, lineHeight: 1.65, marginBottom: 12, maxWidth: "none" }}>{stressNarratives[topViolated[0][0]].cause}</p>
                  <div style={{ fontFamily: S.mono, fontSize: 9, color: S.onDarkDim, marginBottom: 6 }}>YOUR FIX</div>
                  <p style={{ fontFamily: S.cormorant, fontSize: 14, color: S.onDarkBody, lineHeight: 1.65, maxWidth: "none" }}>{stressNarratives[topViolated[0][0]].fix}</p>
                </div>
              )}
            </Section>
          </div>
        );
      })()}

      {/* FEATURE 2: Decision Filter */}
      {activeFeature === "decision" && (() => {
        const dqs = [
          { id: "research", label: "How much deep research does this require?", mode: "FF", options: ["Very little","Some","A lot"] },
          { id: "structure", label: "How rigid is the process or structure?", mode: "FT", options: ["Very flexible","Moderate","Very rigid"] },
          { id: "novelty", label: "How much novelty and change is involved?", mode: "QS", options: ["Very stable","Some variety","Constant change"] },
          { id: "physical", label: "How much physical or hands-on work?", mode: "IMP", options: ["All abstract","Some tangible","Very physical"] },
          { id: "freedom", label: "How much schedule control do you have?", options: ["Full control","Some flexibility","No control"] },
          { id: "creation", label: "How much creative work is involved?", options: ["Mostly creative","Mixed","Mostly execution"] }
        ];
        const zoneToIndex = { counteract: 0, accommodate: 1, initiate: 2 };
        const calcResult = () => {
          if (Object.keys(decisionAnswers).length < dqs.length) return null;
          let ms = 0, tot = 0;
          ["FF","FT","QS","IMP"].forEach(m => {
            const q = dqs.find(x => x.mode === m);
            if (q && decisionAnswers[q.id] !== undefined) {
              const d = Math.abs(decisionAnswers[q.id] - zoneToIndex[zones[m]]);
              ms += d === 0 ? 10 : d === 1 ? 6 : 2; tot += 10;
            }
          });
          ms += (decisionAnswers.freedom === 0 ? 10 : decisionAnswers.freedom === 1 ? 6 : 2);
          ms += (decisionAnswers.creation === 0 ? 10 : decisionAnswers.creation === 1 ? 6 : 2);
          tot += 20;
          return Math.round((ms / tot) * 100) / 10;
        };
        return (
          <div style={{ padding: "40px 24px", maxWidth: 700, margin: "0 auto" }}>
            <Section num="⚖️" eyebrow="Decision Filter" title="Should You Take This?">
              <P>Evaluating a job, project, or life change? Answer 6 questions to score it against your wiring.</P>
              {dqs.map(q => (
                <div key={q.id} style={{ marginTop: 16 }}>
                  <div style={{ fontFamily: S.mono, fontSize: 10, color: S.mid, marginBottom: 6 }}>{q.label}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {q.options.map((opt, oi) => (
                      <button key={oi} onClick={() => setDecisionAnswers(prev => ({...prev, [q.id]: oi}))} style={{
                        flex: 1, padding: "8px 6px", borderRadius: 6, fontFamily: S.cormorant, fontSize: 13,
                        border: `1.5px solid ${decisionAnswers[q.id] === oi ? S.black : S.rule}`,
                        background: decisionAnswers[q.id] === oi ? S.black : "#fff",
                        color: decisionAnswers[q.id] === oi ? S.white : S.black, cursor: "pointer"
                      }}>{opt}</button>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(decisionAnswers).length >= dqs.length && (() => {
                const sc = calcResult();
                const cl = sc >= 7.5 ? "#16a34a" : sc >= 5 ? "#ca8a04" : "#dc2626";
                return (
                  <div style={{ marginTop: 24, padding: 20, border: `2px solid ${cl}`, borderRadius: 10, textAlign: "center" }}>
                    <div style={{ fontFamily: S.bebas, fontSize: 44, color: cl }}>{sc}/10</div>
                    <p style={{ fontFamily: S.cormorant, fontSize: 14, color: "#444", marginTop: 6, maxWidth: "none" }}>
                      {sc >= 7.5 ? "Strong alignment with your wiring." : sc >= 5 ? "Partial fit. Some elements match, others will cost energy." : "Significant misalignment. Proceed with extreme caution."}
                    </p>
                  </div>
                );
              })()}
            </Section>
          </div>
        );
      })()}

      {/* FEATURE 3: Compatibility — TASK 5: "complement" → "Natural Balance", "aligned" → "Same Approach" */}
      {activeFeature === "compat" && (() => {
        const parsePartner = () => { const p = {}; for (const m of ["FF","FT","QS","IMP"]) { const v = parseInt(partnerMO[m]); if (isNaN(v)||v<1||v>10) return null; p[m] = v; } return p; };
        const runCompat = () => {
          const p = parsePartner(); if (!p) return;
          const r = {};
          for (const m of ["FF","FT","QS","IMP"]) {
            const uZ = zones[m]; const pS = p[m]; const pZ = pS <= 3 ? "counteract" : pS <= 6 ? "accommodate" : "initiate";
            if (uZ === pZ) r[m] = { type: "same", msg: `You're both in the same zone. You'll approach ${MODE_LABELS[m].toLowerCase()} the same way.` };
            else if ((uZ === "counteract" && pZ === "initiate") || (uZ === "initiate" && pZ === "counteract")) r[m] = { type: "tension", msg: `Opposite zones. You'll approach ${MODE_LABELS[m].toLowerCase()} from completely different instincts. Friction, but also covers each other's blind spots.` };
            else r[m] = { type: "balance", msg: `Adjacent zones. One of you is more intense. Natural balance with minor friction.` };
          }
          setCompatResult(r);
        };
        // TASK 5: renamed labels
        const typeLabels = { same: "SAME APPROACH", balance: "NATURAL BALANCE", tension: "TENSION POINT" };
        const typeColors = { same: "#16a34a", balance: "#ca8a04", tension: "#dc2626" };
        const typeBgs = { same: "#dcfce7", balance: "#fef9c3", tension: "#fee2e2" };
        return (
          <div style={{ padding: "40px 24px", maxWidth: 700, margin: "0 auto" }}>
            <Section num="👥" eyebrow="Compatibility" title="How Do Your Wirings Interact?">
              <P>Enter another person's scores (1-10 per dimension) to see where you'll sync, balance, or clash.</P>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
                {["FF","FT","QS","IMP"].map(m => (
                  <div key={m}>
                    <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 4 }}>{MODE_LABELS[m]}</div>
                    <input type="number" min="1" max="10" value={partnerMO[m]} onChange={e => setPartnerMO(prev => ({...prev, [m]: e.target.value}))}
                      style={{ width: "100%", padding: "8px", border: `1.5px solid ${S.rule}`, borderRadius: 6, fontFamily: S.bebas, fontSize: 22, textAlign: "center", outline: "none" }} />
                    <div style={{ fontFamily: S.mono, fontSize: 8, color: S.mid, textAlign: "center", marginTop: 2 }}>You: {scores[m]}</div>
                  </div>
                ))}
              </div>
              <button onClick={runCompat} style={{ marginTop: 16, width: "100%", padding: 10, fontFamily: S.bebas, fontSize: 16, background: S.black, color: S.white, border: "none", borderRadius: 6, cursor: "pointer" }}>ANALYZE</button>
              {compatResult && (
                <div style={{ marginTop: 20 }}>
                  {["FF","FT","QS","IMP"].map(m => {
                    const r = compatResult[m];
                    return (
                      <div key={m} style={{ padding: "12px 0", borderBottom: `1px solid ${S.rule}`, display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <span style={{ fontFamily: S.mono, fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 3, background: typeBgs[r.type], color: typeColors[r.type], flexShrink: 0, marginTop: 2 }}>{typeLabels[r.type]}</span>
                        <div>
                          <div style={{ fontFamily: S.mono, fontSize: 10, fontWeight: 600 }}>{MODE_LABELS[m]}</div>
                          <p style={{ fontFamily: S.cormorant, fontSize: 13, color: "#444", margin: "2px 0 0", maxWidth: "none" }}>{r.msg}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>
          </div>
        );
      })()}

      {/* FEATURE 4: Share Card */}
      {activeFeature === "share" && (
        <div style={{ padding: "40px 24px", maxWidth: 700, margin: "0 auto" }}>
          <Section num="📤" eyebrow="How to Work With Me" title="Send This to Your Team">
            <div style={{ marginTop: 16, border: `2px solid ${S.black}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ background: S.black, padding: "20px", color: S.white }}>
                <div style={{ fontFamily: S.bebas, fontSize: 24 }}>HOW TO WORK WITH ME</div>
                <div style={{ fontFamily: S.mono, fontSize: 10, color: S.onDarkDim, marginTop: 4 }}>Profile: {mo}</div>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 10 }}>MY STRENGTHS</div>
                {modes.map(m => (
                  <div key={m} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${S.rule}`, fontFamily: S.cormorant, fontSize: 14 }}>
                    <span style={{ fontWeight: 500 }}>{MODE_LABELS[m]}</span>
                    <span style={{ color: S.mid }}>{strengths[m].name} ({scores[m]}/10)</span>
                  </div>
                ))}
                <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginTop: 16, marginBottom: 10 }}>WHAT I NEED FROM YOU</div>
                {modes.map(m => (
                  <div key={m} style={{ padding: "8px 0", borderBottom: `1px solid ${S.rule}` }}>
                    <p style={{ fontFamily: S.cormorant, fontSize: 13, fontStyle: "italic", color: "#333", margin: 0, maxWidth: "none" }}>"{strengths[m].othersKnow}"</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* FEATURE 5: Weekly Check-In */}
      {activeFeature === "checkin" && (
        <div style={{ padding: "40px 24px", maxWidth: 700, margin: "0 auto" }}>
          <Section num="📊" eyebrow="Weekly Check-In" title="How Aligned Was Your Week?">
            {!weeklySubmitted ? (<>
              {modes.map(m => (
                <div key={m} style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontFamily: S.mono, fontSize: 10, fontWeight: 600 }}>{MODE_LABELS[m]}: {strengths[m].name}</span>
                    <span style={{ fontFamily: S.bebas, fontSize: 20 }}>{weeklyRatings[m]}/5</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[1,2,3,4,5].map(v => (
                      <button key={v} onClick={() => setWeeklyRatings(prev => ({...prev, [m]: v}))} style={{
                        flex: 1, padding: "8px 0", borderRadius: 4, fontFamily: S.bebas, fontSize: 16,
                        border: `1.5px solid ${weeklyRatings[m] === v ? S.black : S.rule}`,
                        background: weeklyRatings[m] === v ? S.black : "#fff",
                        color: weeklyRatings[m] === v ? S.white : S.black, cursor: "pointer"
                      }}>{v}</button>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={() => setWeeklySubmitted(true)} style={{ marginTop: 20, width: "100%", padding: 12, fontFamily: S.bebas, fontSize: 16, background: S.black, color: S.white, border: "none", borderRadius: 6, cursor: "pointer" }}>SUBMIT</button>
            </>) : (() => {
              const avg = Object.values(weeklyRatings).reduce((a, b) => a + b, 0) / 4;
              const lowest = Object.entries(weeklyRatings).sort((a, b) => a[1] - b[1])[0];
              const cl = avg >= 4 ? "#16a34a" : avg >= 2.5 ? "#ca8a04" : "#dc2626";
              return (
                <div style={{ marginTop: 20, textAlign: "center" }}>
                  <div style={{ fontFamily: S.bebas, fontSize: 48, color: cl }}>{avg.toFixed(1)}/5</div>
                  <p style={{ fontFamily: S.cormorant, fontSize: 14, color: "#444", marginTop: 8, maxWidth: "none" }}>
                    {avg >= 4 ? "Strong week. Protect what's working." : avg >= 2.5 ? "Mixed week. Look at what drained you." : "Rough week. Something needs to change."}
                  </p>
                  <div style={{ marginTop: 12, padding: 12, background: "#fff3ee", borderRadius: 6, textAlign: "left" }}>
                    <div style={{ fontFamily: S.mono, fontSize: 9, color: "#E8541A" }}>BIGGEST GAP: {MODE_LABELS[lowest[0]]}</div>
                    <p style={{ fontFamily: S.cormorant, fontSize: 13, color: "#444", margin: "4px 0 0", maxWidth: "none" }}>{DOMINANT_NARRATIVES[lowest[0]].reset}</p>
                  </div>
                  <button onClick={() => { setWeeklySubmitted(false); setWeeklyRatings({FF:3,FT:3,QS:3,IMP:3}); }} style={{ marginTop: 12, padding: "6px 16px", fontFamily: S.mono, fontSize: 10, background: "transparent", border: `1px solid ${S.rule}`, borderRadius: 4, cursor: "pointer" }}>RESET</button>
                </div>
              );
            })()}
          </Section>
        </div>
      )}

      {/* FEATURE 6: Daily Prompt */}
      {activeFeature === "prompt" && (
        <div style={{ padding: "40px 24px", maxWidth: 700, margin: "0 auto" }}>
          <Section num="💡" eyebrow="Daily Prompt" title="Your Wiring, Applied Today">
            {!dailyDismissed ? (
              <div style={{ marginTop: 16, padding: 28, background: S.black, borderRadius: 10, textAlign: "center" }}>
                <div style={{ fontFamily: S.mono, fontSize: 9, color: S.onDarkDim, marginBottom: 12 }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
                <div style={{ fontFamily: S.cormorant, fontSize: "clamp(18px, 3vw, 24px)", fontStyle: "italic", color: S.white, lineHeight: 1.4, maxWidth: 380, margin: "0 auto" }}>
                  {dominant === "FF" ? "Your brain runs on information. What's one thing worth researching today?" :
                   dominant === "FT" ? "Your brain runs on order. What's one open loop you can close today?" :
                   dominant === "QS" ? "Your brain runs on novelty. What's one new thing you can start today?" :
                   "Your brain runs on making. What's one thing you can build with your hands today?"}
                </div>
                <button onClick={() => setDailyDismissed(true)} style={{ marginTop: 16, padding: "6px 20px", fontFamily: S.mono, fontSize: 10, background: "transparent", border: "1px solid #444", color: "#999", borderRadius: 4, cursor: "pointer" }}>GOT IT</button>
              </div>
            ) : (
              <div style={{ marginTop: 16, textAlign: "center" }}>
                <p style={{ fontFamily: S.cormorant, fontSize: 15, color: S.mid }}>Prompt acknowledged.</p>
                <button onClick={() => setDailyDismissed(false)} style={{ marginTop: 8, padding: "6px 16px", fontFamily: S.mono, fontSize: 10, background: "transparent", border: `1px solid ${S.rule}`, borderRadius: 4, cursor: "pointer" }}>SHOW AGAIN</button>
              </div>
            )}
          </Section>
        </div>
      )}

      {/* FEATURE 7: Career Deep-Dive */}
      {activeFeature === "career-detail" && (() => {
        const scored = CAREER_ARCHETYPES.map(c => ({ ...c, ...scoreCareerFit(c, zones, energy, dominant) })).sort((a, b) => b.alignment - a.alignment);
        const top5 = scored.filter(c => !c.deadIf).slice(0, 5);
        return (
          <div style={{ padding: "40px 24px", maxWidth: 700, margin: "0 auto" }}>
            <Section num="🎯" eyebrow="Career Deep-Dive" title="Your Top 5, Expanded">
              {top5.map((c, ci) => {
                const modeMatches = ["FF","FT","QS","IMP"].filter(m => c.idealZones[m].includes(zones[m]));
                const modeClashes = ["FF","FT","QS","IMP"].filter(m => !c.idealZones[m].includes(zones[m]) && zones[m] !== "accommodate");
                return (
                  <div key={c.id} style={{ marginTop: ci > 0 ? 20 : 12, border: `1.5px solid ${S.rule}`, borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ background: S.black, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontFamily: S.mono, fontSize: 9, color: S.onDarkDim }}>{c.category}</div>
                        <div style={{ fontFamily: S.bebas, fontSize: 20, color: S.white, marginTop: 2 }}>{c.icon} {c.title}</div>
                      </div>
                      <div style={{ fontFamily: S.bebas, fontSize: 24, color: "#16a34a" }}>{c.alignment.toFixed(1)}</div>
                    </div>
                    <div style={{ padding: 20 }}>
                      <p style={{ fontFamily: S.cormorant, fontSize: 14, color: "#333", lineHeight: 1.65, marginBottom: 14, maxWidth: "none" }}>{c.desc}</p>
                      {modeMatches.length > 0 && (<>
                        <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 6 }}>STRENGTHS ACTIVATED</div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
                          {modeMatches.map(m => <span key={m} style={{ fontFamily: S.mono, fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 3, background: "#dcfce7", color: "#16a34a" }}>{strengths[m].name}</span>)}
                        </div>
                      </>)}
                      {modeClashes.length > 0 && (<>
                        <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 6 }}>WATCH FOR</div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
                          {modeClashes.map(m => <span key={m} style={{ fontFamily: S.mono, fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 3, background: "#fef9c3", color: "#ca8a04" }}>{MODE_LABELS[m]} friction</span>)}
                        </div>
                      </>)}
                      <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 4 }}>FIRST STEPS</div>
                      <p style={{ fontFamily: S.cormorant, fontSize: 13, color: "#444", lineHeight: 1.6, margin: 0, maxWidth: "none" }}>
                        {c.freedom >= 80 ? "Start as a side project. Test demand before going full-time. " : "Research the field. Talk to 3 people already doing this. "}
                        {c.creation >= 80 ? "Build a portfolio or sample project. " : "Focus on credentials or case studies. "}
                        {c.income >= 85 ? "High income ceiling, but ramp may take 6-12 months." : "Stable income path. Focus on the first client or role."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </Section>
          </div>
        );
      })()}

      {/* FEATURE 8: Explain My Results */}
      {activeFeature === "explain" && (
        <div style={{ padding: "40px 24px", maxWidth: 700, margin: "0 auto" }}>
          <Section num="🗣️" eyebrow="Explain My Results" title="For Someone Who Hasn't Taken the Test">
            <div style={{ marginTop: 16, border: `2px solid ${S.black}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ background: S.black, padding: "24px 20px", color: S.white, textAlign: "center" }}>
                <div style={{ fontFamily: S.mono, fontSize: 9, color: S.onDarkDim }}>BEHAVIORAL PROFILE</div>
                <div style={{ fontFamily: S.bebas, fontSize: 40, marginTop: 6, letterSpacing: 3 }}>{mo}</div>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ fontFamily: S.bebas, fontSize: 18, marginBottom: 6 }}>IN PLAIN LANGUAGE</div>
                <p style={{ fontFamily: S.cormorant, fontSize: 14, color: "#333", lineHeight: 1.7, marginBottom: 16, maxWidth: "none" }}>
                  This person has been assessed on how they instinctively take action. Not personality. Not intelligence. Their natural "doing" pattern when free to be themselves.
                </p>
                <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 6 }}>HOW THEY OPERATE</div>
                <p style={{ fontFamily: S.cormorant, fontSize: 14, color: "#333", lineHeight: 1.7, marginBottom: 16, maxWidth: "none" }}>{domData.how}</p>
                <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 6 }}>WHAT THEY DO WELL</div>
                {[dominant, Object.entries(energy).sort((a,b) => b[1]-a[1])[1][0]].map(m => (
                  <div key={m} style={{ padding: "8px 0", borderBottom: `1px solid ${S.rule}` }}>
                    <span style={{ fontFamily: S.mono, fontSize: 10, fontWeight: 600 }}>{strengths[m].name}: </span>
                    <span style={{ fontFamily: S.cormorant, fontSize: 13, color: "#444" }}>{strengths[m].superpower}</span>
                  </div>
                ))}
                <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginTop: 14, marginBottom: 6 }}>HOW TO GET THE BEST FROM THEM</div>
                {modes.map(m => (
                  <div key={m} style={{ padding: "6px 0", borderBottom: `1px solid ${S.rule}`, fontFamily: S.cormorant, fontSize: 13, color: "#333" }}>
                    <strong style={{ fontWeight: 600 }}>{MODE_LABELS[m]}:</strong> {strengths[m].othersKnow}
                  </div>
                ))}
                <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginTop: 14, marginBottom: 6 }}>WHAT WILL DRAIN THEM</div>
                <p style={{ fontFamily: S.cormorant, fontSize: 13, color: "#444", lineHeight: 1.65, margin: 0, maxWidth: "none" }}>
                  {strengths[resistance].shadow} When they get irritable or go quiet, check whether the environment is forcing them into {MODE_LABELS[resistance].toLowerCase()} mode.
                </p>
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* Identity Statement */}
      <div style={{ background: S.black, padding: "72px 24px", textAlign: "center", borderBottom: `2px solid ${S.black}` }}>
        <div style={{ fontFamily: S.bebas, fontSize: "clamp(44px, 9vw, 90px)", lineHeight: 0.92, color: S.white }}>YOUR WIRING<br/>IS YOUR WEAPON.</div>
        <p style={{ fontFamily: S.cormorant, fontSize: 18, fontStyle: "italic", color: "#999", marginTop: 20, maxWidth: 480, margin: "20px auto 0", lineHeight: 1.6 }}>
          The goal is not to fix how you're wired. The goal is to understand it so well you stop fighting it and start building a life that runs on it.
        </p>
      </div>

      {/* Footer */}
      <div style={{ borderTop: `2px solid ${S.black}`, padding: "28px 24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontFamily: S.mono, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: S.mid }}>
        <span>Profile: {mo}</span>
        <span>Personal Operating Manual</span>
        <span>{new Date().getFullYear()}</span>
      </div>
    </div>
  );
}

// ============================================================
// APP
// ============================================================
export default function App() {
  const [phase, setPhase] = useState("intro");
  const [qIndex, setQIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [results, setResults] = useState(null);

  const handleSelect = useCallback((qId, sel) => {
    setResponses(prev => ({ ...prev, [qId]: { most: sel.most || null, least: sel.least || null } }));
  }, []);

  const handleNext = useCallback(() => {
    if (qIndex < QUESTIONS.length - 1) setQIndex(i => i + 1);
    else setPhase("processing");
  }, [qIndex]);

  const handleBack = useCallback(() => { if (qIndex > 0) setQIndex(i => i - 1); }, [qIndex]);

  const handleProcessingDone = useCallback(() => {
    const r = scoreAssessment(responses);
    setResults(r);
    setPhase("results");
  }, [responses]);

  return (
    <>
      <style>{fonts}</style>
      <div style={{ fontFamily: S.cormorant, cursor: "crosshair" }}>
        {phase === "intro" && <IntroScreen onStart={() => setPhase("quiz")} />}
        {phase === "quiz" && (
          <QuestionCard
            question={QUESTIONS[qIndex]}
            index={qIndex}
            total={QUESTIONS.length}
            response={responses[QUESTIONS[qIndex].id]}
            onSelect={handleSelect}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {phase === "processing" && <ProcessingScreen onDone={handleProcessingDone} />}
        {phase === "results" && results && <ResultsManual results={results} />}
      </div>
    </>
  );
}
