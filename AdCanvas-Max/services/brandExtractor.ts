import { GoogleGenAI } from '@google/genai';

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface ExtractedBrandData {
  name: string;
  description: string;
  colors: string[];
  logoUrl: string | null;
  headingFont: string;
  bodyFont: string;
  toneKeywords: string[];
}

export interface DetailedAudienceProfile {
  id: string;
  name: string;
  age: string;
  gender: string;
  income: string;
  location: string;
  summary: string;
  painPoints: string[];
  goals: string[];
  shoppingBehavior: string;
  channels: string[];
  messagingHook: string;
}

export interface BrandExtractionResult {
  brand: Partial<ExtractedBrandData>;
  audiences: DetailedAudienceProfile[];
  assets: Array<{ id: string; name: string; url: string; type: string }>;
}

// ─── API key ───────────────────────────────────────────────────────────────────
function getApiKey(): string {
  let key = '';
  try {
    if (typeof window !== 'undefined' && (window as any).process?.env) {
      key = (window as any).process.env.API_KEY || (window as any).process.env.GEMINI_API_KEY || '';
    }
    if (!key && typeof process !== 'undefined' && process.env) {
      key = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
    }
    if (!key) {
      // @ts-ignore
      key = import.meta.env?.VITE_GEMINI_API_KEY || import.meta.env?.VITE_API_KEY || '';
    }
    if (!key && typeof window !== 'undefined') {
      key = (window as any).API_KEY || (window as any).GEMINI_API_KEY || '';
    }
  } catch {}
  return key;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
export function extractDomainName(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : 'https://' + url);
    const part = u.hostname.replace('www.', '').split('.')[0];
    return part.charAt(0).toUpperCase() + part.slice(1);
  } catch {
    return 'My Brand';
  }
}

function isValidHex(s: string): boolean {
  return /^#[0-9a-fA-F]{3,8}$/.test(s);
}

function dedupeColors(colors: string[]): string[] {
  const seen = new Set<string>();
  return colors
    .map((c) => c.trim().toLowerCase())
    .filter((c) => {
      if (!isValidHex(c) || seen.has(c)) return false;
      // Skip near-white and near-black for palette (we add them manually)
      seen.add(c);
      return true;
    });
}

// ─── Step 1: fetch HTML via CORS proxy ─────────────────────────────────────────
async function fetchPageHtml(url: string): Promise<string | null> {
  const normalized = url.startsWith('http') ? url : 'https://' + url;
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(normalized)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const json = await res.json();
    return json.contents || null;
  } catch {
    return null;
  }
}

// ─── Step 2: parse colors, logo, favicon from HTML ────────────────────────────
interface ParsedPageData {
  themeColor: string | null;
  ogImage: string | null;
  favicon: string | null;
  cssColors: string[];
  title: string | null;
}

