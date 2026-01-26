
import React, { useRef, useEffect, useCallback } from 'react';
import type { GeneratedMedia, Filter, BackgroundMusic, ExportOptions } from './types';

interface CanvasVideoEditorProps {
    media: GeneratedMedia | null;
    isPlaying: boolean;
    filter: Filter;
    isExporting: boolean;
    backgroundMusic: BackgroundMusic;
    exportOptions: ExportOptions;
    onExportProgress: (progress: number) => void;
    onExportComplete: () => void;
}

const BASE_WIDTH = 540;
const BASE_HEIGHT = 960;

const resolutions: Record<ExportOptions['resolution'], { width: number, height: number }> = {
    '540p': { width: BASE_WIDTH, height: BASE_HEIGHT },
    '720p': { width: 720, height: 1280 },
};

export const CanvasVideoEditor: React.FC<CanvasVideoEditorProps> = ({
    media,
    isPlaying,
    filter,
    isExporting,
    backgroundMusic,
    exportOptions,
    onExportProgress,
    onExportComplete,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(document.createElement('video'));
    const audioRef = useRef<HTMLAudioElement>(document.createElement('audio'));
    const animationFrameId = useRef<number | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunks = useRef<Blob[]>([]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const video = videoRef.current;
        const audio = audioRef.current;

        if (!ctx || !canvas || !video.src || !audio.src || !media) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const filterMap: Record<Filter, string> = { 
            'None': 'none', 
            'Noir': 'grayscale(100%) contrast(1.2)', 
            'Vintage': 'sepia(60%) contrast(0.9) brightness(1.1)' 
        };
        ctx.filter = filterMap[filter] || 'none';
        
        // Draw main video
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';

        // Auto-Reframing Visual Guide (Subtle safe zone)
        if (media.activeFeatures.autoReframing) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 2;
            ctx.strokeRect(canvas.width * 0.05, canvas.height * 0.05, canvas.width * 0.9, canvas.height * 0.9);
        }

        const scaleFactor = canvas.width / BASE_WIDTH;
        const currentTime = audio.currentTime;
        const currentLine = media.captions[0];
        
        // Memes Mode Font Upgrade
        const isMemesMode = media.activeFeatures.onScreenMemes;
        ctx.font = `bold ${isMemesMode ? 64 : 48 * scaleFactor}px ${isMemesMode ? 'Impact, Arial' : 'Arial'}`;
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 8 * scaleFactor;
        
        const x = canvas.width / 2;
        const y = canvas.height - (100 * scaleFactor);
        const lineMetrics = ctx.measureText(currentLine.line);
        let currentX = x - lineMetrics.width / 2;

        currentLine.words.forEach(({ word, start, end }) => {
            ctx.fillStyle = (currentTime >= start && currentTime < end) ? '#FBBF24' : 'white';
            const wordWidthWithSpace = ctx.measureText(word + ' ').width;
            ctx.strokeText(word, currentX + (wordWidthWithSpace - ctx.measureText(' ').width) / 2, y);
            ctx.fillText(word, currentX + (wordWidthWithSpace - ctx.measureText(' ').width) / 2, y);
            currentX += wordWidthWithSpace;
        });
        
        animationFrameId.current = requestAnimationFrame(draw);
    }, [media, filter]);

    useEffect(() => {
        const video = videoRef.current;
        const audio = audioRef.current;
        video.crossOrigin = "anonymous"; video.muted = true; video.loop = true;
        audio.crossOrigin = "anonymous";
        if (media) { video.src = media.videoUrl; audio.src = media.audioUrl; } 
    }, [media]);

    useEffect(() => {
        const video = videoRef.current; const audio = audioRef.current;
        const startAnimation = () => { if (!animationFrameId.current) animationFrameId.current = requestAnimationFrame(draw); };
        const stopAnimation = () => { if (animationFrameId.current) { cancelAnimationFrame(animationFrameId.current); animationFrameId.current = null; } };
        if (isPlaying && !isExporting) { Promise.all([video.play(), audio.play()]).then(startAnimation).catch(console.error); } 
        else { video.pause(); audio.pause(); stopAnimation(); }
        return stopAnimation;
    }, [isPlaying, isExporting, draw]);

    useEffect(() => {
        if (isExporting && media && canvasRef.current) {
            const canvas = canvasRef.current;
            const originalWidth = canvas.width;
            const originalHeight = canvas.height;
            const { width: exportWidth, height: exportHeight } = resolutions[exportOptions.resolution];
            canvas.width = exportWidth; canvas.height = exportHeight;

            const speechAudio = audioRef.current;
            speechAudio.currentTime = 0;
            const audioContext = new AudioContext();
            const destination = audioContext.createMediaStreamDestination();
            const speechSource = audioContext.createMediaElementSource(speechAudio);
            speechSource.connect(destination);

            let bgMusicAudio: HTMLAudioElement | null = null;
            if (backgroundMusic.url) {
                bgMusicAudio = new Audio(backgroundMusic.url); bgMusicAudio.crossOrigin = "anonymous"; bgMusicAudio.loop = true;
                const bgMusicSource = audioContext.createMediaElementSource(bgMusicAudio);
                const bgMusicGain = audioContext.createGain(); bgMusicGain.gain.value = backgroundMusic.volume;
                bgMusicSource.connect(bgMusicGain).connect(destination);
            }

            const mimeType = exportOptions.format === 'mp4' ? 'video/mp4' : 'video/webm; codecs=vp9,opus';
            const combinedStream = new MediaStream([...canvas.captureStream(30).getVideoTracks(), ...destination.stream.getAudioTracks()]);
            mediaRecorderRef.current = new MediaRecorder(combinedStream, { mimeType });
            recordedChunks.current = [];
            mediaRecorderRef.current.ondataavailable = (e) => e.data.size > 0 && recordedChunks.current.push(e.data);
            
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(recordedChunks.current, { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `faceless-ai-video.${exportOptions.format}`; a.click();
                URL.revokeObjectURL(url); audioContext.close();
                canvas.width = originalWidth; canvas.height = originalHeight;
                onExportComplete();
            };

            const startExport = async () => { mediaRecorderRef.current?.start(); await videoRef.current.play(); await speechAudio.play(); await bgMusicAudio?.play(); draw(); };
            startExport();

            const progressInterval = setInterval(() => onExportProgress(speechAudio.currentTime / speechAudio.duration), 100);
            const handleAudioEnd = () => { videoRef.current.pause(); bgMusicAudio?.pause(); mediaRecorderRef.current?.stop(); if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current); animationFrameId.current = null; };
            speechAudio.addEventListener('ended', handleAudioEnd, { once: true });
            return () => { clearInterval(progressInterval); speechAudio.removeEventListener('ended', handleAudioEnd); mediaRecorderRef.current?.stop(); canvas.width = originalWidth; canvas.height = originalHeight; };
        }
    }, [isExporting, media, backgroundMusic, exportOptions, draw, onExportProgress, onExportComplete]);

    return (
        <div className="aspect-[9/16] w-full max-w-full bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-2 relative group overflow-hidden">
            <canvas ref={canvasRef} width={BASE_WIDTH} height={BASE_HEIGHT} className="rounded-lg w-full h-full object-contain" />
            
            {/* Real-time Status Overlay */}
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white/90 px-3 py-1.5 rounded-lg text-xs font-mono border border-white/10 shadow-lg pointer-events-none flex items-center gap-2 z-10">
                <div className={`w-2 h-2 rounded-full ${isExporting ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span>{exportOptions.format.toUpperCase()}</span>
                <span className="text-white/40">|</span>
                <span>{exportOptions.resolution}</span>
            </div>

            {/* Active Features Badges */}
            {media && (
                <div className="absolute top-4 left-4 flex flex-col gap-1 z-10">
                    {media.activeFeatures.hypeCommentary && (
                        <div className="px-2 py-0.5 bg-pink-500/80 text-[8px] font-bold text-white rounded uppercase tracking-tighter shadow-sm">AI HYPE ACTIVE</div>
                    )}
                    {media.activeFeatures.autoReframing && (
                        <div className="px-2 py-0.5 bg-blue-500/80 text-[8px] font-bold text-white rounded uppercase tracking-tighter shadow-sm">REFRAMED 9:16</div>
                    )}
                    {media.activeFeatures.onScreenMemes && (
                        <div className="px-2 py-0.5 bg-yellow-500/80 text-[8px] font-bold text-black rounded uppercase tracking-tighter shadow-sm">MEME FONT ACTIVE</div>
                    )}
                </div>
            )}
        </div>
    );
};
