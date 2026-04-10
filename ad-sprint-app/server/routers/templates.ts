/**
 * templates.ts — tRPC router for ad template management
 *
 * Built-in templates come pre-seeded from AdCanvas-Max's 9 templates.
 * Users can also create custom templates by uploading a reference ad image.
 */

import { z } from "zod";
import { eq, or, isNull } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { templates, InsertTemplate } from "../../drizzle/schema";
import { analyzeAdStyle } from "../services/geminiService";

// ─── SEED DATA ───────────────────────────────────────────────────────────────

export const BUILT_IN_TEMPLATES: Omit<InsertTemplate, "id" | "createdAt">[] = [
  {
    userId: null,
    name: "Sunlit Variety",
    description:
      "Multiple product units on a warm wooden surface with dramatic sunlight and long shadows.",
    category: "Studio",
    keywords: "warm, wooden, sunlight, shadows, premium, artisanal",
    promptTemplate:
      "Multiple units of the product (the subject image) arranged on a warm, textured wooden surface. Dramatic, high-contrast natural sunlight streams across the scene from the side, creating long, sharp shadows. The lighting is warm and golden, giving a premium, artisanal feel. Professional product photography, 8k, realistic textures.",
    referenceImageUrl: null,
    isBuiltIn: true,
  },
  {
    userId: null,
    name: "Testimonial Comparison",
    description:
      "High-impact ad with a testimonial quote, a discount badge, and a wellness focus.",
    category: "Creative",
    keywords: "testimonial, discount, wellness, comparison, clean",
    promptTemplate:
      'A high-impact health-focused advertisement. In the center is a close-up of a person\'s mouth showing skin damage labeled "Damage from nicotine pouches". The product (the subject image) is placed in the bottom left corner. A bright green circular badge says "SAVE UP TO 45% OFF". At the top, a large testimonial box with a quote and a customer name. Professional medical/commercial layout.',
    referenceImageUrl: null,
    isBuiltIn: true,
  },
  {
    userId: null,
    name: "Vibrant Fruit Burst",
    description:
      "Bright, energetic announcement with floating fruit and a pop-art feel.",
    category: "Studio",
    keywords: "vibrant, fruit, energetic, pop-art, bright",
    promptTemplate:
      'A bright and energetic product announcement. The product (the subject image) is the central focus, angled dynamically. It is surrounded by oversized, realistic floating blue raspberries with green leaves at the corners. The background is a clean, vibrant blue gradient. Bold "INTRODUCING" and "BLUE RASPBERRY" text in a modern, heavy font.',
    referenceImageUrl: null,
    isBuiltIn: true,
  },
  {
    userId: null,
    name: "Athletic Performance",
    description:
      "Dynamic sports-focused ad with a runner on a track and bold typography.",
    category: "Lifestyle",
    keywords: "athletic, performance, sports, runner, dynamic",
    promptTemplate:
      'A dynamic sports-focused advertisement. The product (the subject image) is sharp and clear in the center foreground. The background is a motion-blurred shot of a muscular runner on an athletic track. Bold yellow text at the top says "ENERGY POUCHES BUILT FOR RUNNERS". High-energy, high-contrast aesthetic.',
    referenceImageUrl: null,
    isBuiltIn: true,
  },
  {
    userId: null,
    name: "Moody Hand-off",
    description:
      "Cinematic ad showing a hand-off in a dark, moody environment with dramatic lighting.",
    category: "Lifestyle",
    keywords: "moody, cinematic, hands, dramatic, interaction",
    promptTemplate:
      'A cinematic, moody advertisement. Two hands are shown in a close-up, one person passing the product (the subject image) to another. The background is dark and out of focus, showing a muscular torso. At the top, a 5-star rating and text "4.7 STARS FROM 30,000+ CUSTOMERS". Large bold text says "UPGRADE YOUR VICE". High-end commercial photography with dramatic lighting.',
    referenceImageUrl: null,
    isBuiltIn: true,
  },
  {
    userId: null,
    name: "Dark Refreshment",
    description:
      "Sleek ad with fresh lime slices and a dark, textured background.",
    category: "Studio",
    keywords: "refreshing, lime, dark, textured, sleek",
    promptTemplate:
      'A sleek and refreshing "LIMITED RELEASE!" advertisement. The product (the subject image) is placed centrally on a dark, textured black background. It is accompanied by fresh, vibrant lime slices and loose white product pouches spilling out. Bold lime-green text at the top and bottom says "LIMITED RELEASE!" and "CLEAN & REFRESHING". Sharp, focused lighting.',
    referenceImageUrl: null,
    isBuiltIn: true,
  },
  {
    userId: null,
    name: "Ingredient Infographic",
    description:
      "Technical infographic ad highlighting ingredients with glowing lines and a dark atmosphere.",
    category: "Creative",
    keywords: "infographic, technical, ingredients, science, precision",
    promptTemplate:
      'A technical, science-focused infographic advertisement. The product (the subject image) is in the center, with glowing teal lines pointing to various ingredients in small glass containers arranged around it (e.g., white powder, papaya). Each ingredient has a label like "100mg CAFFEINE ANHYDROUS". The background is a dark, atmospheric teal space. Professional, precise, and high-tech look.',
    referenceImageUrl: null,
    isBuiltIn: true,
  },
  {
    userId: null,
    name: "Gym & Gains",
    description:
      "High-intensity fitness ad with a gym background and powerful typography.",
    category: "Lifestyle",
    keywords: "gym, fitness, gains, strength, powerful",
    promptTemplate:
      'A high-intensity fitness advertisement. The product (the subject image) is in the foreground, sharp and clear. The background shows a person in a gym, motion-blurred, near a heavy barbell with "ROGUE" plates. Bold yellow text says "ENERGY POUCHES" and "BUILT FOR HIGH REPS AND BIG GAINS". Gritty, powerful gym aesthetic.',
    referenceImageUrl: null,
    isBuiltIn: true,
  },
  {
    userId: null,
    name: "Desk Flow State",
    description:
      "Modern workspace ad symbolizing clarity and focus with a desk setting.",
    category: "Room",
    keywords: "workspace, desk, flow-state, focus, clarity",
    promptTemplate:
      'A modern workspace advertisement. The product (the subject image) is placed on a clean desk, propped up against a crushed silver soda can labeled "LIQUID ANXIETY". Other cans labeled "ENERGY DRINK" and "JITTER JUICE" are in the blurred background. Bold text at the top says "THIS IS FLOW STATE". Clean, productive, and focused aesthetic.',
    referenceImageUrl: null,
    isBuiltIn: true,
  },
];

