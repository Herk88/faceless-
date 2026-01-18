
import React, { useState } from 'react';
import { ConnectionGrid } from './ConnectionGrid';
import { ProgressStepper } from './ProgressStepper';
import type { LoadingStep } from '../types';

interface PromptViewProps {
    generateContent: (prompt: string) => void;
    isLoading: boolean;
    loadingStep: LoadingStep;
}

export const PromptView: React.FC<PromptViewProps> = ({ generateContent, isLoading, loadingStep }) => {
    const [prompt, setPrompt] = useState('a story about a lonely robot who finds a friend');

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your video idea..."
                        className="w-full flex-grow bg-white/5 border border-white/20 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 focus:outline-none transition resize-none h-24 sm:h-auto"
                    />
                    <button
                        onClick={() => generateContent(prompt)}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait"
                    >
                        Generate
                    </button>
                </div>
            </div>
            
            {isLoading && <ProgressStepper currentStep={loadingStep} />}
            
            <ConnectionGrid />
        </div>
    );
};
