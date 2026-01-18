
import React from 'react';
import type { LoadingStep } from '../types';

interface ProgressStepperProps {
    currentStep: LoadingStep;
}

const steps: { id: LoadingStep; label: string }[] = [
    { id: 'script', label: 'Writing Script' },
    { id: 'matchmaking', label: 'Finding Template' },
    { id: 'visuals', label: 'Generating Visuals' },
    { id: 'audio', label: 'Syncing Audio' },
    { id: 'done', label: 'Done!' },
];

export const ProgressStepper: React.FC<ProgressStepperProps> = ({ currentStep }) => {
    const currentStepIndex = steps.findIndex(step => step.id === currentStep);

    return (
        <div className="w-full max-w-xl mx-auto p-4">
            <div className="flex items-center">
                {steps.map((step, index) => {
                    const isActive = index === currentStepIndex;
                    const isCompleted = index < currentStepIndex || currentStep === 'done';
                    
                    // Special case for skipping 'visuals' on a cache hit
                    if (step.id === 'visuals' && currentStep === 'audio' && !steps.slice(0, index).find(s => s.id === 'visuals')) {
                         const matchmakingIndex = steps.findIndex(s => s.id === 'matchmaking');
                         if (currentStepIndex > matchmakingIndex) {
                            return (
                                <React.Fragment key={step.id}>
                                    <div className="flex flex-col items-center opacity-50">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-700">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" /></svg>
                                        </div>
                                        <p className="mt-2 text-xs text-center text-gray-400">Skipped (Cached)</p>
                                    </div>
                                    <div className="flex-auto border-t-2 border-gray-700"></div>
                                </React.Fragment>
                            );
                         }
                    }


                    return (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    isCompleted ? 'bg-green-500' : isActive ? 'bg-purple-500 animate-pulse' : 'bg-gray-700'
                                }`}>
                                    {isCompleted ? (
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    ) : (
                                        <span className="text-white font-bold">{index + 1}</span>
                                    )}
                                </div>
                                <p className={`mt-2 text-xs text-center transition-colors ${
                                    isActive || isCompleted ? 'text-white' : 'text-gray-400'
                                }`}>{step.label}</p>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`flex-auto border-t-2 transition-colors duration-300 ${
                                    isCompleted ? 'border-green-500' : 'border-gray-700'
                                }`}></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};
