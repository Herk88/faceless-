
import React, { useState } from 'react';
import { ConnectionGrid } from './ConnectionGrid';
import { ProgressStepper } from './ProgressStepper';
import type { LoadingStep, AutomationFeatures } from '../types';

interface PromptViewProps {
    generateContent: (prompt: string) => void;
    isLoading: boolean;
    loadingStep: LoadingStep;
    projectSettings: AutomationFeatures;
    toggleFeature: (feature: keyof AutomationFeatures) => void;
}

const FeatureToggle: React.FC<{ 
    label: string; 
    active: boolean; 
    onClick: () => void; 
    description: string 
}> = ({ label, active, onClick, description }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col p-3 rounded-xl border transition-all text-left ${
            active ? 'bg-purple-500/20 border-purple-500/50' : 'bg-white/5 border-white/10 opacity-60 hover:opacity-100'
        }`}
    >
        <div className="flex items-center justify-between w-full">
            <span className={`text-sm font-bold ${active ? 'text-purple-300' : 'text-gray-400'}`}>{label}</span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${active ? 'bg-purple-500' : 'bg-gray-600'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${active ? 'left-4.5' : 'left-0.5'}`} />
            </div>
        </div>
        <span className="text-[10px] text-gray-500 mt-1">{description}</span>
    </button>
);

export const PromptView: React.FC<PromptViewProps> = ({ generateContent, isLoading, loadingStep, projectSettings, toggleFeature }) => {
    const [prompt, setPrompt] = useState('a story about a lonely robot who finds a friend');

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-bold rounded uppercase tracking-wider border border-purple-500/30">
                            Stack: Custom Pipeline (Option E)
                        </div>
                    </div>
                    
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your video idea..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-purple-400 focus:outline-none transition resize-none h-28 text-lg"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FeatureToggle 
                            label="Hype Mode" 
                            active={projectSettings.hypeCommentary} 
                            onClick={() => toggleFeature('hypeCommentary')}
                            description="High-energy AI narration"
                        />
                        <FeatureToggle 
                            label="Auto-Reframing" 
                            active={projectSettings.autoReframing} 
                            onClick={() => toggleFeature('autoReframing')}
                            description="9:16 vertical optimization"
                        />
                        <FeatureToggle 
                            label="Dynamic Memes" 
                            active={projectSettings.onScreenMemes} 
                            onClick={() => toggleFeature('onScreenMemes')}
                            description="Viral text & overlays"
                        />
                    </div>

                    <button
                        onClick={() => generateContent(prompt)}
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-wait shadow-lg shadow-purple-500/20 uppercase tracking-widest"
                    >
                        {isLoading ? 'Processing Pipeline...' : 'Initialize Generation'}
                    </button>
                </div>
            </div>
            
            {isLoading && <ProgressStepper currentStep={loadingStep} />}
            
            <ConnectionGrid />
        </div>
    );
};
