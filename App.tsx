
import React from 'react';
import { useVideoEngine } from './useVideoEngine';
import { EditorView } from './components/EditorView';
import { PromptView } from './components/PromptView';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
    const { state, ...actions } = useVideoEngine();
    const { generatedMedia, isLoading, loadingStep, projectSettings } = state;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 text-white font-sans flex flex-col items-center justify-center p-4 overflow-hidden">
            <header className="w-full max-w-5xl mx-auto my-4 text-center">
                <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                    Faceless AI Studio
                </h1>
                <p className="text-gray-400 mt-1">
                    Turn your ideas into viral videos in seconds.
                </p>
            </header>

            <AnimatePresence mode="wait">
                {!generatedMedia && !isLoading ? (
                    <motion.div
                        key="prompt"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="w-full"
                    >
                        <PromptView 
                            generateContent={actions.generateContent} 
                            isLoading={isLoading} 
                            loadingStep={loadingStep}
                            projectSettings={projectSettings}
                            toggleFeature={actions.toggleFeature}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="editor"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-5xl mx-auto"
                    >
                        <EditorView state={state} actions={actions} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default App;
