
import { useState } from 'react';
import type { 
    GeneratedMedia, Filter, EngineState, LoadingStep, ExportOptions, 
    VideoTemplate, AutomationFeatures, OrchestrationInstruction, TonePreset 
} from './types';

const WARZONE_ASSET_LIBRARY: VideoTemplate[] = [
    {
        id: 'clip_squadwipe_01',
        url: 'https://videos.pexels.com/video-files/2873335/2873335-sd_540_960_25fps.mp4',
        tags: ['squadwipe', 'warzone', 'highlight', 'movement'],
        description: 'Intense 1v3 squad wipe in Superstore.'
    },
    {
        id: 'clip_sniper_02',
        url: 'https://videos.pexels.com/video-files/2873341/2873341-sd_540_960_25fps.mp4',
        tags: ['sniper', 'longrange', 'warzone'],
        description: '500m Kar98k headshot out of a helicopter.'
    },
    {
        id: 'clip_clutch_03',
        url: 'https://videos.pexels.com/video-files/2873343/2873343-sd_540_960_25fps.mp4',
        tags: ['clutch', 'win', 'final-circle'],
        description: 'Gas mask play for the final kill win.'
    }
];

const matchGameplay = (prompt: string): VideoTemplate => {
    const promptWords = prompt.toLowerCase().split(/\s+/);
    for (const asset of WARZONE_ASSET_LIBRARY) {
        for (const tag of asset.tags) {
            if (promptWords.includes(tag)) return asset;
        }
    }
    return WARZONE_ASSET_LIBRARY[0];
};

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
            tonePreset: "aggressive"
        }
    });

    const setTonePreset = (tone: TonePreset) => {
        setState(prev => ({
            ...prev,
            projectSettings: { ...prev.projectSettings, tonePreset: tone }
        }));
    };

    const toggleFeature = (feature: keyof Omit<AutomationFeatures, 'tonePreset'>) => {
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
            // STEP 1: SCRIPTING
            setState(prev => ({ ...prev, loadingStep: 'script' }));
            await new Promise(r => setTimeout(r, 1000));
            
            const tone = state.projectSettings.tonePreset;
            const script = {
                hook: tone === "aggressive" ? "BRO, they literally thought they were safe!" : "Check out this insane rotation for the win.",
                body: tone === "aggressive" ? "Watch me delete this entire squad in 5 seconds. Lobby is chalked!" : "Perfect timing on the gas mask play. Clean wipe.",
                visualPrompt: "warzone superstore squad wipe high intensity"
            };

            // STEP 2: ASSET MATCHING
            setState(prev => ({ ...prev, loadingStep: 'matchmaking' }));
            await new Promise(r => setTimeout(r, 800));
            const selectedClip = matchGameplay(prompt);

            // STEP 3: ORCHESTRATION PLANNING
            setState(prev => ({ ...prev, loadingStep: 'visuals' }));
            await new Promise(r => setTimeout(r, 1200));

            const instruction: OrchestrationInstruction = {
                highlight: {
                    sourceFileId: selectedClip.id,
                    startTimeSeconds: 15.5,
                    endTimeSeconds: 28.2,
                    reason: `Identified high-intensity kill sequence. Squad wipe detected via killfeed OCR simulation.`
                },
                reframing: {
                    enabled: state.projectSettings.autoReframing,
                    strategy: "follow_crosshair",
                    cropKeyframes: [
                        { timeSeconds: 0, x: 0.3, y: 0.2, width: 0.4, height: 0.7 },
                        { timeSeconds: 5, x: 0.5, y: 0.2, width: 0.4, height: 0.7 }
                    ]
                },
                voiceover: {
                    enabled: state.projectSettings.hypeCommentary,
                    script: script.hook + " " + script.body,
                    startTimeSeconds: 0.5,
                    endTimeSeconds: 7.5,
                    tone: state.projectSettings.tonePreset
                },
                captions: [
                    { startTimeSeconds: 0.5, endTimeSeconds: 3.5, text: script.hook, highlightWords: ["SAFE", "BRO"] },
                    { startTimeSeconds: 3.8, endTimeSeconds: 7.5, text: script.body, highlightWords: ["DELETE", "LOBBY"] }
                ],
                memes: state.projectSettings.onScreenMemes ? [
                    { enabled: true, startTimeSeconds: 4.5, endTimeSeconds: 6.5, text: "FRIED 💀", positionHint: "center" },
                    { enabled: true, startTimeSeconds: 8.0, endTimeSeconds: 10.0, text: "SQUAD WIPE", positionHint: "top" }
                ] : [],
                tiktok: {
                    captionText: `${script.hook} 💀🔥 #warzone #cod #squadwipe #fps #gaming`,
                    primaryTags: ["#warzone", "#cod", "#gaming"],
                    secondaryTags: ["#squadwipe", "#clutch", "#pz"]
                }
            };

            // STEP 4: AUDIO SYNCING
            setState(prev => ({ ...prev, loadingStep: 'audio' }));
            await new Promise(r => setTimeout(r, 1000));

            const fullText = instruction.voiceover.script;
            const words = fullText.split(' ');
            
            const media: GeneratedMedia = {
                script,
                videoUrl: selectedClip.url,
                audioUrl: 'https://cdn.pixabay.com/audio/2022/02/22/audio_d146c1b222.mp3',
                captions: [{ 
                    line: fullText, 
                    words: words.map((w, i) => ({ word: w, start: i * 0.4, end: (i + 1) * 0.4 }))
                }],
                activeFeatures: { ...state.projectSettings },
                instruction
            };

            setState(prev => ({ ...prev, isLoading: false, generatedMedia: media, loadingStep: 'done' }));
        } catch (e: any) {
            setState(prev => ({ ...prev, isLoading: false, error: e.message, loadingStep: 'idle' }));
        }
    };

    return { 
        state, 
        generateContent, 
        toggleFeature, 
        setTonePreset,
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
};
