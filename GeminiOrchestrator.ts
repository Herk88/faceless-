
import { GoogleGenAI, Type } from "@google/genai";
import type { OrchestrationInstruction, TonePreset, AutomationFeatures } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const ORCHESTRATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    highlight: {
      type: Type.OBJECT,
      properties: {
        sourceFileId: { type: Type.STRING },
        startTimeSeconds: { type: Type.NUMBER },
        endTimeSeconds: { type: Type.NUMBER },
        reason: { type: Type.STRING }
      },
      required: ["sourceFileId", "startTimeSeconds", "endTimeSeconds", "reason"]
    },
    reframing: {
      type: Type.OBJECT,
      properties: {
        enabled: { type: Type.BOOLEAN },
        strategy: { type: Type.STRING },
        cropKeyframes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              timeSeconds: { type: Type.NUMBER },
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER },
              width: { type: Type.NUMBER },
              height: { type: Type.NUMBER }
            }
          }
        }
      }
    },
    voiceover: {
      type: Type.OBJECT,
      properties: {
        enabled: { type: Type.BOOLEAN },
        script: { type: Type.STRING },
        startTimeSeconds: { type: Type.NUMBER },
        endTimeSeconds: { type: Type.NUMBER },
        tone: { type: Type.STRING },
        voice: { type: Type.STRING }
      }
    },
    captions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          startTimeSeconds: { type: Type.NUMBER },
          endTimeSeconds: { type: Type.NUMBER },
          text: { type: Type.STRING },
          highlightWords: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    },
    memes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          enabled: { type: Type.BOOLEAN },
          startTimeSeconds: { type: Type.NUMBER },
          endTimeSeconds: { type: Type.NUMBER },
          text: { type: Type.STRING },
          positionHint: { type: Type.STRING }
        }
      }
    },
    tiktok: {
      type: Type.OBJECT,
      properties: {
        captionText: { type: Type.STRING },
        primaryTags: { type: Type.ARRAY, items: { type: Type.STRING } },
        secondaryTags: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    }
  },
  required: ["highlight", "reframing", "voiceover", "captions", "memes", "tiktok"]
};

export const generateOrchestrationPlan = async (
  prompt: string, 
  settings: AutomationFeatures
): Promise<OrchestrationInstruction> => {
  const systemInstruction = `
    You are a Warzone TikTok Shorts Automation Orchestrator. 
    Your job is to plan a high-intensity, viral TikTok clip from a horizontal Warzone recording.
    
    RULES:
    - Clip length: 8-21 seconds.
    - Focus on: squad wipes, movement tech, or high-skill snipes.
    - Hype Commentary: Use Warzone slang like "fried", "deleted", "chalked".
    - Reframing: Specify 9:16 crop coordinates (1080x1920 logical space).
    - Captions: Short, punchy blocks.
    - Memes: Maximum 3-5 overlays like "FRIED 💀" or "CLEAN".
    
    TONE: ${settings.tonePreset}
    FEATURES: Hype=${settings.hypeCommentary}, Memes=${settings.onScreenMemes}, Reframing=${settings.autoReframing}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `User goal: ${prompt}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: ORCHESTRATION_SCHEMA as any
    }
  });

  return JSON.parse(response.text || "{}");
};