function parsePageData(html: string, baseUrl: string): ParsedPageData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // theme-color
  const themeColorMeta = doc.querySelector('meta[name="theme-color"]');
  const themeColor = themeColorMeta?.getAttribute('content') || null;

  // og:image (logo / hero)
  const ogImageMeta = doc.querySelector('meta[property="og:image"]');
  const ogImage = ogImageMeta?.getAttribute('content') || null;

  // favicon
  const faviconLink =
    doc.querySelector('link[rel="icon"][href]') ||
    doc.querySelector('link[rel="shortcut icon"][href]') ||
    doc.querySelector('link[rel="apple-touch-icon"][href]');
  let favicon = faviconLink?.getAttribute('href') || null;
  if (favicon && !favicon.startsWith('http')) {
    try {
      const base = new URL(baseUrl.startsWith('http') ? baseUrl : 'https://' + baseUrl);
      favicon = new URL(favicon, base.origin).href;
    } catch { favicon = null; }
  }

  // Extract hex colors from inline styles and style blocks
  const cssText = Array.from(doc.querySelectorAll('style'))
    .map((s) => s.textContent || '')
    .join(' ');
  const inlineStyles = Array.from(doc.querySelectorAll('[style]'))
    .map((el) => el.getAttribute('style') || '')
    .join(' ');
  const allCss = cssText + ' ' + inlineStyles + ' ' + html.slice(0, 50000);

  const hexPattern = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
  const matches = allCss.match(hexPattern) || [];

  // Count frequency and pick most common non-trivial colors
  const freq: Record<string, number> = {};
  for (const m of matches) {
    const norm = m.toLowerCase();
    freq[norm] = (freq[norm] || 0) + 1;
  }

  const cssColors = Object.entries(freq)
    .filter(([c]) => {
      // skip pure whites / blacks / grays
      const stripped = c.replace('#', '');
      const r = parseInt(stripped.slice(0, 2), 16);
      const g = parseInt(stripped.slice(2, 4), 16);
      const b = stripped.length >= 6 ? parseInt(stripped.slice(4, 6), 16) : r;
      const isGray = Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15;
      const isWhite = r > 240 && g > 240 && b > 240;
      const isBlack = r < 20 && g < 20 && b < 20;
      return !isGray && !isWhite && !isBlack;
    })
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([c]) => c);

  const title = doc.querySelector('title')?.textContent || null;

  return { themeColor, ogImage, favicon, cssColors, title };
}

// ─── Step 2.5: Category-based fallback profiles ───────────────────────────────
interface CategoryProfile {
  description: string;
  toneKeywords: string[];
  headingFont: string;
  bodyFont: string;
  core: Omit<DetailedAudienceProfile, 'id'>;
  secondary: Omit<DetailedAudienceProfile, 'id'>;
}

