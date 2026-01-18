
import { useState, useCallback } from 'react';
import type { GeneratedMedia, Filter, EngineState, LoadingStep, ExportOptions, VideoTemplate } from './types';

// STRATEGY 1: TEMPLATE & CACHE
// This represents our library of high-quality, pre-rendered AI backgrounds.
// In a real app, this would be a database queried via an API.
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

// This simulates a cheap Gemini call to match prompt keywords to our template library.
const findBestTemplate = (prompt: string): VideoTemplate | null => {
    const promptWords = prompt.toLowerCase().split(/\s+/);
    for (const template of VIDEO_TEMPLATE_LIBRARY) {
        for (const tag of template.tags) {
            if (promptWords.includes(tag)) {
                console.log(`[MediaOrchestrator] Cache Hit! Matched prompt to template: "${template.description}"`);
                return template;
            }
        }
    }
    console.log('[MediaOrchestrator] Cache Miss. No matching template found.');
    return null;
};


const withRetry = async <T,>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000,
    finalErr = 'Failed after multiple retries'
): Promise<T> => {
    let attempt = 0;
    while (attempt < retries) {
        try {
            console.log(`[MediaOrchestrator] Attempt #${attempt + 1}`);
            return await fn();
        } catch (error: any) {
            attempt++;
            if (error.isTransient && attempt < retries) {
                console.warn(`[MediaOrchestrator] Transient error: "${error.message}". Retrying in ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            } else {
                console.error(`[MediaOrchestrator] Final error:`, error);
                throw new Error(error.message || finalErr);
            }
        }
    }
    throw new Error(finalErr);
};

let mockFailCount = 0;
const mockMediaOrchestrator = {
    generateMedia: (prompt: string, setLoadingStep: (step: LoadingStep) => void): Promise<GeneratedMedia> => {
        return new Promise((resolve, reject) => {
            const process = async () => {
                try {
                    // --- STRATEGY 4: PROMPT CACHING ---
                    // In a real backend, this is where you'd use Gemini Context Caching.
                    // The system prompt ("You are a viral scriptwriter...") would be cached.
                    // We would only send the unique user prompt, saving 30-50% on tokens.
                    
                    // STRATEGY 2: MODEL ROUTING (Tier 1: Scripting)
                    // This simulates using a cheap, fast model like Gemini 2.5 Flash-Lite for scripting.
                    setLoadingStep('script');
                    await new Promise(res => setTimeout(res, 1000));
                    
                    if (mockFailCount < 1) {
                        mockFailCount++;
                        const transientError: any = new Error("Simulated API rate limit exceeded.");
                        transientError.isTransient = true;
                        throw transientError;
                    }

                    const script = {
                        hook: "In a world built for giants, one tiny robot had a very big problem.",
                        body: "He couldn't reach the power button. Every day was a struggle, until one day, he met a friend who gave him a lift. Together, they could conquer anything.",
                        visualPrompt: "A tiny, cute robot struggling to climb a giant power button, cinematic, 4k"
                    };
                    
                    // STRATEGY 2: MODEL ROUTING (Tier 2: Logic/Reasoning)
                    // This simulates using a model like Gemini 3 Flash for logic and matching.
                    setLoadingStep('matchmaking');
                    await new Promise(res => setTimeout(res, 1000));
                    const cachedVideo = findBestTemplate(prompt);

                    let videoUrl: string;

                    if (cachedVideo) {
                        // Cache HIT: Use the pre-rendered video. Skip the expensive step.
                        videoUrl = cachedVideo.url;
                    } else {
                        // Cache MISS: Fallback to expensive generation.
                        // STRATEGY 2: MODEL ROUTING (Tier 3: Video)
                        // This simulates using an expensive model like Veo 3.1.
                        setLoadingStep('visuals');

                        // --- STRATEGY 3: BATCH API PROCESSING ---
                        // If we offered a "Generate in 10 mins" option, this is where we would
                        // send the request to a Batch API Queue for a ~50% discount.
                        // For this real-time flow, we proceed immediately.
                        await new Promise(res => setTimeout(res, 1500));
                        videoUrl = 'https://videos.pexels.com/video-files/3254009/3254009-sd_540_960_25fps.mp4'; // A generic fallback
                    }

                    setLoadingStep('audio');
                    await new Promise(res => setTimeout(res, 1000));
                    
                    mockFailCount = 0;
                    console.log(`[MediaOrchestrator] Successfully generated media for prompt: "${prompt}"`);
                    
                    const fullText = `${script.hook} ${script.body}`;
                    const words = fullText.split(' ');
                    let currentTime = 0;
                    const captionWords = words.map(word => {
                        const duration = Math.random() * 0.3 + 0.2;
                        const start = currentTime;
                        const end = start + duration;
                        currentTime = end + 0.05;
                        return { word, start, end };
                    });

                    setLoadingStep('done');
                    resolve({
                        script,
                        videoUrl, // Use the cached or newly generated URL
                        audioUrl: 'https://cdn.pixabay.com/audio/2022/02/22/audio_d146c1b222.mp3',
                        captions: [{ line: fullText, words: captionWords }]
                    });
                } catch (error) {
                    reject(error);
                }
            };
            process();
        });
    }
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
    });
    
    const setLoadingStep = (step: LoadingStep) => {
        setState(prev => ({...prev, loadingStep: step}));
    };

    const generateContent = async (prompt: string) => {
        setState(prev => ({ ...prev, isLoading: true, loadingStep: 'idle', error: null, generatedMedia: null, isPlaying: false }));
        try {
            const media = await withRetry(() => mockMediaOrchestrator.generateMedia(prompt, setLoadingStep));
            setState(prev => ({ ...prev, isLoading: false, generatedMedia: media }));
        } catch (e) {
            const error = e instanceof Error ? e.message : 'An unknown error occurred';
            setState(prev => ({ ...prev, isLoading: false, error, loadingStep: 'idle' }));
        }
    };
    
    const togglePlayPause = () => {
        if (!state.generatedMedia || state.isExporting) return;
        setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    };

    const applyFilter = (filter: Filter) => {
        setState(prev => ({ ...prev, activeFilter: filter }));
    };
    
    const setBackgroundMusicUrl = (url: string) => {
        setState(prev => ({ ...prev, backgroundMusic: { ...prev.backgroundMusic, url } }));
    };

    const setBackgroundMusicVolume = (volume: number) => {
        setState(prev => ({ ...prev, backgroundMusic: { ...prev.backgroundMusic, volume } }));
    };

    const setExportOption = (option: Partial<ExportOptions>) => {
        setState(prev => ({
            ...prev,
            exportOptions: {
                ...prev.exportOptions,
                ...option,
            },
        }));
    };

    const exportVideo = useCallback(() => {
        if (!state.generatedMedia || state.isExporting) return;
        setState(prev => ({ ...prev, isExporting: true, exportProgress: 0 }));
    }, [state.generatedMedia, state.isExporting]);

    const handleExportProgress = (progress: number) => {
        setState(prev => ({ ...prev, exportProgress: progress }));
    };


    const handleExportComplete = () => {
        setState(prev => ({ ...prev, isExporting: false, isPlaying: false, exportProgress: 1 }));
        setTimeout(() => setState(prev => ({...prev, exportProgress: 0})), 1000);
    };

    return { 
        state, 
        generateContent, 
        togglePlayPause, 
        applyFilter, 
        exportVideo,
        setBackgroundMusicUrl,
        setBackgroundMusicVolume,
        setExportOption,
        handleExportProgress,
        handleExportComplete
    };
};
