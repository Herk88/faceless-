
import React, { useState } from 'react';
import { ConnectionGrid } from './ConnectionGrid';
import { ProgressStepper } from './ProgressStepper';
import type { LoadingStep, AutomationFeatures, TonePreset } from '../types';

interface PromptViewProps {
    generateContent: (prompt: string) => void;
    isLoading: boolean;
    loadingStep: LoadingStep;
    projectSettings: AutomationFeatures;
    toggleFeature: (feature: keyof Omit<AutomationFeatures, 'tonePreset'>) => void;
    setTonePreset: (tone: TonePreset) => void;
}

const FeatureToggle: React.FC<{ 
    label: string; 
    active: boolean; 
    onClick: () => void; 
    description: string 
}> = ({ label, active, onClick, description }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col p-4 rounded-2xl border transition-all text-left ${
            active ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'bg-white/5 border-white/10 opacity-60 hover:opacity-100 hover:bg-white/10'
        }`}
    >
        <div className="flex items-center justify-between w-full">
            <span className={`text-xs font-black uppercase tracking-widest ${active ? 'text-green-400' : 'text-gray-400'}`}>{label}</span>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-green-500' : 'bg-gray-700'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'left-6' : 'left-1'}`} />
            </div>
        </div>
        <span className="text-[10px] text-gray-500 mt-2 font-medium">{description}</span>
    </button>
);

const ToneButton: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({ active, label, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 py-3 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all ${
            active ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]' : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/30'
        }`}
    >
        {label}
    </button>
);

export const PromptView: React.FC<PromptViewProps> = ({ 
    generateContent, isLoading, loadingStep, projectSettings, toggleFeature, setTonePreset 
}) => {
    const [prompt, setPrompt] = useState('crazy squad wipe at superstore with movement');

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 py-8">
            <div className="bg-black/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
                
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-green-400">Warzone Orchestrator 1.0</h2>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Input your highlight criteria. Our pipeline handles the rest.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Tone Preset</label>
                        <div className="flex gap-3">
                            <ToneButton label="Aggressive" active={projectSettings.tonePreset === 'aggressive'} onClick={() => setTonePreset('aggressive')} />
                            <ToneButton label="Chill" active={projectSettings.tonePreset === 'chill'} onClick={() => setTonePreset('chill')} />
                            <ToneButton label="Cracked" active={projectSettings.tonePreset === 'cracked-movement'} onClick={() => setTonePreset('cracked-movement')} />
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Highlight Goal</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. Squad wipe Superstore with slide canceling..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 focus:ring-1 focus:ring-green-400 focus:outline-none transition resize-none h-32 text-lg font-mono placeholder:text-gray-700 shadow-inner"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FeatureToggle 
                            label="Hype VO" 
                            active={projectSettings.hypeCommentary} 
                            onClick={() => toggleFeature('hypeCommentary')}
                            description="Warzone Slang AI Narrator"
                        />
                        <FeatureToggle 
                            label="Auto-Reframing" 
                            active={projectSettings.autoReframing} 
                            onClick={() => toggleFeature('autoReframing')}
                            description="9:16 Center-Crop Focus"
                        />
                        <FeatureToggle 
                            label="Meme FX" 
                            active={projectSettings.onScreenMemes} 
                            onClick={() => toggleFeature('onScreenMemes')}
                            description="Dynamic Viral Overlays"
                        />
                    </div>

                    <button
                        onClick={() => generateContent(prompt)}
                        disabled={isLoading}
                        className="w-full py-6 bg-white text-black font-black rounded-[1.5rem] hover:bg-green-400 transition-all disabled:opacity-50 disabled:cursor-wait uppercase tracking-[0.2em] text-sm shadow-xl shadow-white/5"
                    >
                        {isLoading ? 'Processing Pipeline Instructions...' : 'Execute Automation Sequence'}
                    </button>
                </div>
            </div>
            
            {isLoading && <ProgressStepper currentStep={loadingStep} />}
            
            <ConnectionGrid />
        </div>
    );
};
