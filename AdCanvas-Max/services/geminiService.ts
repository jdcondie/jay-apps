import { GoogleGenAI } from "@google/genai";
import { AdTemplate, AspectRatio } from "../types";

function getApiKey(): string {
  let apiKey = '';
  try {
    // 1. User-provided key from localStorage (primary source for public deploy)
    if (typeof window !== 'undefined') {
      try {
        apiKey = localStorage.getItem('ad_canvas_gemini_api_key') || '';
      } catch {}
    }
    // 2. AI Studio platform injection
    if (!apiKey && typeof window !== 'undefined' && (window as any).process?.env) {
      apiKey = (window as any).process.env.API_KEY || (window as any).process.env.GEMINI_API_KEY || '';
    }
    if (!apiKey && typeof process !== 'undefined' && process.env) {
      apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
    }
    // 3. Build-time Vite env (for self-hosted deploys)
    if (!apiKey) {
      // @ts-ignore
      apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || '';
    }
    if (!apiKey && typeof window !== 'undefined') {
      apiKey = (window as any).API_KEY || (window as any).GEMINI_API_KEY || '';
    }
  } catch (e) {
    console.warn('Could not access env:', e);
  }
  return apiKey;
}

async function callGemini(ai: GoogleGenAI, parts: any[], aspectRatio: AspectRatio): Promise<string> {
  const models = ['gemini-2.0-flash-preview-image-generation', 'gemini-2.5-flash-preview-05-20'];

  for (const model of models) {
    try {
      console.log(`Trying model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: { parts },
        config: {
          responseModalities: ['IMAGE', 'TEXT'],
          ...(model.includes('image-generation') ? {
            imageConfig: { aspectRatio: aspectRatio.value as any }
          } : {})
        }
      });

      if (!response.candidates?.length) {
        throw new Error('No candidates returned');
      }

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return part.inlineData.data;
        if (part.text) throw new Error(`Model returned text instead of image: "${part.text}"`);
      }
      throw new Error('No image data in response');
    } catch (err: any) {
      const msg = err?.message || String(err);
      const isRetryable = msg.includes('not found') || msg.includes('404') || msg.includes('permission') || msg.includes('403') || msg.includes('INVALID_ARGUMENT');
      if (!isRetryable || model === models[models.length - 1]) throw err;
      console.warn(`Model ${model} failed, trying next:`, msg);
    }
  }
  throw new Error('All models failed');
}

export interface AdStyleAnalysis {
  name: string;
  category: string;
  keywords: string;
  prompt: string;
}

export const analyzeAdStyle = async (
  imageDataUrl: string
): Promise<AdStyleAnalysis> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('No API key');

  const ai = new GoogleGenAI({ apiKey });

  const match = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error('Invalid image data');
  const [, mimeType, base64] = match;

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
    model: 'gemini-2.0-flash',
    contents: {
      parts: [
        { inlineData: { data: base64, mimeType } },
        { text: analysisPrompt },
      ],
    },
    config: { responseModalities: ['TEXT'] },
  });

  const raw = response.candidates?.[0]?.content?.parts
    ?.filter((p: any) => p.text)
    ?.map((p: any) => p.text)
    ?.join('') || '';

  if (!raw) throw new Error('No analysis returned');

  // Strip markdown code fences if model wraps anyway
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      name: parsed.name || '',
      category: parsed.category || 'Studio',
      keywords: parsed.keywords || '',
      prompt: parsed.prompt || '',
    };
  } catch {
    // If JSON parse fails, return the raw text as the prompt with empty metadata
    return { name: '', category: 'Studio', keywords: '', prompt: cleaned };
  }
};

export const generateAdImage = async (
  base64ProductImage: string,
  productMimeType: string,
  template: AdTemplate,
  aspectRatio: AspectRatio,
  headline?: string,
  subheadline?: string,
  referenceImageBase64?: string,
  referenceImageMimeType?: string
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key not found. Please connect your API key using the 'Connect Key' button.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const textOverlay = (headline || subheadline)
    ? ` Include this text overlay: ${headline ? `Headline: "${headline}"` : ''} ${subheadline ? `Subheadline: "${subheadline}"` : ''}. Integrate the text professionally using typography that matches the ad style.`
    : '';

  try {
    let parts: any[];

    if (referenceImageBase64 && referenceImageMimeType) {
      // ── Visual remix mode: two images → style transfer ──
      const remixPrompt = `You are remixing a professional advertisement.

IMAGE 1 (REFERENCE AD): A complete, polished advertisement showing a specific visual style, composition, layout, lighting, color palette, and mood.
IMAGE 2 (PRODUCT): The product that should become the main subject of the new advertisement.

Your task: Generate a new advertisement that:
- Faithfully replicates the visual style, layout, composition, and mood of the REFERENCE AD
- Seamlessly integrates the PRODUCT as the main subject, replacing whatever was featured in the reference
- Preserves the lighting direction, color treatment, background style, and typography placement from the reference
- Produces a result that looks like a professional ad from the same campaign as the reference${textOverlay}
- Final image aspect ratio: ${aspectRatio.value}

The result should look like a natural evolution of the reference ad style, just featuring the new product.`;

      parts = [
        { inlineData: { data: referenceImageBase64, mimeType: referenceImageMimeType } },
        { inlineData: { data: base64ProductImage, mimeType: productMimeType } },
        { text: remixPrompt },
      ];
    } else {
      // ── Text prompt mode: fallback for templates without reference images ──
      const prompt = template.promptTemplate
        ? `${template.promptTemplate}${textOverlay} Aspect ratio: ${aspectRatio.value}. Take the uploaded product image and place it as the main subject. Make the integration seamless and professional.`
        : `Professional advertisement for the product in the uploaded image. Aspect ratio: ${aspectRatio.value}. Style: ${template.name} — ${template.description}.${textOverlay}`;

      parts = [
        { inlineData: { data: base64ProductImage, mimeType: productMimeType } },
        { text: prompt },
      ];
    }

    return await callGemini(ai, parts, aspectRatio);

  } catch (error: any) {
    const msg = error?.message || String(error);
    if (msg.includes('Requested entity was not found')) {
      throw new Error("API model not found. Ensure your API key has access to Gemini image generation models.");
    }
    if (msg.includes('safety')) {
      throw new Error("Generation blocked by safety filters. Try a different image or template.");
    }
    if (msg.includes('quota')) {
      throw new Error("API quota exceeded. Check your billing status or try again later.");
    }
    throw new Error(`Generation failed: ${msg}`);
  }
};