const CATEGORY_MAP: Record<string, CategoryProfile> = {
  pet: {
    description: 'Premium pet care products for dedicated animal lovers who treat their pets like family.',
    toneKeywords: ['caring', 'trusted', 'natural', 'wholesome'],
    headingFont: 'Nunito',
    bodyFont: 'Inter',
    core: {
      name: 'Devoted Pet Parent',
      age: '28–44',
      gender: 'Primarily female (64%)',
      income: '$55K–$85K',
      location: 'Suburban US + Canada',
      summary: 'Treats their pet as a family member. Prioritizes ingredient quality and brand trust over price.',
      painPoints: [
        'Can\'t easily verify ingredient quality or sourcing claims',
        'Overwhelmed by the number of competing pet brands',
        'Worried about long-term health impact of processed pet food',
      ],
      goals: ['Find a brand they can fully trust for their pet\'s health', 'Simplify the reorder process'],
      shoppingBehavior: 'Researches via vet recommendations and Reddit. Subscribes to auto-ship once trust is established.',
      channels: ['Instagram', 'Pinterest', 'Google Search', 'Facebook Groups'],
      messagingHook: '"You already do everything for them — make sure what\'s in the bowl matches that love."',
    },
    secondary: {
      name: 'New Pet Owner',
      age: '22–32',
      gender: 'Mixed (52% female)',
      income: '$35K–$60K',
      location: 'Urban US',
      summary: 'Recently got their first pet and is still building brand preferences. Highly influenced by social proof.',
      painPoints: [
        'Doesn\'t know which brands to trust',
        'Budget-conscious but wants quality',
        'Anxious about making the wrong choices for their pet\'s health',
      ],
      goals: ['Find an affordable entry-level option from a credible brand', 'Build a consistent routine'],
      shoppingBehavior: 'Shops online-first, leans on reviews and TikTok recommendations. Price-sensitive.',
      channels: ['TikTok', 'Instagram', 'Amazon', 'YouTube'],
      messagingHook: '"Your first choice sets the standard. Start with a brand vets actually recommend."',
    },
  },
  health: {
    description: 'Science-backed wellness products for people who take their health seriously.',
    toneKeywords: ['clean', 'science-backed', 'transparent', 'effective'],
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Inter',
    core: {
      name: 'Proactive Health Optimizer',
      age: '30–48',
      gender: 'Balanced (55% female)',
      income: '$65K–$110K',
      location: 'Urban/suburban US',
      summary: 'Tracks health metrics and treats supplements as investments, not afterthoughts.',
      painPoints: [
        'Can\'t tell which supplement brands are actually evidence-based',
        'Frustrated by proprietary blends that hide dosing',
        'Spends too much time researching what actually works',
      ],
      goals: ['Optimize energy and performance without overhauling their routine', 'Find one trusted brand stack'],
      shoppingBehavior: 'Deep research before buying. Checks lab testing, COA documents. Sticks with brands for years once decided.',
      channels: ['Google', 'YouTube', 'Reddit (r/supplements)', 'Email newsletters'],
      messagingHook: '"No fluff, no pixie-dusting. Just transparent ingredients at clinical doses."',
    },
    secondary: {
      name: 'Wellness Beginner',
      age: '24–36',
      gender: 'Female-skewed (68%)',
      income: '$40K–$70K',
      location: 'US national',
      summary: 'Health-curious but overwhelmed. Looking for simple guidance rather than deep research.',
      painPoints: [
        'Doesn\'t know where to start with supplements',
        'Worried about wasting money on things that don\'t work',
        'Intimidated by clinical language and complex stacks',
      ],
      goals: ['Start a simple, effective routine', 'Feel more energized without a total lifestyle change'],
      shoppingBehavior: 'Buys from recommendations by influencers or friends. Responds to clear before/after framing.',
      channels: ['Instagram', 'TikTok', 'Pinterest'],
      messagingHook: '"You don\'t need 12 supplements. Start with one that actually moves the needle."',
    },
  },
  fashion: {
    description: 'Distinctive apparel and accessories for people who use style as self-expression.',
    toneKeywords: ['bold', 'expressive', 'curated', 'quality-forward'],
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    core: {
      name: 'Intentional Style Buyer',
      age: '26–40',
      gender: 'Primarily female (72%)',
      income: '$50K–$90K',
      location: 'Urban US, UK, Australia',
      summary: 'Buys less, buys better. Invests in pieces with longevity over fast fashion churn.',
      painPoints: [
        'Tired of buying trendy items that fall apart in one season',
        'Struggles to find brands with genuine sizing consistency',
        'Feels like most brands look identical',
      ],
      goals: ['Build a wardrobe with pieces that actually last', 'Find a brand with a distinct aesthetic she can own'],
      shoppingBehavior: 'Browses inspiration on Pinterest, converts on Instagram. Reads size reviews carefully.',
      channels: ['Pinterest', 'Instagram', 'Email (for drops)', 'TikTok'],
      messagingHook: '"Pieces that don\'t apologize for being different — and don\'t fall apart after three washes."',
    },
    secondary: {
      name: 'Trend-Driven Buyer',
      age: '18–27',
      gender: 'Female (79%)',
      income: '$25K–$50K',
      location: 'US national',
      summary: 'Moves fast with trends. High purchase frequency, lower average order value. Driven by social proof.',
      painPoints: [
        'Hard to know if the quality matches the price',
        'Fears buying something everyone else already has',
        'Returns are expensive and annoying',
      ],
      goals: ['Stay current without overspending', 'Find pieces that photograph well'],
      shoppingBehavior: 'Impulse-driven. Converts fast when content is strong. FOMO is the main trigger.',
      channels: ['TikTok', 'Instagram Reels', 'Pinterest'],
      messagingHook: '"Drop-worthy pieces, without the drop-shipping quality."',
    },
  },
  food: {
    description: 'Artisan food and beverage products crafted for people who eat with intention.',
    toneKeywords: ['artisan', 'honest', 'flavorful', 'craft'],
    headingFont: 'Lora',
    bodyFont: 'Inter',
    core: {
      name: 'Conscious Foodie',
      age: '28–45',
      gender: 'Balanced (58% female)',
      income: '$60K–$100K',
      location: 'Coastal US, urban centers',
      summary: 'Reads ingredient labels and will pay a premium for real quality. Cooks regularly.',
      painPoints: [
        'Difficult to find "clean" options that actually taste good',
        'Tired of brands that use wellness buzzwords as marketing cover',
        'Grocery store options feel generic and uninspired',
      ],
      goals: ['Upgrade everyday meals without complicated prep', 'Support brands that align with their values'],
      shoppingBehavior: 'Discovers via food content creators. Buys direct after sampling or seeing a compelling recipe use case.',
      channels: ['Instagram', 'YouTube', 'Food newsletters', 'Pinterest'],
      messagingHook: '"Real ingredients. No performance. Just better food."',
    },
    secondary: {
      name: 'Gift Buyer',
      age: '35–55',
      gender: 'Balanced',
      income: '$55K–$90K',
      location: 'US national',
      summary: 'Buys as a thoughtful gift for food-loving friends or family. Quality and presentation matter.',
      painPoints: [
        'Hard to find food gifts that feel special rather than generic',
        'Uncertain about dietary restrictions',
        'Wants something that looks as good as it tastes',
      ],
      goals: ['Find a memorable gift that shows real thought', 'Easy ordering and delivery'],
      shoppingBehavior: 'Seasonal buyer. Driven by holidays and events. Will pay up for good packaging.',
      channels: ['Google (gift searches)', 'Instagram', 'Email'],
      messagingHook: '"The gift that says you know them — not just that you have good taste."',
    },
  },
  fitness: {
    description: 'Performance gear and supplements for people who train seriously and expect their equipment to keep up.',
    toneKeywords: ['performance', 'durable', 'results-driven', 'no-excuses'],
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Inter',
    core: {
      name: 'Committed Athlete',
      age: '24–40',
      gender: 'Male-skewed (62%)',
      income: '$50K–$85K',
      location: 'US national',
      summary: 'Trains 4–6 days a week and treats gear as a direct input to performance.',
      painPoints: [
        'Gear that fails during peak use',
        'Brands that market hard but underdeliver on durability',
        'Sizing inconsistency across workout apparel',
      ],
      goals: ['Get measurable performance gains', 'Reduce recovery time'],
      shoppingBehavior: 'Research-heavy. Watches YouTube reviews and reads Reddit threads before buying. Brand loyalty is high once earned.',
      channels: ['YouTube', 'Reddit', 'Instagram', 'Google Search'],
      messagingHook: '"Built for the 5 AM session, not the Instagram photo after it."',
    },
    secondary: {
      name: 'Fitness Newcomer',
      age: '20–35',
      gender: 'Female-skewed (60%)',
      income: '$35K–$65K',
      location: 'US national',
      summary: 'Building a fitness habit. Wants gear that feels motivating and approachable.',
      painPoints: [
        'Intimidated by overly technical or "hardcore" brand language',
        'Unsure which products are actually worth the investment',
        'Wants to look good while working out',
      ],
      goals: ['Build consistency with a routine', 'Feel confident at the gym'],
      shoppingBehavior: 'Influenced by fitness creators and before/after testimonials. Buys on momentum.',
      channels: ['Instagram', 'TikTok', 'Pinterest'],
      messagingHook: '"Gear that makes you feel like someone who works out — even on day one."',
    },
  },
  beauty: {
    description: 'Skincare and beauty products with a commitment to clean ingredients and visible results.',
    toneKeywords: ['clean', 'radiant', 'effective', 'sensorial'],
    headingFont: 'Cormorant Garamond',
    bodyFont: 'Inter',
    core: {
      name: 'Informed Beauty Buyer',
      age: '26–42',
      gender: 'Primarily female (85%)',
      income: '$55K–$95K',
      location: 'US, UK, Australia',
      summary: 'Reads INCI lists. Knows the difference between a humectant and an emollient. Won\'t compromise on formulation.',
      painPoints: [
        '"Clean" brands that still include hidden irritants',
        'Products that over-promise and under-deliver on results',
        'Packaging that looks good but degrades the product',
      ],
      goals: ['Simplify her routine to a few products that genuinely work', 'Find formulas that suit her skin type consistently'],
      shoppingBehavior: 'Researches on INCI Decoder and Reddit skincare threads. Samples before committing to full size.',
      channels: ['Instagram', 'YouTube (skincare routines)', 'TikTok', 'Reddit'],
      messagingHook: '"Formulated for results, not for the flat lay."',
    },
    secondary: {
      name: 'Beauty Explorer',
      age: '18–30',
      gender: 'Female (88%)',
      income: '$28K–$55K',
      location: 'US national',
      summary: 'Experimenting with products. Driven by aesthetics, trends, and creator recommendations.',
      painPoints: [
        'Too many options, hard to know what to trust',
        'Products look amazing online but arrive underwhelming',
        'Budget constraints mean every choice matters',
      ],
      goals: ['Find a signature "shelfie" product she\'ll actually use', 'Build her first real skincare routine'],
      shoppingBehavior: 'Impulse-driven. Converts on strong unboxing content and aesthetics. Reviews matter enormously.',
      channels: ['TikTok', 'Instagram', 'YouTube'],
      messagingHook: '"Your routine, simplified. Results you\'ll actually see in 30 days."',
    },
  },
  home: {
    description: 'Thoughtfully designed home goods for people who treat their space as a reflection of their values.',
    toneKeywords: ['considered', 'crafted', 'timeless', 'intentional'],
    headingFont: 'Playfair Display',
    bodyFont: 'Lato',
    core: {
      name: 'Intentional Home Buyer',
      age: '30–48',
      gender: 'Female-skewed (70%)',
      income: '$65K–$110K',
      location: 'Urban/suburban US + UK',
      summary: 'Buys pieces that will still feel right in 10 years. Quality and design story both matter.',
      painPoints: [
        'Most "artisan" brands are just mass production with better photography',
        'Hard to gauge real quality online before receiving the item',
        'Tired of styling trends that date fast',
      ],
      goals: ['Fill the home with pieces that feel genuinely personal', 'Reduce clutter, increase quality per item'],
      shoppingBehavior: 'Long consideration cycle. Saves to wish lists. Converts when there\'s a sale or scarcity signal.',
      channels: ['Pinterest', 'Instagram', 'Email (curated picks)', 'Google'],
      messagingHook: '"Designed to belong in your home, not just on the product page."',
    },
    secondary: {
      name: 'Life Moment Buyer',
      age: '25–40',
      gender: 'Balanced',
      income: '$50K–$85K',
      location: 'US national',
      summary: 'Moving, getting married, or doing a room refresh. In a buying mode for a limited window.',
      painPoints: [
        'Decision fatigue from too many options',
        'Worried about committing to something they\'ll hate in 6 months',
        'Needs fast shipping to meet a deadline',
      ],
      goals: ['Solve a specific room or function quickly', 'Make a choice they\'re proud of'],
      shoppingBehavior: 'Short window, high urgency. Will spend more to get it right. Reviews and return policy matter.',
      channels: ['Google', 'Pinterest', 'Instagram', 'Houzz'],
      messagingHook: '"The right piece makes the room. Here\'s the one that does it."',
    },
  },
};

