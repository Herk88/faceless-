
/**
 * VoiceoverService.ts
 * Logic for generating TTS audio files using OpenAI API.
 */

export interface VoiceoverOptions {
    outputPath: string;
    voice?: string;
    speed?: number;
}

export async function generateVoiceoverScriptAudio(
    script: string,
    options: VoiceoverOptions
): Promise<void> {
    // Priority: environment variable
    const apiKey = (process as any).env.OPENAI_API_KEY;
    
    if (!apiKey) {
        console.warn("[TTS] No OPENAI_API_KEY found. Falling back to mock buffer.");
        return new Promise((resolve) => setTimeout(resolve, 800));
    }

    console.log(`[TTS] Executing OpenAI Request [Model: gpt-4o-mini-tts]`);

    try {
        const response = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini-tts", 
                input: script,
                voice: options.voice || "coral", // Requested default voice
                response_format: "wav"
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`OpenAI TTS Failure: ${error.error?.message || response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        
        // Environment detection for storage
        if (typeof window === 'undefined') {
            const fs = (globalThis as any).require('fs');
            if (fs) {
                const buffer = (globalThis as any).Buffer.from(arrayBuffer);
                await fs.promises.writeFile(options.outputPath, buffer);
                console.log(`[TTS] Audio payload written to ${options.outputPath}`);
            }
        } else {
            console.log("[TTS] Audio buffer received in browser. Local I/O suppressed.");
        }
    } catch (err) {
        console.error("[TTS] Critical error during audio generation:", err);
        throw err;
    }
}
