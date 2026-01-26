
import type { OrchestrationInstruction, AutomationFeatures } from "./types";

/**
 * OpenAIOrchestrator.ts
 * Uses gpt-4o-mini to plan Warzone TikTok content.
 */

export const generateOrchestrationPlanOpenAI = async (
  prompt: string, 
  settings: AutomationFeatures
): Promise<OrchestrationInstruction> => {
  const apiKey = (process as any).env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is required for this provider.");
  }

  const systemInstruction = `
    You are a Professional Warzone Content Editor. 
    Generate a JSON plan for a viral TikTok clip.
    
    CRITICAL SCHEMA REQUIREMENTS:
    {
      "highlight": { "sourceFileId": "string", "startTimeSeconds": number, "endTimeSeconds": number, "reason": "string" },
      "reframing": { "enabled": boolean, "strategy": "static_center" },
      "voiceover": { "enabled": boolean, "script": "string", "startTimeSeconds": number, "endTimeSeconds": number, "tone": "string", "voice": "string" },
      "captions": [ { "startTimeSeconds": number, "endTimeSeconds": number, "text": "string", "highlightWords": ["string"] } ],
      "memes": [ { "enabled": boolean, "startTimeSeconds": number, "endTimeSeconds": number, "text": "string", "positionHint": "top|center|bottom" } ],
      "tiktok": { "captionText": "string", "primaryTags": ["string"], "secondaryTags": ["string"] }
    }

    VIBE: ${settings.tonePreset}
    CONTEXT: Use Warzone terminology (cracked, beamed, absolute, rotation).
  `;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // Cost-efficient planning model
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: `Target: ${prompt}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(`OpenAI Planning Error: ${errorBody.error?.message || response.statusText}`);
  }

  const result = await response.json();
  const plan = JSON.parse(result.choices[0].message.content);
  
  return plan as OrchestrationInstruction;
};
