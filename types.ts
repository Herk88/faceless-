
export interface VideoScript {
    hook: string;
    body: string;
    visualPrompt: string;
}

export interface CaptionWord {
    word: string;
    start: number;
    end: number;
}

export interface CaptionLine {
    line: string;
    words: CaptionWord[];
}

export interface GeneratedMedia {
    script: VideoScript;
    videoUrl: string;
    audioUrl: string;
    captions: CaptionLine[];
}

export type Filter = 'None' | 'Noir' | 'Vintage';

export interface BackgroundMusic {
    url: string;
    volume: number;
}

export type LoadingStep = 'idle' | 'script' | 'matchmaking' | 'visuals' | 'audio' | 'done';

export type ExportFormat = 'mp4' | 'webm';
export type ExportResolution = '540p' | '720p';

export interface ExportOptions {
    format: ExportFormat;
    resolution: ExportResolution;
}

export interface VideoTemplate {
    id: string;
    url: string;
    tags: string[];
    description: string;
}

export interface EngineState {
    isLoading: boolean;
    loadingStep: LoadingStep;
    error: string | null;
    generatedMedia: GeneratedMedia | null;
    isPlaying: boolean;
    activeFilter: Filter;
    isExporting: boolean;
    exportProgress: number;
    backgroundMusic: BackgroundMusic;
    exportOptions: ExportOptions;
}
