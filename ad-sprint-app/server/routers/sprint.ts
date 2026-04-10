/**
 * sprint.ts — tRPC router for ad sprint pipeline
 *
 * Full pipeline: URL → product intel → competitive analysis → 60 angles →
 * score top 20 → image generation → test plan → winner iteration
 */

import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import {
  sprints,
  angles,
  generatedAds,
  testPlans,
  templates,
  InsertAngle,
} from "../../drizzle/schema";
import {
  generateAdImage,
  matchTemplateForCategory,
  type AspectRatioValue,
} from "../services/geminiService";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Extract JSON from LLM response that might be wrapped in markdown fences */
function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  // Try to find first { ... } block
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) return braceMatch[0];
  return text.trim();
}

/** Safely parse LLM response content to string */
function responseToString(
  content: string | Array<{ type: string; text?: string }>
): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((p) => p.type === "text" && p.text)
      .map((p) => p.text!)
      .join("");
  }
  return String(content);
}

// ─── ROUTER ──────────────────────────────────────────────────────────────────

export const sprintRouter = router({
  // ── Create a new sprint from a URL ──────────────────────────────────────

  create: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
        brandName: z.string().optional(),
        audience: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Step 1: Fetch URL content and extract product intel via LLM
      let pageContent = "";
      try {
        const resp = await fetch(input.url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; AdSprintBot/1.0)" },
          signal: AbortSignal.timeout(15000),
        });
        pageContent = await resp.text();
        // Strip HTML tags, keep text content (rough extraction)
        pageContent = pageContent
          .replace(/<script[\s\S]*?<\/script>/gi, "")
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .slice(0, 12000);
      } catch (e) {
        console.warn("[Sprint] Failed to fetch URL:", e);
      }

      // Step 2: LLM extracts product intelligence
      const extractResult = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a DTC product analyst. Extract structured product intelligence from website content. Return ONLY valid JSON, no markdown fences.`,
          },
          {
            role: "user",
            content: `Analyze this website content and extract product intelligence.

URL: ${input.url}
${input.brandName ? `Brand hint: ${input.brandName}` : ""}
${input.audience ? `Target audience: ${input.audience}` : ""}

Website content:
${pageContent || "(Could not fetch — use the URL and brand name to infer what you can)"}

