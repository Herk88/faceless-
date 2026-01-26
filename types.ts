
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

export type TonePreset = "aggressive" | "chill" | "cracked-movement";

export interface OrchestrationInstruction {
  highlight: {
    sourceFileId: string;
    startTimeSeconds: number;
    endTimeSeconds: number;
    reason: string;
  };
  reframing: {
    enabled: boolean;
    strategy: "static_center" | "follow_crosshair";
    cropKeyframes: {
      timeSeconds: number;
      x: number;
      y: number;
      width: number;
      height: number;
    }[];
  };
  voiceover: {
    enabled: boolean;
    script: string;
    startTimeSeconds: number;
    endTimeSeconds: number;
    tone: string;
  };
  captions: {
    startTimeSeconds: number;
    endTimeSeconds: number;
    text: string;
    highlightWords: string[];
  }[];
  memes: {
    enabled: boolean;
    startTimeSeconds: number;
    endTimeSeconds: number;
    text: string;
    positionHint: "top" | "bottom" | "left" | "right" | "center";
  }[];
  tiktok: {
    captionText: string;
    primaryTags: string[];
    secondaryTags: string[];
  };
}

export interface GeneratedMedia {
    script: VideoScript;
    videoUrl: string;
    audioUrl: string;
    captions: CaptionLine[];
    activeFeatures: AutomationFeatures;
    instruction: OrchestrationInstruction;
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

export interface AutomationFeatures {
    hypeCommentary: boolean;
    onScreenMemes: boolean;
    autoReframing: boolean;
    tonePreset: TonePreset;
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
    projectSettings: AutomationFeatures;
}
