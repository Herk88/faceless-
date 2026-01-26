
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
            'Noir': 'grayscale(100%) contrast(1.5)', 
            'Vintage': 'sepia(60%) contrast(0.9) brightness(1.2)' 
        };
        ctx.filter = filterMap[filter] || 'none';
        
        // --- DRAW VIDEO WITH REFRAMING ---
        if (media.activeFeatures.autoReframing) {
            // Simulated Follow-Crosshair logic: Shift crop slightly based on time
            const shift = Math.sin(audio.currentTime * 2) * 50;
            ctx.drawImage(video, 
                (video.videoWidth / 2) - 150 + shift, 200, 300, 533, 
                0, 0, canvas.width, canvas.height 
            );
        } else {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        ctx.filter = 'none';

        const scaleFactor = canvas.width / BASE_WIDTH;
        const currentTime = audio.currentTime;

        // --- DRAW MEME OVERLAYS ---
        if (media.activeFeatures.onScreenMemes) {
            media.instruction.memes.forEach(meme => {
                if (currentTime >= meme.startTimeSeconds && currentTime <= meme.endTimeSeconds) {
                    ctx.font = `900 ${70 * scaleFactor}px Impact`;
                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#FACC15'; // yellow-400
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 10 * scaleFactor;

                    const yPos = meme.positionHint === 'top' ? 200 : meme.positionHint === 'center' ? canvas.height / 2 : canvas.height - 300;
                    ctx.strokeText(meme.text, canvas.width / 2, yPos);
                    ctx.fillText(meme.text, canvas.width / 2, yPos);
                }
            });
        }

        // --- DRAW CAPTIONS ---
        const currentLine = media.captions[0];
        ctx.font = `bold ${42 * scaleFactor}px "Arial Black", sans-serif`;
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 8 * scaleFactor;
        
        const x = canvas.width / 2;
        const y = canvas.height - (180 * scaleFactor);
        const lineMetrics = ctx.measureText(currentLine.line);
        let currentX = x - lineMetrics.width / 2;

        currentLine.words.forEach(({ word, start, end }) => {
            const isActive = currentTime >= start && currentTime < end;
            ctx.fillStyle = isActive ? '#22C55E' : 'white'; 
            const wordWidthWithSpace = ctx.measureText(word + ' ').width;
            
            if (isActive) {
                ctx.save();
                ctx.scale(1.1, 1.1);
                ctx.strokeText(word, (currentX + (wordWidthWithSpace - ctx.measureText(' ').width) / 2) / 1.1, y / 1.1);
                ctx.fillText(word, (currentX + (wordWidthWithSpace - ctx.measureText(' ').width) / 2) / 1.1, y / 1.1);
                ctx.restore();
            } else {
                ctx.strokeText(word, currentX + (wordWidthWithSpace - ctx.measureText(' ').width) / 2, y);
                ctx.fillText(word, currentX + (wordWidthWithSpace - ctx.measureText(' ').width) / 2, y);
            }
            currentX += wordWidthWithSpace;
        });

        // HUD overlay
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
        
        animationFrameId.current = requestAnimationFrame(draw);
    }, [media, filter]);

    useEffect(() => {
        const video = videoRef.current; const audio = audioRef.current;
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
            const originalWidth = canvas.width; const originalHeight = canvas.height;
            const { width: exportWidth, height: exportHeight } = resolutions[exportOptions.resolution];
            canvas.width = exportWidth; canvas.height = exportHeight;

            const speechAudio = audioRef.current; speechAudio.currentTime = 0;
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
            const combinedStream = new MediaStream([...canvas.captureStream(60).getVideoTracks(), ...destination.stream.getAudioTracks()]);
            mediaRecorderRef.current = new MediaRecorder(combinedStream, { mimeType });
            recordedChunks.current = [];
            mediaRecorderRef.current.ondataavailable = (e) => e.data.size > 0 && recordedChunks.current.push(e.data);
            
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(recordedChunks.current, { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = `warzone-short.${exportOptions.format}`; a.click();
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
        <div className="aspect-[9/16] w-full max-w-full bg-black/80 backdrop-blur-3xl rounded-3xl border border-white/10 p-2 relative group overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)]">
            <canvas ref={canvasRef} width={BASE_WIDTH} height={BASE_HEIGHT} className="rounded-2xl w-full h-full object-contain" />
            
            <div className="absolute top-6 right-6 flex flex-col items-end gap-2 z-10">
                <div className="bg-black/90 backdrop-blur-md text-white/90 px-3 py-1.5 rounded font-mono text-[10px] border border-white/20 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isExporting ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                    <span>{exportOptions.resolution}</span>
                    <span className="opacity-40">|</span>
                    <span>{exportOptions.format.toUpperCase()}</span>
                </div>
            </div>

            {media && (
                <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                    <div className="px-3 py-1 bg-green-500 text-[10px] font-black text-black rounded uppercase tracking-tighter shadow-lg">ORCHESTRATOR v2.5</div>
                    <div className="px-3 py-1 bg-purple-600/90 text-[10px] font-black text-white rounded uppercase tracking-tighter">TONE: {media.activeFeatures.tonePreset.toUpperCase()}</div>
                </div>
            )}
        </div>
    );
};
