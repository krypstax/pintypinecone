
import { GoogleGenAI, Type } from "@google/genai";
import { AppSettings, ImagePrompt, ContentPack, VisualStyle } from "../types";

export const geminiService = {
  /**
   * LOCK PRODUCT IDENTITY: Analyze the user's input images to create a "Visual Contract" 
   * that ensures the AI doesn't modify the product's core identity.
   */
  async lockProductIdentity(images: string[], text: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imageParts = images.map(base64 => ({
      inlineData: {
        data: base64.split(',')[1],
        mimeType: "image/jpeg"
      }
    }));

    const prompt = `
      Perform a deep structural analysis of this product. 
      Identify its EXACT category, physical features, shape, and unique elements.
      
      CRITICAL: Focus on features that define what it is. 
      If it has a handle, it MUST be noted. If it's a mug, distinguish it from a bottle.
      Return a concise "Product Visual Contract" (max 100 words) that describes exactly what must remain unchanged.
      Product Description Context: "${text}"
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts: [...imageParts, { text: prompt }] },
      config: {
        systemInstruction: "You are a product verification specialist. Your goal is to identify the non-negotiable physical traits of a product to prevent identity drift during AI generation."
      }
    });

    return response.text || "Standard Product Identity";
  },

  async analyzeAndGeneratePrompts(
    images: string[],
    text: string,
    settings: AppSettings,
    productLock: string
  ): Promise<ImagePrompt[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const imageParts = images.map(base64 => ({
      inlineData: {
        data: base64.split(',')[1],
        mimeType: "image/jpeg"
      }
    }));

    const textOnImageRule = settings.visualStyle === VisualStyle.INFORMATIONAL 
      ? `Visual Style: 'Informational'. ALLOW text overlays. Requirements: Text must be minimal, informational labels only. No promotion.`
      : `Visual Style: '${settings.visualStyle}'. STRICT RULE: NO TEXT ON IMAGES. Communicate through visual storytelling only.`;

    const systemInstruction = `
      You are a high-precision Product Photographer and Pinterest Strategist. 
      
      PRODUCT VISUAL CONTRACT (MANDATORY):
      ${productLock}
      
      RULES:
      1. ABSOLUTE PRODUCT FIDELITY: The product in the prompts must match the Visual Contract perfectly. No generic substitutions.
      2. CONSISTENT FORM: If the product is a mug with a handle, it must NEVER be described as a flask or tumbler.
      3. ${textOnImageRule}
      4. Targeted at: ${settings.audienceFocus}.
    `;

    const prompt = `
      Generate 3 highly detailed image prompts for Pinterest posts.
      Layout Requirements: exactly ${settings.verticalImageCount} must be 9:16, others 1:1.
      Return as JSON array: [{ "prompt": string, "aspectRatio": "1:1" | "9:16", "layoutType": string }].
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts: [...imageParts, { text: prompt }] },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              prompt: { type: Type.STRING },
              aspectRatio: { type: Type.STRING },
              layoutType: { type: Type.STRING }
            },
            required: ["prompt", "aspectRatio", "layoutType"]
          }
        },
        ...(settings.webResearch ? { tools: [{ googleSearch: {} }] } : {})
      }
    });

    try {
      const data = JSON.parse(response.text || "[]");
      // Strict manual enforcement of layout count to fix the Vertical Pin Control bug
      const finalPrompts = data.slice(0, 3);
      finalPrompts.forEach((p: any, idx: number) => {
        p.aspectRatio = idx < settings.verticalImageCount ? "9:16" : "1:1";
      });
      return finalPrompts;
    } catch (e) {
      console.error("Failed to parse prompt JSON", e);
      return [];
    }
  },

  async generateImage(prompt: string, aspectRatio: "1:1" | "9:16"): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Photorealistic product replica, 100% fidelity to original design, professional lighting, exact category: ${prompt}` }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Image generation failed.");
  },

  /**
   * POST-GENERATION VERIFICATION: Compare the generated image against the original product lock.
   */
  async verifyFidelity(originalImages: string[], generatedImage: string, productLock: string): Promise<boolean> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const originalParts = originalImages.map(base64 => ({
      inlineData: { data: base64.split(',')[1], mimeType: "image/jpeg" }
    }));
    
    const generatedPart = {
      inlineData: { data: generatedImage.split(',')[1], mimeType: "image/png" }
    };

    const prompt = `
      COMPARE THE GENERATED IMAGE TO THE ORIGINAL PRODUCT.
      Visual Contract: ${productLock}
      
      CHECKLIST:
      1. Is it the SAME product type? (e.g., if original is a mug, is the new one also a mug?)
      2. Are critical features (like handles, lids, shapes) preserved exactly?
      3. Has the product been modified into a different category?
      
      Respond with exactly "PASS" if the product identity is preserved 100%, or "FAIL" followed by the reason.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts: [...originalParts, generatedPart, { text: prompt }] },
      config: {
        systemInstruction: "You are a product fidelity auditor. You reject any AI hallucination that modifies the user's product identity."
      }
    });

    const result = response.text?.trim().toUpperCase() || "FAIL";
    return result.startsWith("PASS");
  },

  async generateMetadata(prompt: string, productContext: string, settings: AppSettings): Promise<Partial<ContentPack>> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `
      Pinterest SEO Specialist. Generate metadata based on Pinterest discovery behavior.
      - NO HASHTAGS (#). Plain text phrases only.
      - SOURCE: Pinterest search trends.
      - VOLUME: 15-20 search terms.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Generate Pinterest metadata: {title, description, altText, keywords: string[]}. Context: ${productContext}. Image Prompt context: ${prompt}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            altText: { type: Type.STRING },
            keywords: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "description", "altText", "keywords"]
        }
      }
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      return {};
    }
  }
};
