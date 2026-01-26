


/**
 * scripts/run-orchestration.ts
 * CLI tool to execute a video plan locally.
 * 
 * Usage:
 * ts-node scripts/run-orchestration.ts --input raw.mp4 --output final.mp4 --plan plan.json
 */

import * as fs from 'fs';
import { executeOrchestration } from '../FFmpegWorker';
import type { OrchestrationInstruction } from '../types';

async function run() {
    // Fix: Cast process to any to access argv and exit in environment without node types
    const args = (process as any).argv.slice(2);
    const getArg = (name: string) => args[args.indexOf(name) + 1];

    const inputPath = getArg('--input');
    const outputPath = getArg('--output');
    const planPath = getArg('--plan');

    if (!inputPath || !outputPath || !planPath) {
        console.error("Missing arguments. Usage: --input <path> --output <path> --plan <path>");
        (process as any).exit(1);
    }

    try {
        const planRaw = fs.readFileSync(planPath, 'utf8');
        const instruction: OrchestrationInstruction = JSON.parse(planRaw);

        console.log("--- STARTING ORCHESTRATION ---");
        const result = await executeOrchestration(instruction, {
            inputPath,
            outputPath,
            tempDir: './temp',
            enableVoiceover: true
        });

        console.log("\n--- EXECUTION LOGS ---");
        console.log(result.logs);
        
        if (result.exitCode === 0) {
            console.log(`\nSUCCESS: Video rendered to ${outputPath}`);
        } else {
            console.error(`\nFAILED: Exit code ${result.exitCode}`);
        }
    } catch (err) {
        console.error("Execution error:", err);
    }
}

// Only run if called directly
// Fix: Use typeof checks and any-casting to safely check if script is being run directly in Node
if (typeof require !== 'undefined' && (require as any).main === (module as any)) {
    run();
}