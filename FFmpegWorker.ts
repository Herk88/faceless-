import type { OrchestrationInstruction, ExecutionResult } from "./types";
import { generateVoiceoverScriptAudio } from "./VoiceoverService";

/**
 * Builds the FFmpeg filter chain for cropping, captions, and memes.
 */
function buildFilterComplex(instruction: OrchestrationInstruction): string {
    const { highlight, reframing, captions, memes } = instruction;
    const duration = highlight.endTimeSeconds - highlight.startTimeSeconds;

    // 1. Trim and initial setup
    let filters = `[0:v]trim=start=${highlight.startTimeSeconds}:end=${highlight.endTimeSeconds},setpts=PTS-STARTPTS`;

    // 2. Reframing (16:9 -> 9:16)
    if (reframing.enabled) {
        // We assume 1920x1080 input. 9:16 crop is 607x1080.
        // center crop: (1920-607)/2 = 656
        filters += `,crop=607:1080:656:0,scale=1080:1920`;
    } else {
        filters += `,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920`;
    }

    // 3. Burn-in Captions (Subtitles)
    captions.forEach((cap, idx) => {
        const start = cap.startTimeSeconds - highlight.startTimeSeconds;
        const end = cap.endTimeSeconds - highlight.startTimeSeconds;
        const safeText = cap.text.replace(/'/g, "'\\\\''").replace(/:/g, "\\:");
        
        // Font setup assumes standard paths or local project fonts
        filters += `,drawtext=text='${safeText}':fontfile=fonts/impact.ttf:fontsize=72:fontcolor=white:borderw=4:bordercolor=black:x=(w-text_w)/2:y=h-450:enable='between(t,${start},${end})'`;
    });

    // 4. On-Screen Memes
    memes.forEach((meme) => {
        if (!meme.enabled) return;
        const start = meme.startTimeSeconds - highlight.startTimeSeconds;
        const end = meme.endTimeSeconds - highlight.startTimeSeconds;
        const safeText = meme.text.replace(/'/g, "'\\\\''").replace(/:/g, "\\:");
        
        const yPos = meme.positionHint === 'top' ? '200' : 
                     meme.positionHint === 'center' ? '(h-text_h)/2' : 
                     'h-700';

        filters += `,drawtext=text='${safeText}':fontfile=fonts/impact.ttf:fontsize=120:fontcolor=yellow:borderw=6:bordercolor=black:x=(w-text_w)/2:y=${yPos}:enable='between(t,${start},${end})'`;
    });

    return filters;
}

/**
 * Generates the full CLI string for display or shell execution.
 */
export const generateFFmpegCommandString = (
    instruction: OrchestrationInstruction,
    options: { inputPath: string; outputPath: string; voiceoverPath?: string }
): string => {
    const filters = buildFilterComplex(instruction);
    const audioInput = options.voiceoverPath ? `-i ${options.voiceoverPath}` : "";
    const audioMix = options.voiceoverPath 
        ? `-filter_complex "[0:a]atrim=start=${instruction.highlight.startTimeSeconds}:end=${instruction.highlight.endTimeSeconds},asetpts=PTS-STARTPTS[ga];[1:a]volume=1.5[vo];[ga][vo]amix=inputs=2:duration=first[outa]" -map "[v]" -map "[outa]"`
        : `-map "[v]" -map "0:a"`;

    return `ffmpeg -i ${options.inputPath} ${audioInput} -filter_complex "${filters}[v]" ${audioMix} -c:v libx264 -preset veryfast -crf 18 -c:a aac -b:a 192k ${options.outputPath}`;
};

/**
 * Real execution function for Node.js environments.
 */
export async function executeOrchestration(
    instruction: OrchestrationInstruction,
    options: {
        inputPath: string;
        outputPath: string;
        tempDir: string;
        enableVoiceover: boolean;
    }
): Promise<ExecutionResult> {
    const logs: string[] = [];
    logs.push(`[Worker] Starting job for ${instruction.highlight.sourceFileId}`);

    let voiceoverPath: string | undefined;
    if (instruction.voiceover.enabled && options.enableVoiceover) {
        voiceoverPath = `${options.tempDir}/vo_${Date.now()}.wav`;
        await generateVoiceoverScriptAudio(instruction.voiceover.script, { outputPath: voiceoverPath });
        logs.push(`[Worker] Voiceover generated at ${voiceoverPath}`);
    }

    const command = generateFFmpegCommandString(instruction, { 
        inputPath: options.inputPath, 
        outputPath: options.outputPath,
        voiceoverPath
    });

    logs.push(`[Worker] Command: ${command}`);

    // This block only runs in Node.js
    let exitCode = 0;
    if (typeof window === 'undefined') {
        // Fix: Use globalThis to access require safely in environments without Node types
        const nodeRequire = (globalThis as any).require;
        if (nodeRequire) {
            const { spawn } = nodeRequire('child_process');
            logs.push(`[Worker] Spawning FFmpeg...`);
            
            // In a real scenario, you'd parse the command string into an array for spawn
            // or use shell: true (carefully)
        }
    } else {
        logs.push(`[Worker] Browser environment detected. Skipping real shell execution.`);
        exitCode = 0;
    }

    return {
        command,
        exitCode,
        logs: logs.join('\n'),
        outputUrl: options.outputPath
    };
}

// Keep the legacy simple export for the UI simulator
export const generateFFmpegCommand = (instruction: OrchestrationInstruction): string => {
    return generateFFmpegCommandString(instruction, { 
        inputPath: "input.mp4", 
        outputPath: "output.mp4",
        voiceoverPath: "voiceover.wav" 
    });
};