// ─── ROUTER ──────────────────────────────────────────────────────────────────

export const templateRouter = router({
  /**
   * List all templates: built-in + current user's custom templates.
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    return db
      .select()
      .from(templates)
      .where(or(isNull(templates.userId), eq(templates.userId, ctx.user.id)));
  }),

  /**
   * Create a custom template by uploading a reference ad image.
   * Gemini analyzes the style and generates metadata automatically.
   */
  create: protectedProcedure
    .input(
      z.object({
        referenceImageBase64: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const analysis = await analyzeAdStyle(
        input.referenceImageBase64,
        input.mimeType
      );

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(templates).values({
        userId: ctx.user.id,
        name: analysis.name || "Custom Template",
        description: analysis.prompt,
        category: analysis.category,
        keywords: analysis.keywords,
        promptTemplate: analysis.prompt,
        referenceImageUrl: null, // TODO: upload to S3 and store URL
        isBuiltIn: false,
      });

      const insertId = (result as any)[0]?.insertId;
      if (!insertId) throw new Error("Failed to create template");

      return {
        id: insertId,
        name: analysis.name,
        category: analysis.category,
        keywords: analysis.keywords,
      };
    }),

  /**
   * Delete a custom template. Only the owner can delete their own templates.
   * Built-in templates cannot be deleted.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership — can only delete own non-built-in templates
      const existing = await db
        .select()
        .from(templates)
        .where(eq(templates.id, input.id))
        .limit(1);

      if (!existing.length) throw new Error("Template not found");
      if (existing[0].isBuiltIn) throw new Error("Cannot delete built-in templates");
      if (existing[0].userId !== ctx.user.id)
        throw new Error("Cannot delete another user's template");

      await db.delete(templates).where(eq(templates.id, input.id));
      return { success: true };
    }),

  /**
   * Seed built-in templates if they don't exist yet.
   * Called on app startup or manually by admin.
   */
  seed: protectedProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Check if built-in templates already exist
    const existing = await db
      .select()
      .from(templates)
      .where(eq(templates.isBuiltIn, true))
      .limit(1);

    if (existing.length > 0) {
      return { seeded: false, message: "Built-in templates already exist" };
    }

    await db.insert(templates).values(BUILT_IN_TEMPLATES);
    return { seeded: true, count: BUILT_IN_TEMPLATES.length };
  }),
});
