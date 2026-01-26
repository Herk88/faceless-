
import { useState, useCallback } from 'react';
import type { GeneratedMedia, Filter, EngineState, LoadingStep, ExportOptions, VideoTemplate, AutomationFeatures } from './types';

const VIDEO_TEMPLATE_LIBRARY: VideoTemplate[] = [
    {
        id: 'vt_001',
        url: 'https://videos.pexels.com/video-files/853878/853878-sd_540_960_30fps.mp4',
        tags: ['space', 'galaxy', 'stars', 'cosmic', 'nebula'],
        description: 'A mesmerizing flight through a colorful cosmic nebula.'
    },
    {
        id: 'vt_002',
        url: 'https://videos.pexels.com/video-files/2099392/2099392-sd_540_960_25fps.mp4',
        tags: ['rome', 'ancient', 'history', 'colosseum', 'empire'],
        description: 'Cinematic shot of the Roman Colosseum at sunset.'
    },
    {
        id: 'vt_003',
        url: 'https://videos.pexels.com/video-files/8327918/8327918-sd_540_960_25fps.mp4',
        tags: ['robot', 'lonely', 'sad', 'cute', 'tech'],
        description: 'A small, cute robot looking out a window on a rainy day.'
    }
];

const findBestTemplate = (prompt: string): VideoTemplate | null => {
    const promptWords = prompt.toLowerCase().split(/\s+/);
    for (const template of VIDEO_TEMPLATE_LIBRARY) {
        for (const tag of template.tags) {
            if (promptWords.includes(tag)) return template;
        }
    }
    return null;
};

const withRetry = async <T,>(fn: () => Promise<T>, retries = 3): Promise<T> => {
    let attempt = 0;
    while (attempt < retries) {
        try { return await fn(); } catch (error: any) {
            attempt++;
            if (!error.isTransient || attempt >= retries) throw error;
            await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempt)));
        }
    }
    throw new Error('Retries exhausted');
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
            onScreenMemes: false,
            autoReframing: true,
        }
    });

    const toggleFeature = (feature: keyof AutomationFeatures) => {
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
            const media = await withRetry(async () => {
                setState(prev => ({ ...prev, loadingStep: 'script' }));
                await new Promise(r => setTimeout(r, 800));

                const isHype = state.projectSettings.hypeCommentary;
                const script = {
                    hook: isHype ? "YO! You won't believe what this tiny robot did!" : "In a world of giants, a small robot struggled.",
                    body: isHype ? "He literally conquered the impossible. A total legend!" : "He found a way to reach the summit with a friend.",
                    visualPrompt: "cinematic robot"
                };

                setState(prev => ({ ...prev, loadingStep: 'matchmaking' }));
                await new Promise(r => setTimeout(r, 600));
                const template = findBestTemplate(prompt);

                if (!template) {
                    setState(prev => ({ ...prev, loadingStep: 'visuals' }));
                    await new Promise(r => setTimeout(r, 1200));
                }

                setState(prev => ({ ...prev, loadingStep: 'audio' }));
                await new Promise(r => setTimeout(r, 1000));

                const fullText = `${script.hook} ${script.body}`;
                return {
                    script,
                    videoUrl: template?.url || 'https://videos.pexels.com/video-files/3254009/3254009-sd_540_960_25fps.mp4',
                    audioUrl: 'https://cdn.pixabay.com/audio/2022/02/22/audio_d146c1b222.mp3',
                    captions: [{ 
                        line: fullText, 
                        words: fullText.split(' ').map((w, i) => ({ word: w, start: i * 0.4, end: (i + 1) * 0.4 }))
                    }],
                    activeFeatures: { ...state.projectSettings }
                } as GeneratedMedia;
            });

            setState(prev => ({ ...prev, isLoading: false, generatedMedia: media, loadingStep: 'done' }));
        } catch (e: any) {
            setState(prev => ({ ...prev, isLoading: false, error: e.message, loadingStep: 'idle' }));
        }
    };

    const actions = {
        generateContent,
        toggleFeature,
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