function inferCategory(domain: string, title: string): string {
  const text = (domain + ' ' + title).toLowerCase();
  if (/pet|dog|cat|pup|puppy|feline|canine|animal|fur|paw/.test(text)) return 'pet';
  if (/vitamin|supplement|health|wellness|cbd|probiotic|gut|immune|sleep|detox/.test(text)) return 'health';
  if (/apparel|cloth|fashion|wear|style|dress|shirt|pant|shoe|boot|bag|accessory|jewelry|jewel/.test(text)) return 'fashion';
  if (/food|drink|coffee|tea|snack|sauce|spice|olive|honey|chocolate|beverage|eat|meal|kitchen/.test(text)) return 'food';
  if (/gym|fitness|workout|sport|train|muscle|protein|athlet|yoga|run|cycling|bike/.test(text)) return 'fitness';
  if (/skin|beauty|cosmetic|makeup|serum|moisturizer|cleanser|toner|lotion|cream|lip|glow/.test(text)) return 'beauty';
  if (/home|decor|furniture|candle|pillow|rug|lamp|living|bedroom|kitchen|bath|linen/.test(text)) return 'home';
  return 'default';
}

function buildFallbackProfiles(domain: string, storeName: string, title: string): {
  brand: Partial<ExtractedBrandData>;
  audiences: DetailedAudienceProfile[];
} {
  const category = inferCategory(domain, title);
  const template = CATEGORY_MAP[category] || CATEGORY_MAP['health'];

  const now = Date.now();
  return {
    brand: {
      description: template.description.replace(/\bthe brand\b/gi, storeName),
      toneKeywords: template.toneKeywords,
      headingFont: template.headingFont,
      bodyFont: template.bodyFont,
    },
    audiences: [
      { id: `aud-fallback-core-${now}`, ...template.core },
      { id: `aud-fallback-sec-${now + 1}`, ...template.secondary },
    ],
  };
}

