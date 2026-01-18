
import React from 'react';
import { CanvasVideoEditor } from '../CanvasVideoEditor';
import { Sidebar } from './Sidebar';
import type { EngineState } from '../types';

interface EditorViewProps {
    state: EngineState;
    actions: any; // Simplified for brevity
}

const LoadingSpinner: React.FC = () => (
    <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center z-30">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400"></div>
        <p className="text-white mt-4 text-lg font-semibold">Generating your masterpiece...</p>
    </div>
);

export const EditorView: React.FC<EditorViewProps> = ({ state, actions }) => {
    const { 
        isLoading, 
        isExporting, 
        exportProgress, 
        generatedMedia, 
        isPlaying, 
        activeFilter, 
        backgroundMusic, 
        exportOptions,
        error 
    } = state;

    return (
        <main className="w-full flex flex-col lg:flex-row gap-4">
            {/* Player Section */}
            <div className="flex-grow flex justify-center items-center relative w-full max-w-md mx-auto lg:mx-0">
                <CanvasVideoEditor
                    media={generatedMedia}
                    isPlaying={isPlaying}
                    filter={activeFilter}
                    isExporting={isExporting}
                    backgroundMusic={backgroundMusic}
                    exportOptions={exportOptions}
                    onExportProgress={actions.handleExportProgress}
                    onExportComplete={actions.handleExportComplete}
                />
                {isLoading && <LoadingSpinner />}
                {isExporting && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center z-30 rounded-xl">
                        <div className="w-24 h-24 border-4 border-purple-500 border-dashed rounded-full animate-spin"></div>
                        <p className="text-white mt-4">Exporting video...</p>
                        <div className="w-3/4 mt-2 bg-gray-700 rounded-full h-2.5">
                            <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${exportProgress * 100}%` }}></div>
                        </div>
                    </div>
                )}
            </div>
            {/* Controls Section */}
            <Sidebar state={state} actions={actions} />
        </main>
    );
};
