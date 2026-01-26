
import { generateOrchestrationPlan as geminiPlan } from './GeminiOrchestrator';
import { generateOrchestrationPlanOpenAI as openaiPlan } from './OpenAIOrchestrator';
import type { OrchestrationInstruction, AutomationFeatures, AIProvider } from './types';

/**
 * orchestratorFactory.ts
 * Central point for generating video plans regardless of the AI provider.
 */
export async function generatePlan(
  provider: AIProvider,
  prompt: string,
  settings: AutomationFeatures
): Promise<OrchestrationInstruction> {
  console.log(`[Factory] Routing request to: ${provider.toUpperCase()}`);
  
  let plan: OrchestrationInstruction;
  
  if (provider === 'openai') {
    plan = await openaiPlan(prompt, settings);
  } else {
    // Default to Gemini
    plan = await geminiPlan(prompt, settings);
  }

  // Inject provider info for tracking
  return {
    ...plan,
    provider
  };
}