// ─── Step 3: Gemini brand intelligence ────────────────────────────────────────
async function generateBrandIntelligence(
  storeName: string,
  storeUrl: string,
  pageContext: string
): Promise<{ brand: Partial<ExtractedBrandData>; audiences: DetailedAudienceProfile[] }> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('No Gemini API key');

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are a brand strategist analyzing an e-commerce brand. Based on the store URL and any context provided, generate a detailed brand analysis.

Store URL: ${storeUrl}
Store Name: ${storeName}
Page context: ${pageContext.slice(0, 800)}

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "brand": {
    "description": "2-3 sentence brand description based on the domain/name",
    "toneKeywords": ["word1", "word2", "word3", "word4"],
    "headingFont": "font name suggestion",
    "bodyFont": "font name suggestion"
  },
  "audiences": [
    {
      "name": "Core Buyer",
      "age": "age range like 28-42",
      "gender": "e.g. Primarily female (65%)",
      "income": "e.g. $55K-$90K",
      "location": "e.g. Suburban US + Canada",
      "summary": "1 sentence description",
      "painPoints": ["specific pain 1", "specific pain 2", "specific pain 3"],
      "goals": ["goal 1", "goal 2"],
      "shoppingBehavior": "1 sentence on how/when they shop",
      "channels": ["Instagram", "Pinterest"],
      "messagingHook": "The core message angle that resonates with this audience"
    },
    {
      "name": "Secondary Buyer",
      "age": "age range",
      "gender": "breakdown",
      "income": "range",
      "location": "geography",
      "summary": "1 sentence",
      "painPoints": ["pain 1", "pain 2"],
      "goals": ["goal 1", "goal 2"],
      "shoppingBehavior": "behavior description",
      "channels": ["TikTok", "Google"],
      "messagingHook": "message angle"
    }
  ]
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Strip any markdown code blocks if present
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(clean);

  const audiences: DetailedAudienceProfile[] = (parsed.audiences || []).map(
    (a: any, i: number) => ({
      id: `aud-gemini-${Date.now()}-${i}`,
      name: a.name || 'Buyer Profile',
      age: a.age || '',
      gender: a.gender || '',
      income: a.income || '',
      location: a.location || '',
      summary: a.summary || '',
      painPoints: a.painPoints || [],
      goals: a.goals || [],
      shoppingBehavior: a.shoppingBehavior || '',
      channels: a.channels || [],
      messagingHook: a.messagingHook || '',
    })
  );

  return { brand: parsed.brand || {}, audiences };
}