Return JSON with this structure:
{
  "brandName": "string",
  "productName": "string",
  "category": "string",
  "price": "string or null",
  "features": ["top 5 product features"],
  "proof": ["social proof points — reviews, testimonials, press, numbers"],
  "offer": "current offer/deal if any",
  "audience": "target customer description",
  "positioning": "how they position vs alternatives",
  "visualStyle": "brand visual aesthetic description",
  "colors": ["primary brand colors as hex"]
}`,
          },
        ],
        responseFormat: { type: "json_object" },
      });

      const rawIntel = responseToString(
        extractResult.choices[0]?.message?.content || "{}"
      );
      let productIntel: Record<string, any>;
      try {
        productIntel = JSON.parse(extractJSON(rawIntel));
      } catch {
        productIntel = { brandName: input.brandName || "Unknown", raw: rawIntel };
      }

      const brandName =
        input.brandName || productIntel.brandName || "Unknown Brand";

      // Step 3: Save sprint to DB
      const result = await db.insert(sprints).values({
        userId: ctx.user.id,
        brandName,
        brandUrl: input.url,
        productIntel: JSON.stringify(productIntel),
        status: "draft",
      });

      const sprintId = (result as any)[0]?.insertId;
      if (!sprintId) throw new Error("Failed to create sprint");

      return { sprintId, productIntel, brandName };
    }),

  // ── Generate 60 ad angles ──────────────────────────────────────────────

  generateAngles: protectedProcedure
    .input(
      z.object({
        sprintId: z.number(),
        competitorGaps: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Load sprint data
      const sprint = await db
        .select()
        .from(sprints)
        .where(
          and(eq(sprints.id, input.sprintId), eq(sprints.userId, ctx.user.id))
        )
        .limit(1);

      if (!sprint.length) throw new Error("Sprint not found");
      const s = sprint[0];

      let productIntel: Record<string, any> = {};
      try {
        productIntel = JSON.parse(s.productIntel || "{}");
      } catch {}

      // Update sprint status
      await db
        .update(sprints)
        .set({ status: "generating" })
        .where(eq(sprints.id, input.sprintId));

      // Generate 60 angles via LLM
      const angleResult = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an elite DTC ad strategist who writes high-converting Meta ad copy. Generate exactly 60 ad angles — 10 per category. Every angle must reference specific product data. No generic copy. Return ONLY valid JSON.`,
          },
          {
            role: "user",
            content: `Generate 60 ad headline angles for ${s.brandName}.

PRODUCT INTELLIGENCE:
${JSON.stringify(productIntel, null, 2)}

${input.competitorGaps ? `COMPETITIVE GAPS TO EXPLOIT:\n${input.competitorGaps}\n` : ""}

Generate exactly 10 angles per category:
1. Problem-Aware — lead with a specific pain point the audience feels
2. Benefit-Led — lead with a concrete outcome or transformation
3. Social Proof — lead with credibility, numbers, reviews, or authority
4. Direct Offer — lead with deal, price anchor, or value comparison
5. Curiosity — create an information gap that demands a click
6. Comparison — position against specific alternatives or old way of doing things

For EACH angle provide:
- headline: under 40 characters, punchy, specific
- primaryText: under 125 characters, supports the headline
- cta: call to action (e.g. "Shop Now", "Try It Free", "See the Difference")
- category: one of the 6 categories above

Then score each angle 1-10 on:
- scoreBrandFit: Does the tone match this brand's voice and positioning?
- scoreHookStrength: Would this stop a thumb-scroller in under 2 seconds?
- scoreCompliance: Within Meta ad limits? No restricted language or false claims?

Return as JSON: { "angles": [{ "headline", "primaryText", "cta", "category", "scoreBrandFit", "scoreHookStrength", "scoreCompliance" }] }

All 60 angles. No duplicates. No filler.`,
          },
        ],
        responseFormat: { type: "json_object" },
      });

      const rawAngles = responseToString(
        angleResult.choices[0]?.message?.content || "{}"
      );
      let parsedAngles: any[];
      try {
        const parsed = JSON.parse(extractJSON(rawAngles));
        parsedAngles = parsed.angles || parsed.Angles || [];
      } catch {
        throw new Error("Failed to parse angle generation response");
      }

      // Score and rank
      const scored = parsedAngles.map((a: any, i: number) => {
        const bf = Number(a.scoreBrandFit) || 5;
        const hs = Number(a.scoreHookStrength) || 5;
        const mc = Number(a.scoreCompliance) || 5;
        const avg = Number(((bf + hs + mc) / 3).toFixed(1));
        return { ...a, scoreBrandFit: bf, scoreHookStrength: hs, scoreCompliance: mc, scoreAverage: avg, originalIndex: i };
      });

      scored.sort((a: any, b: any) => b.scoreAverage - a.scoreAverage);

      // Save all 60 angles to DB
      const anglesToInsert: InsertAngle[] = scored.map((a: any, rank: number) => ({
        sprintId: input.sprintId,
        rank: rank + 1,
        headline: String(a.headline || "").slice(0, 255),
        primaryText: String(a.primaryText || "").slice(0, 500),
        cta: String(a.cta || "").slice(0, 100),
        category: String(a.category || "Curiosity").slice(0, 50),
        scoreBrandFit: a.scoreBrandFit,
        scoreHookStrength: a.scoreHookStrength,
        scoreCompliance: a.scoreCompliance,
        scoreAverage: String(a.scoreAverage),
        isTop20: rank < 20,
        batch: 0,
      }));

      await db.insert(angles).values(anglesToInsert);

      // Update sprint status
      await db
        .update(sprints)
        .set({ status: "complete" })
        .where(eq(sprints.id, input.sprintId));

      return {
        total: anglesToInsert.length,
        top20Count: Math.min(20, anglesToInsert.length),
        angles: anglesToInsert,
      };
    }),

  // ── Generate ad images for top angles ──────────────────────────────────

  generateImages: protectedProcedure
    .input(
      z.object({
        sprintId: z.number(),
        productImageBase64: z.string(),
        productMimeType: z.string().default("image/png"),
        templateIds: z.array(z.number()).optional(),
        aspectRatio: z.enum(["1:1", "4:5", "9:16", "16:9"]).default("1:1"),
        count: z.number().min(1).max(20).default(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify sprint ownership
      const sprint = await db
        .select()
        .from(sprints)
        .where(
          and(eq(sprints.id, input.sprintId), eq(sprints.userId, ctx.user.id))
        )
        .limit(1);
      if (!sprint.length) throw new Error("Sprint not found");

      // Load top N angles
      const topAngles = await db
        .select()
        .from(angles)
        .where(eq(angles.sprintId, input.sprintId))
        .orderBy(angles.rank)
        .limit(input.count);

      if (!topAngles.length) throw new Error("No angles found. Generate angles first.");

      // Load available templates
      const availableTemplates = await db.select().from(templates);
      const templateMap = new Map(availableTemplates.map((t) => [t.id, t]));
      const templateIdStrings = availableTemplates.map((t) =>
        t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      );

      // Generate images sequentially (to avoid rate limits)
      const results: Array<{ angleId: number; imageUrl: string; status: string }> = [];

      for (const angle of topAngles) {
        try {
          // Pick a template based on angle category
          const matchedSlug = matchTemplateForCategory(
            angle.category,
            templateIdStrings
          );
          const matchedTemplate = availableTemplates.find(
            (t) =>
              t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === matchedSlug
          ) || availableTemplates[0];

          if (!matchedTemplate) {
            console.warn(`[Sprint] No template available for angle ${angle.id}`);
            continue;
          }

          // Create a pending record
          const adResult = await db.insert(generatedAds).values({
            sprintId: input.sprintId,
            angleId: angle.id,
            templateId: matchedTemplate.id,
            aspectRatio: input.aspectRatio,
            headline: angle.headline,
            primaryText: angle.primaryText,
            status: "generating",
          });
          const adId = (adResult as any)[0]?.insertId;

          // Generate the image
          const base64Image = await generateAdImage({
            productBase64: input.productImageBase64,
            productMimeType: input.productMimeType,
            template: matchedTemplate,
            aspectRatio: input.aspectRatio as AspectRatioValue,
            headline: angle.headline,
            subheadline: angle.primaryText || undefined,
          });

          // TODO: Upload base64Image to S3 and get URL
          // For now, store as data URI
          const imageUrl = `data:image/png;base64,${base64Image}`;

          await db
            .update(generatedAds)
            .set({ imageUrl, status: "complete" })
            .where(eq(generatedAds.id, adId));

          results.push({ angleId: angle.id, imageUrl, status: "complete" });
        } catch (err: any) {
          console.error(
            `[Sprint] Image generation failed for angle ${angle.id}:`,
            err.message
          );
          results.push({
            angleId: angle.id,
            imageUrl: "",
            status: `failed: ${err.message}`,
          });
        }
      }

      return { generated: results.filter((r) => r.status === "complete").length, results };
    }),

  // ── Generate test plan ─────────────────────────────────────────────────

  generateTestPlan: protectedProcedure
    .input(z.object({ sprintId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const sprint = await db
        .select()
        .from(sprints)
        .where(
          and(eq(sprints.id, input.sprintId), eq(sprints.userId, ctx.user.id))
        )
        .limit(1);
      if (!sprint.length) throw new Error("Sprint not found");

      // Load top 20 angles
      const top20 = await db
        .select()
        .from(angles)
        .where(and(eq(angles.sprintId, input.sprintId), eq(angles.isTop20, true)))
        .orderBy(angles.rank);

      const categoryBreakdown = top20.reduce(
        (acc: Record<string, number>, a) => {
          acc[a.category] = (acc[a.category] || 0) + 1;
          return acc;
        },
        {}
      );

      // Generate test plan via LLM
      const planResult = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a Meta ads media buyer and testing strategist. Create a data-driven test plan. Return ONLY valid JSON.`,
          },
          {
            role: "user",
            content: `Create a 4-week ad testing plan for ${sprint[0].brandName}.

TOP 20 AD ANGLES BY CATEGORY:
${JSON.stringify(categoryBreakdown)}

Top headlines:
${top20.map((a) => `- [${a.category}] "${a.headline}" (avg: ${a.scoreAverage})`).join("\n")}

Return JSON:
{
  "funnelMap": {
    "cold": { "categories": ["Curiosity", "Comparison"], "budgetPct": 50, "objective": "string" },
    "warm": { "categories": ["Problem-Aware", "Benefit-Led"], "budgetPct": 30, "objective": "string" },
    "hot": { "categories": ["Social Proof", "Direct Offer"], "budgetPct": 20, "objective": "string" }
  },
  "weeklyCalendar": [
    { "week": 1, "title": "string", "actions": ["string"], "budget": "string", "kpis": ["string"] },
    { "week": 2, "title": "string", "actions": ["string"], "budget": "string", "kpis": ["string"] },
    { "week": 3, "title": "string", "actions": ["string"], "budget": "string", "kpis": ["string"] },
    { "week": 4, "title": "string", "actions": ["string"], "budget": "string", "kpis": ["string"] }
  ],
  "criteria": {
    "kill": { "threshold": "string", "signal": "string" },
    "hold": { "threshold": "string", "signal": "string" },
    "scale": { "threshold": "string", "signal": "string" }
  }
}`,
          },
        ],
        responseFormat: { type: "json_object" },
      });

      const rawPlan = responseToString(
        planResult.choices[0]?.message?.content || "{}"
      );
      let plan: Record<string, any>;
      try {
        plan = JSON.parse(extractJSON(rawPlan));
      } catch {
        throw new Error("Failed to parse test plan response");
      }

      // Save to DB
      await db.insert(testPlans).values({
        sprintId: input.sprintId,
        funnelMap: JSON.stringify(plan.funnelMap || {}),
        weeklyCalendar: JSON.stringify(plan.weeklyCalendar || []),
        criteria: JSON.stringify(plan.criteria || {}),
      });

      return plan;
    }),

  // ── Iterate on winners ─────────────────────────────────────────────────

  iterateWinners: protectedProcedure
    .input(
      z.object({
        sprintId: z.number(),
        winnerHeadlines: z.array(z.string()).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const sprint = await db
        .select()
        .from(sprints)
        .where(
          and(eq(sprints.id, input.sprintId), eq(sprints.userId, ctx.user.id))
        )
        .limit(1);
      if (!sprint.length) throw new Error("Sprint not found");

      let productIntel: Record<string, any> = {};
      try {
        productIntel = JSON.parse(sprint[0].productIntel || "{}");
      } catch {}

      // Find the current max batch number
      const existingAngles = await db
        .select()
        .from(angles)
        .where(eq(angles.sprintId, input.sprintId));
      const maxBatch = Math.max(0, ...existingAngles.map((a) => a.batch));
      const nextBatch = maxBatch + 1;

      // Generate 20 new variations based on winning patterns
      const iterResult = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a DTC ad copy iteration specialist. Analyze winning ad headlines and generate new variations that build on the same patterns. Return ONLY valid JSON.`,
          },
          {
            role: "user",
            content: `These headlines won in testing for ${sprint[0].brandName}:

WINNERS:
${input.winnerHeadlines.map((h) => `- "${h}"`).join("\n")}

PRODUCT:
${JSON.stringify(productIntel, null, 2)}

Analyze what makes these winners work (emotional trigger, structure, specificity, category) and generate 20 NEW headline angles that build on those patterns.

Mix across at least 3 categories. Each new angle should feel like a sibling of the winners, not a clone.

Return JSON: { "angles": [{ "headline", "primaryText", "cta", "category", "scoreBrandFit", "scoreHookStrength", "scoreCompliance" }] }`,
          },
        ],
        responseFormat: { type: "json_object" },
      });

      const rawIter = responseToString(
        iterResult.choices[0]?.message?.content || "{}"
      );
      let newAngles: any[];
      try {
        const parsed = JSON.parse(extractJSON(rawIter));
        newAngles = parsed.angles || [];
      } catch {
        throw new Error("Failed to parse iteration response");
      }

      // Score, rank, and save
      const scored = newAngles.map((a: any) => {
        const bf = Number(a.scoreBrandFit) || 5;
        const hs = Number(a.scoreHookStrength) || 5;
        const mc = Number(a.scoreCompliance) || 5;
        const avg = Number(((bf + hs + mc) / 3).toFixed(1));
        return { ...a, scoreBrandFit: bf, scoreHookStrength: hs, scoreCompliance: mc, scoreAverage: avg };
      });
      scored.sort((a: any, b: any) => b.scoreAverage - a.scoreAverage);

      const toInsert: InsertAngle[] = scored.map((a: any, rank: number) => ({
        sprintId: input.sprintId,
        rank: rank + 1,
        headline: String(a.headline || "").slice(0, 255),
        primaryText: String(a.primaryText || "").slice(0, 500),
        cta: String(a.cta || "").slice(0, 100),
        category: String(a.category || "Curiosity").slice(0, 50),
        scoreBrandFit: a.scoreBrandFit,
        scoreHookStrength: a.scoreHookStrength,
        scoreCompliance: a.scoreCompliance,
        scoreAverage: String(a.scoreAverage),
        isTop20: rank < 10,
        batch: nextBatch,
      }));

      await db.insert(angles).values(toInsert);

      return { batch: nextBatch, total: toInsert.length, angles: toInsert };
    }),

  // ── Get full sprint with all related data ──────────────────────────────

  getSprint: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const sprint = await db
        .select()
        .from(sprints)
        .where(
          and(eq(sprints.id, input.id), eq(sprints.userId, ctx.user.id))
        )
        .limit(1);

      if (!sprint.length) throw new Error("Sprint not found");

      const [sprintAngles, ads, plans] = await Promise.all([
        db
          .select()
          .from(angles)
          .where(eq(angles.sprintId, input.id))
          .orderBy(angles.batch, angles.rank),
        db
          .select()
          .from(generatedAds)
          .where(eq(generatedAds.sprintId, input.id))
          .orderBy(desc(generatedAds.createdAt)),
        db
          .select()
          .from(testPlans)
          .where(eq(testPlans.sprintId, input.id))
          .limit(1),
      ]);

      const s = sprint[0];
      return {
        ...s,
        productIntel: s.productIntel ? JSON.parse(s.productIntel) : null,
        brandKit: s.brandKit ? JSON.parse(s.brandKit) : null,
        angles: sprintAngles,
        generatedAds: ads,
        testPlan: plans[0]
          ? {
              ...plans[0],
              funnelMap: plans[0].funnelMap
                ? JSON.parse(plans[0].funnelMap)
                : null,
              weeklyCalendar: plans[0].weeklyCalendar
                ? JSON.parse(plans[0].weeklyCalendar)
                : null,
              criteria: plans[0].criteria
                ? JSON.parse(plans[0].criteria)
                : null,
            }
          : null,
      };
    }),

  // ── List all sprints for current user ──────────────────────────────────

  listSprints: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const result = await db
      .select()
      .from(sprints)
      .where(eq(sprints.userId, ctx.user.id))
      .orderBy(desc(sprints.createdAt));

    return result.map((s) => ({
      id: s.id,
      brandName: s.brandName,
      brandUrl: s.brandUrl,
      status: s.status,
      createdAt: s.createdAt,
    }));
  }),
});
