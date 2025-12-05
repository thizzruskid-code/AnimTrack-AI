import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AIAnalysisResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the schema for structured output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    project: { type: Type.STRING, description: "The name of the cartoon, show, or project (e.g., 'SpongeBob', 'Project Alpha')." },
    episode: { type: Type.STRING, description: "The episode number or code (e.g., '101', 'Ep 4', 'Pilot')." },
    sceneId: { type: Type.STRING, description: "Inferred scene number or ID (e.g., 'SC-01')." },
    shotId: { type: Type.STRING, description: "Inferred shot number (e.g., 'SH-05')." },
    prompt: { type: Type.STRING, description: "A refined, descriptive stable diffusion/midjourney style prompt based on the input." },
    sceneDescription: { type: Type.STRING, description: "A concise description of the visual scene, lighting, and mood." },
    lipSyncNotes: { type: Type.STRING, description: "Notes on mouth shapes, emotions, or potential dialogue timing based on the image expression or text." },
    videoUrl: { type: Type.STRING, description: "URL to the rendered video output (e.g. from Comfy UI) if present in the text." },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of relevant tags for categorization (e.g., 'indoor', 'close-up', 'angry')."
    }
  },
  required: ["sceneDescription", "prompt", "tags"],
};

export const analyzeAsset = async (
  rawText: string,
  imageBase64?: string,
  context?: { project?: string; episode?: string; sceneId?: string; shotId?: string }
): Promise<AIAnalysisResult> => {
  try {
    const parts: any[] = [];

    // Add image if available
    if (imageBase64) {
      // Remove data URL prefix if present for API consumption
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      parts.push({
        inlineData: {
          mimeType: "image/jpeg", // Assuming JPEG/PNG, API handles generic types well
          data: base64Data
        }
      });
    }

    // Add text prompt
    const systemPrompt = `
      You are an expert Animation Production Assistant. 
      Your goal is to organize unstructured input into a production tracking spreadsheet format.
      
      Context provided by user:
      Project Name: ${context?.project || "Unknown (try to infer)"}
      Episode: ${context?.episode || "Unknown (try to infer)"}
      Scene ID: ${context?.sceneId || "Unknown (try to infer)"}
      Shot ID: ${context?.shotId || "Unknown (try to infer)"}

      Analyze the provided image (if any) and the raw text notes.
      Extract or infer:
      1. Project Name & Episode (if mentioned in text and not provided in context).
      2. Scene & Shot IDs (sequence logic). If user provided specific IDs in context, USE THEM.
      3. A clean, usable image generation prompt.
      4. A clear Scene Description (Lighting, Composition, Action).
      5. Lip Sync Information (Visemes, Emotion, Dialogue cues).
      6. Comfy UI Video URL (if a link is present in the text).
      7. Searchable Tags.

      If specific IDs aren't found, suggest logical next ones or keep generic.
      User Input Notes: "${rawText}"
    `;
    
    parts.push({ text: systemPrompt });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are a helpful AI assistant for animation pipelines."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};