// ─── Main extraction function ──────────────────────────────────────────────────
export async function extractBrandFromUrl(url: string): Promise<BrandExtractionResult> {
  const storeName = extractDomainName(url);
  const normalized = url.startsWith('http') ? url : 'https://' + url;

  // Run page fetch and Gemini call in parallel
  const [html, geminiResult] = await Promise.allSettled([
    fetchPageHtml(normalized),
    generateBrandIntelligence(storeName, normalized, storeName + ' e-commerce brand'),
  ]);

  // Parse real page data if available
  let pageData: ParsedPageData | null = null;
  let pageText = '';
  if (html.status === 'fulfilled' && html.value) {
    pageData = parsePageData(html.value, normalized);
    pageText = html.value.slice(0, 800);

    // If we got page data, re-run Gemini with actual page context
    // (only if first Gemini call failed or we have useful context)
    if (geminiResult.status === 'rejected' && pageText) {
      try {
        const retry = await generateBrandIntelligence(storeName, normalized, pageText);
        Object.assign(geminiResult, { status: 'fulfilled', value: retry });
      } catch {}
    }
  }

  // Build color palette
  let colors: string[] = [];
  if (pageData?.themeColor && isValidHex(pageData.themeColor)) {
    colors.push(pageData.themeColor.toLowerCase());
  }
  if (pageData?.cssColors) {
    colors.push(...pageData.cssColors);
  }
  colors = dedupeColors(colors);

  // Always include black and white as neutral anchors
  if (!colors.includes('#ffffff')) colors.push('#ffffff');
  if (!colors.includes('#111111')) colors.push('#111111');

  // Cap at 6
  colors = colors.slice(0, 6);

  // If we couldn't extract real colors, generate plausible ones from hash
  if (colors.length <= 2) {
    const hash = url.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const h1 = hash % 360;
    const h2 = (hash * 7 + 120) % 360;
    colors = [
      `hsl(${h1}, 65%, 45%)`,
      `hsl(${h2}, 55%, 35%)`,
      '#ffffff',
      '#111111',
    ];
  }

  // Logo from og:image or favicon
  const logoUrl = pageData?.ogImage || pageData?.favicon || null;

  // Assets: use og:image as first asset if available
  const assets = [];
  if (pageData?.ogImage) {
    assets.push({
      id: `asset-og-${Date.now()}`,
      name: 'Store Hero Image',
      url: pageData.ogImage,
      type: 'Lifestyle',
    });
  }
  // Fill rest with picsum seeds
  const hash2 = url.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const seeds = ['prod1', 'prod2', 'prod3', 'prod4', 'prod5'];
  seeds.slice(0, 5 - assets.length).forEach((seed, i) => {
    assets.push({
      id: `asset-${seed}-${hash2}-${i}`,
      name: `Product ${assets.length + 1}.jpg`,
      url: `https://picsum.photos/seed/${seed + hash2}/400/400`,
      type: 'Product Image',
    });
  });

  // Use Gemini result if available, otherwise use category-based fallback
  const pageTitle = pageData?.title || storeName;
  let intelligenceData: { brand: Partial<ExtractedBrandData>; audiences: DetailedAudienceProfile[] };

  if (geminiResult.status === 'fulfilled' && geminiResult.value.audiences.length > 0) {
    intelligenceData = {
      brand: geminiResult.value.brand as Partial<ExtractedBrandData>,
      audiences: geminiResult.value.audiences,
    };
  } else {
    // Fallback: category-based profiles derived from domain keywords
    intelligenceData = buildFallbackProfiles(
      new URL(normalized).hostname,
      storeName,
      pageTitle
    );
  }

  const brand: Partial<ExtractedBrandData> = {
    name: pageTitle.split(/[|\-–—]/)[0].trim() || storeName,
    colors,
    logoUrl,
    description: intelligenceData.brand?.description || `Quality products from ${storeName}.`,
    toneKeywords: intelligenceData.brand?.toneKeywords || ['premium', 'trusted', 'authentic'],
    headingFont: intelligenceData.brand?.headingFont || 'Plus Jakarta Sans',
    bodyFont: intelligenceData.brand?.bodyFont || 'Inter',
  };

  return { brand, audiences: intelligenceData.audiences, assets };
}
