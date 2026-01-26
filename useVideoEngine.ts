
import { useState } from 'react';
import { generatePlan } from './orchestratorFactory';
import { executeOrchestration } from './FFmpegWorker';
import type { 
    GeneratedMedia, Filter, EngineState, LoadingStep, ExportOptions, 
    VideoTemplate, AutomationFeatures, OrchestrationInstruction, TonePreset, AIProvider 
} from './types';

const WARZONE_ASSET_LIBRARY: VideoTemplate[] = [
    {
        id: 'clip_superstore_squadwipe',
        url: 'https://videos.pexels.com/video-files/2873335/2873335-sd_540_960_25fps.mp4',
        tags: ['squadwipe', 'warzone', 'superstore'],
        description: 'Superstore squad wipe with SMG.'
    },
    {
        id: 'clip_kar98_snipe',
        url: 'https://videos.pexels.com/video-files/2873341/2873341-sd_540_960_25fps.mp4',
        tags: ['sniper', 'kar98', 'headshot'],
        description: 'Insane long-range sniper headshot.'
    }
];

export const useVideoEngine = () => {
    const [state, setState] = useState<EngineState>({
        isLoading: false,
        loadingStep: 'idle',
        error: null,
        generatedMedia: null,
        isPlaying: false,
        activeFilter: 'None',
        isExporting: false,
        exportProgress: 0,
        backgroundMusic: { url: '', volume: 0.2 },
        exportOptions: { format: 'mp4', resolution: '540p' },
        projectSettings: {
            hypeCommentary: true,
            onScreenMemes: true,
            autoReframing: true,
            tonePreset: "aggressive",
            provider: ((process as any).env?.ORCHESTRATOR_PROVIDER as AIProvider) || "gemini"
        }
    });

    const setTonePreset = (tone: TonePreset) => {
        setState(prev => ({
            ...prev,
            projectSettings: { ...prev.projectSettings, tonePreset: tone }
        }));
    };

    const setProvider = (provider: AIProvider) => {
        setState(prev => ({
            ...prev,
            projectSettings: { ...prev.projectSettings, provider }
        }));
    };

    const toggleFeature = (feature: keyof Omit<AutomationFeatures, 'tonePreset' | 'provider'>) => {
        setState(prev => ({
            ...prev,
            projectSettings: {
                ...prev.projectSettings,
                [feature]: !prev.projectSettings[feature]
            }
        }));
    };

    const generateContent = async (prompt: string) => {
        setState(prev => ({ ...prev, isLoading: true, loadingStep: 'idle', error: null, generatedMedia: null, isPlaying: false }));
        
        try {
            // STEP 1: ORCHESTRATION (THE BRAIN)
            setState(prev => ({ ...prev, loadingStep: 'script' }));
            const plan = await generatePlan(state.projectSettings.provider, prompt, state.projectSettings);

            // STEP 2: ASSET MATCHING
            setState(prev => ({ ...prev, loadingStep: 'matchmaking' }));
            await new Promise(r => setTimeout(r, 600));
            const selectedClip = WARZONE_ASSET_LIBRARY.find(v => v.tags.some(t => prompt.toLowerCase().includes(t))) || WARZONE_ASSET_LIBRARY[0];

            // STEP 3: WORKER EXECUTION (THE ENGINE)
            setState(prev => ({ ...prev, loadingStep: 'visuals' }));
            const execution = await executeOrchestration(plan, {
                inputPath: "local_warzone_raw.mp4",
                outputPath: "final_tiktok_shot.mp4",
                tempDir: "/tmp",
                enableVoiceover: state.projectSettings.hypeCommentary
            });
            plan.ffmpegCommand = execution.command;
            plan.execution = execution;

            // STEP 4: FINAL ASSEMBLY
            setState(prev => ({ ...prev, loadingStep: 'audio' }));
            await new Promise(r => setTimeout(r, 600));

            const media: GeneratedMedia = {
                script: { hook: plan.captions[0].text, body: plan.captions[1]?.text || "", visualPrompt: prompt },
                videoUrl: selectedClip.url,
                audioUrl: 'https://cdn.pixabay.com/audio/2022/02/22/audio_d146c1b222.mp3',
                captions: [{ 
                    line: plan.voiceover.script, 
                    words: plan.voiceover.script.split(' ').map((w, i) => ({ word: w, start: i * 0.4, end: (i + 1) * 0.4 }))
                }],
                activeFeatures: { ...state.projectSettings },
                instruction: plan
            };

            setState(prev => ({ ...prev, isLoading: false, generatedMedia: media, loadingStep: 'done' }));
        } catch (e: any) {
            setState(prev => ({ ...prev, isLoading: false, error: e.message || 'Pipeline Error', loadingStep: 'idle' }));
        }
    };

    const actions = {
        generateContent,
        toggleFeature,
        setTonePreset,
        setProvider,
        togglePlayPause: () => setState(prev => ({ ...prev, isPlaying: !prev.isPlaying })),
        applyFilter: (filter: Filter) => setState(prev => ({ ...prev, activeFilter: filter })),
        setExportOption: (opt: Partial<ExportOptions>) => setState(prev => ({ ...prev, exportOptions: { ...prev.exportOptions, ...opt } })),
        setBackgroundMusicUrl: (url: string) => setState(prev => ({ ...prev, backgroundMusic: { ...prev.backgroundMusic, url } })),
        setBackgroundMusicVolume: (v: number) => setState(prev => ({ ...prev, backgroundMusic: { ...prev.backgroundMusic, volume: v } })),
        exportVideo: () => setState(prev => ({ ...prev, isExporting: true, exportProgress: 0 })),
        handleExportProgress: (p: number) => setState(prev => ({ ...prev, exportProgress: p })),
        handleExportComplete: () => {
            setState(prev => ({ ...prev, isExporting: false, isPlaying: false, exportProgress: 1 }));
            setTimeout(() => setState(prev => ({ ...prev, exportProgress: 0 })), 1000);
        }
    };

    return { state, ...actions };
};
