
/**
 * scripts/run-orchestration.ts
 * CLI tool to execute a video plan locally.
 * 
 * Usage:
 * ts-node scripts/run-orchestration.ts --input raw.mp4 --output final.mp4 --plan plan.json --provider openai
 */

import * as fs from 'fs';
import { executeOrchestration } from '../FFmpegWorker';
import { generatePlan } from '../orchestratorFactory';
import type { OrchestrationInstruction, AIProvider } from '../types';

async function run() {
    const args = (process as any).argv.slice(2);
    const getArg = (name: string) => args[args.indexOf(name) + 1];

    const inputPath = getArg('--input');
    const outputPath = getArg('--output');
    const planPath = getArg('--plan'); // Load existing JSON or generate new
    const providerArg = getArg('--provider') as AIProvider;
    const promptArg = getArg('--prompt');

    const provider = providerArg || (process as any).env.ORCHESTRATOR_PROVIDER || 'gemini';

    if (!inputPath || !outputPath) {
        console.error("Usage: --input <path> --output <path> [--plan <path>] [--prompt <text>] [--provider gemini|openai]");
        (process as any).exit(1);
    }

    try {
        let instruction: OrchestrationInstruction;

        if (planPath) {
            console.log(`[CLI] Loading plan from disk: ${planPath}`);
            instruction = JSON.parse(fs.readFileSync(planPath, 'utf8'));
        } else {
            console.log(`[CLI] Generating new plan via ${provider}...`);
            const prompt = promptArg || "crazy squad wipe at superstore";
            instruction = await generatePlan(provider as AIProvider, prompt, {
                hypeCommentary: true,
                onScreenMemes: true,
                autoReframing: true,
                tonePreset: "aggressive",
                provider: provider as AIProvider
            });
        }

        console.log("--- STARTING WORKER EXECUTION ---");
        const result = await executeOrchestration(instruction, {
            inputPath,
            outputPath,
            tempDir: './temp',
            enableVoiceover: true
        });

        console.log("\n--- LOGS ---");
        console.log(result.logs);
        
        if (result.exitCode === 0) {
            console.log(`\nSUCCESS: Clip rendered at ${outputPath}`);
        } else {
            console.error(`\nFAILED: Exit code ${result.exitCode}`);
        }
    } catch (err) {
        console.error("CLI Execution Error:", err);
    }
}

if (typeof (globalThis as any).require !== 'undefined' && ((globalThis as any).require as any).main === ((globalThis as any).module as any)) {
    run();
}
