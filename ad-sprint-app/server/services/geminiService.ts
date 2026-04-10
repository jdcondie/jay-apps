/**
 * geminiService.ts — Server-side Gemini image generation + style analysis
 *
 * Adapted from AdCanvas-Max's client-side service.
 * Key changes: API key from ENV, S3 upload after generation, Node.js compatible.
 */

import { GoogleGenAI } from "@google/genai";
import { ENV } from "../_core/env";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface AdStyleAnalysis {
  name: string;
  category: string;
  keywords: string;
  prompt: string;
}

export type AspectRatioValue = "1:1" | "4:5" | "9:16" | "16:9";

export interface TemplateInput {
  name: string;
  description?: string | null;
  promptTemplate?: string | null;
  referenceImageUrl?: string | null;
}

// ─── INTERNALS ───────────────────────────────────────────────────────────────

function getClient(): GoogleGenAI {
  const key = ENV.geminiApiKey;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleGenAI({ apiKey: key });
}

const MODEL_CHAIN = [
  "gemini-2.0-flash-preview-image-generation",
  "gemini-2.5-flash-preview-05-20",
];

async function callGemini(
  ai: GoogleGenAI,
  parts: any[],
  aspectRatio: AspectRatioValue
): Promise<string> {
  for (const model of MODEL_CHAIN) {
    try {
      console.log(`[Gemini] Trying model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: { parts },
        config: {
          responseModalities: ["IMAGE", "TEXT"],
          ...(model.includes("image-generation")
            ? { imageConfig: { aspectRatio: aspectRatio as any } }
            : {}),
        },
      });

      if (!response.candidates?.length) {
        throw new Error("No candidates returned");
      }

      for (const part of response.candidates![0].content!.parts!) {
        if ((part as any).inlineData) return (part as any).inlineData.data;
        if ((part as any).text)
          throw new Error(
            `Model returned text instead of image: "${(part as any).text}"`
          );
      }
      throw new Error("No image data in response");
    } catch (err: any) {
      const msg = err?.message || String(err);
      const isRetryable =
        msg.includes("not found") ||
        msg.includes("404") ||
        msg.includes("permission") ||
        msg.includes("403") ||
        msg.includes("INVALID_ARGUMENT");
      if (!isRetryable || model === MODEL_CHAIN[MODEL_CHAIN.length - 1])
        throw err;
      console.warn(`[Gemini] Model ${model} failed, trying next: ${msg}`);
    }
  }
  throw new Error("All Gemini models failed");
}

// ─── PUBLIC API ──────────────────────────────────────────────────────────────

/**
 * Analyze a reference advertisement image and extract its visual style metadata.
 * Returns { name, category, keywords, prompt } for template creation.
 */
export async function analyzeAdStyle(
  base64Image: string,
  mimeType: string
): Promise<AdStyleAnalysis> {
  const ai = getClient();

  const analysisPrompt = `You are a professional advertising art director. Analyze this reference advertisement image and respond with ONLY a valid JSON object — no markdown, no code fences, no explanation.

The JSON must follow this exact structure:
{
  "name": "A short, creative 2-3 word template name that captures the visual style (e.g. 'Dark Citrus Drop', 'Golden Hour Flat', 'Clinical White Stack')",
  "category": "Exactly one of: Studio, Lifestyle, Room, Outdoor, Themed, Creative",
  "keywords": "6-10 comma-separated descriptive tags (e.g. dark background, citrus props, dramatic lighting, editorial, bold typography)",
  "prompt": "A single paragraph of 3-6 sentences describing the scene setup and composition, background style, lighting direction and quality, props and supporting elements, color palette and mood, and any text or typographic treatment. Written so an AI image model can recreate this exact style with a different product swapped in as the main subject."
}

Category guide:
- Studio: clean/controlled backgrounds, product-focused, minimal props
- Lifestyle: people or in-use contexts, active settings
- Room: interior spaces, desk, shelf, home environments
- Outdoor: natural environments, open air, nature
- Themed: seasonal, holiday, conceptual or narrative setups
- Creative: graphic design, illustration, infographic, typographic-heavy, or surreal compositions`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: analysisPrompt },
      ],
    },
    config: { responseModalities: ["TEXT"] },
  });

  const raw =
    response.candidates?.[0]?.content?.parts
      ?.filter((p: any) => p.text)
      ?.map((p: any) => p.text)
      ?.join("") || "";

  if (!raw) throw new Error("No analysis returned from Gemini");

  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      name: parsed.name || "",
      category: parsed.category || "Studio",
      keywords: parsed.keywords || "",
      prompt: parsed.prompt || "",
    };
  } catch {
    return { name: "", category: "Studio", keywords: "", prompt: cleaned };
  }
}

/**
 * Generate an ad image using Gemini.
 *
 * Two modes:
 * 1. Visual remix (referenceImageBase64 provided) — style transfer from reference + product
 * 2. Text prompt (no reference image) — uses template's promptTemplate
 *
 * Returns base64-encoded PNG image data (no data URI prefix).
 */
export async function generateAdImage(opts: {
  productBase64: string;
  productMimeType: string;
  template: TemplateInput;
  aspectRatio: AspectRatioValue;
  headline?: string;
  subheadline?: string;
  referenceImageBase64?: string;
  referenceImageMimeType?: string;
}): Promise<string> {
  const ai = getClient();
  const {
    productBase64,
    productMimeType,
    template,
    aspectRatio,
    headline,
    subheadline,
    referenceImageBase64,
    referenceImageMimeType,
  } = opts;

  const textOverlay =
    headline || subheadline
      ? ` Include this text overlay: ${headline ? `Headline: "${headline}"` : ""} ${subheadline ? `Subheadline: "${subheadline}"` : ""}. Integrate the text professionally using typography that matches the ad style.`
      : "";

  let parts: any[];

  if (referenceImageBase64 && referenceImageMimeType) {
    // Visual remix mode: reference ad + product → style transfer
    const remixPrompt = `You are remixing a professional advertisement.

IMAGE 1 (REFERENCE AD): A complete, polished advertisement showing a specific visual style, composition, layout, lighting, color palette, and mood.
IMAGE 2 (PRODUCT): The product that should become the main subject of the new advertisement.

Your task: Generate a new advertisement that:
- Faithfully replicates the visual style, layout, composition, and mood of the REFERENCE AD
- Seamlessly integrates the PRODUCT as the main subject, replacing whatever was featured in the reference
- Preserves the lighting direction, color treatment, background style, and typography placement from the reference
- Produces a result that looks like a professional ad from the same campaign as the reference${textOverlay}
- Final image aspect ratio: ${aspectRatio}

The result should look like a natural evolution of the reference ad style, just featuring the new product.`;

    parts = [
      {
        inlineData: {
          data: referenceImageBase64,
          mimeType: referenceImageMimeType,
        },
      },
      { inlineData: { data: productBase64, mimeType: productMimeType } },
      { text: remixPrompt },
    ];
  } else {
    // Text prompt mode: template prompt + product image
    const prompt = template.promptTemplate
      ? `${template.promptTemplate}${textOverlay} Aspect ratio: ${aspectRatio}. Take the uploaded product image and place it as the main subject. Make the integration seamless and professional.`
      : `Professional advertisement for the product in the uploaded image. Aspect ratio: ${aspectRatio}. Style: ${template.name} — ${template.description || ""}.${textOverlay}`;

    parts = [
      { inlineData: { data: productBase64, mimeType: productMimeType } },
      { text: prompt },
    ];
  }

  try {
    return await callGemini(ai, parts, aspectRatio);
  } catch (error: any) {
    const msg = error?.message || String(error);
    if (msg.includes("Requested entity was not found")) {
      throw new Error(
        "Gemini model not found. Ensure your API key has access to image generation models."
      );
    }
    if (msg.includes("safety")) {
      throw new Error(
        "Generation blocked by safety filters. Try a different image or template."
      );
    }
    if (msg.includes("quota")) {
      throw new Error(
        "Gemini API quota exceeded. Check your billing status or try again later."
      );
    }
    throw new Error(`Image generation failed: ${msg}`);
  }
}

// ─── TEMPLATE AUTO-MATCHING ──────────────────────────────────────────────────

/**
 * Map angle categories to template categories/styles for auto-matching.
 * Returns template IDs sorted by fit for a given hook category.
 */
export const CATEGORY_TEMPLATE_MAP: Record<string, string[]> = {
  "Problem-Aware": ["moody-hand-off", "dark-refreshment", "testimonial-comparison"],
  "Benefit-Led": ["sunlit-variety", "vibrant-fruit-burst", "desk-flow-state"],
  "Social Proof": ["testimonial-comparison", "moody-hand-off", "athletic-performance"],
  "Direct Offer": ["ingredient-infographic", "vibrant-fruit-burst", "dark-refreshment"],
  "Curiosity": ["desk-flow-state", "athletic-performance", "gym-and-gains"],
  "Comparison": ["ingredient-infographic", "testimonial-comparison", "sunlit-variety"],
};

/**
 * Pick the best template for a given angle category.
 * Falls back to first available if no match found.
 */
export function matchTemplateForCategory(
  category: string,
  availableTemplateIds: string[]
): string | undefined {
  const preferred = CATEGORY_TEMPLATE_MAP[category] || [];
  for (const id of preferred) {
    if (availableTemplateIds.includes(id)) return id;
  }
  return availableTemplateIds[0];
}
