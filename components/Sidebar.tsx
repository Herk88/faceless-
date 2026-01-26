
import React, { useState } from 'react';
import type { EngineState, Filter, ExportFormat, ExportResolution } from '../types';

interface SidebarProps {
    state: EngineState;
    actions: any;
}

const TabButton: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({ active, label, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all ${
            active ? 'border-purple-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
        }`}
    >
        {label}
    </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ state, actions }) => {
    const { generatedMedia, isPlaying, isExporting, activeFilter, exportOptions, error } = state;
    const { togglePlayPause, exportVideo, applyFilter, setExportOption } = actions;
    const [activeTab, setActiveTab] = useState<'controls' | 'json' | 'logs'>('controls');

    return (
        <div className="w-full lg:w-96 flex-shrink-0 flex flex-col gap-6">
            <div className="bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-1 flex shadow-2xl">
                <TabButton active={activeTab === 'controls'} label="Editor" onClick={() => setActiveTab('controls')} />
                <TabButton active={activeTab === 'json'} label="Pipeline" onClick={() => setActiveTab('json')} />
                <TabButton active={activeTab === 'logs'} label="Worker Logs" onClick={() => setActiveTab('logs')} />
            </div>

            {activeTab === 'controls' ? (
                <div className="flex flex-col gap-6">
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 flex flex-col gap-6 shadow-xl">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={togglePlayPause} 
                                disabled={!generatedMedia || isExporting} 
                                className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-black disabled:bg-gray-800 disabled:text-gray-600 hover:bg-green-400 transition-all shadow-xl"
                            >
                                {isPlaying ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                )}
                            </button>
                            <button 
                                onClick={exportVideo} 
                                disabled={!generatedMedia || isExporting} 
                                className="flex-grow h-16 px-6 bg-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-sm hover:bg-purple-500 transition-all uppercase tracking-widest shadow-xl shadow-purple-900/20"
                            >
                                {isExporting ? 'Generating...' : 'Export 9:16 Shorts'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 flex flex-col gap-4 shadow-xl">
                         <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-500">Output Specs</h2>
                         <div className="grid grid-cols-2 gap-4">
                            <select 
                                value={exportOptions.format} 
                                onChange={(e) => setExportOption({ format: e.target.value as ExportFormat })} 
                                className="bg-black/60 border border-white/10 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                            >
                                <option value="mp4">MP4 (Standard)</option>
                                <option value="webm">WebM (Fast)</option>
                            </select>
                            <select 
                                value={exportOptions.resolution} 
                                onChange={(e) => setExportOption({ resolution: e.target.value as ExportResolution })} 
                                className="bg-black/60 border border-white/10 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                            >
                                <option value="540p">Vertical 540p</option>
                                <option value="720p">Vertical 720p</option>
                            </select>
                         </div>
                    </div>
                </div>
            ) : activeTab === 'json' ? (
                <div className="bg-black/90 rounded-[2rem] border border-white/10 p-6 h-[600px] flex flex-col gap-4 shadow-2xl relative">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-green-500">
                        <span>// AUTOMATION PAYLOAD</span>
                        <span className="bg-green-500/20 px-2 py-0.5 rounded text-[9px]">{generatedMedia?.instruction.provider?.toUpperCase() || 'GEMINI'}</span>
                    </div>
                    <div className="flex-grow overflow-auto scrollbar-hide">
                        <pre className="font-mono text-[11px] text-green-400/80 leading-relaxed">
                            {JSON.stringify(generatedMedia?.instruction, null, 2)}
                        </pre>
                    </div>
                    <button 
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(generatedMedia?.instruction, null, 2))}
                        className="w-full py-2 bg-green-600/20 text-green-400 border border-green-500/30 rounded-lg text-[10px] font-black uppercase hover:bg-green-600/40 transition-all"
                    >
                        Copy JSON to Disk
                    </button>
                </div>
            ) : (
                <div className="bg-black/90 rounded-[2rem] border border-white/10 p-6 h-[600px] flex flex-col gap-4 shadow-2xl relative">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-purple-400">
                        <span>// WORKER OUTPUT</span>
                    </div>
                    <div className="flex-grow overflow-auto scrollbar-hide">
                        <div className="font-mono text-[10px] text-purple-300/60 leading-relaxed uppercase mb-4">Command:</div>
                        <pre className="font-mono text-[10px] text-purple-200/90 leading-relaxed whitespace-pre-wrap mb-6 bg-purple-900/20 p-2 rounded">
                            {generatedMedia?.instruction.ffmpegCommand || "# No command yet"}
                        </pre>
                        <div className="font-mono text-[10px] text-purple-300/60 leading-relaxed uppercase mb-4">StdErr / Logs:</div>
                        <pre className="font-mono text-[10px] text-gray-400 leading-relaxed whitespace-pre-wrap">
                            {generatedMedia?.instruction.execution?.logs || "# Ready for processing..."}
                        </pre>
                    </div>
                    <button 
                        onClick={() => navigator.clipboard.writeText(generatedMedia?.instruction.ffmpegCommand || "")}
                        className="w-full py-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-lg text-[10px] font-black uppercase hover:bg-purple-600/40 transition-all"
                    >
                        Copy Command
                    </button>
                </div>
            )}
            
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">
                    Critical Error: {error}
                </div>
            )}
        </div>
    );
};
