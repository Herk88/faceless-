
import React from 'react';
import type { EngineState, Filter, ExportFormat, ExportResolution } from '../types';

interface SidebarProps {
    state: EngineState;
    actions: any;
}

const FilterButton: React.FC<{ filter: Filter; activeFilter: Filter; onClick: (filter: Filter) => void; icon: React.ReactElement }> = ({ filter, activeFilter, onClick, icon }) => (
    <button
        onClick={() => onClick(filter)}
        className={`flex flex-col items-center justify-center space-y-2 p-3 rounded-lg transition-all duration-200 ${
            activeFilter === filter ? 'bg-purple-500/30 text-purple-300' : 'bg-white/10 text-gray-300 hover:bg-white/20'
        }`}
    >
        {icon}
        <span className="text-xs font-medium">{filter}</span>
    </button>
);

const NoirIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const VintageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5V4H4zm0 12v5h5v-5H4zm12 0v5h5v-5h-5zm0-12v5h5V4h-5z" /></svg>;
const NoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.636 18.364a9 9 0 010-12.728m2.828 9.9a5 5 0 010-7.072" /></svg>;

export const Sidebar: React.FC<SidebarProps> = ({ state, actions }) => {
    const { generatedMedia, isPlaying, isExporting, activeFilter, backgroundMusic, exportOptions, error } = state;
    const { togglePlayPause, exportVideo, applyFilter, setBackgroundMusicUrl, setBackgroundMusicVolume, setExportOption } = actions;

    return (
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4 flex flex-col gap-4">
                <h2 className="text-xl font-semibold border-b border-white/20 pb-2">Controls</h2>
                <div className="flex items-center gap-4">
                    <button onClick={togglePlayPause} disabled={!generatedMedia || isExporting} className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center text-white disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-purple-700 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                            {isPlaying ? <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v4a1 1 0 11-2 0V8z" clipRule="evenodd" /> : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />}
                        </svg>
                    </button>
                    <button onClick={exportVideo} disabled={!generatedMedia || isExporting} className="flex-grow h-14 px-4 bg-green-600 rounded-full flex items-center justify-center text-white disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-green-700 transition-all focus:outline-none focus:ring-2 focus:ring-green-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        {isExporting ? 'Exporting...' : 'Export'}
                    </button>
                </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4 flex flex-col gap-3">
                 <h2 className="text-xl font-semibold border-b border-white/20 pb-2">Export Settings</h2>
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm text-gray-300">Format</label>
                        <select value={exportOptions.format} onChange={(e) => setExportOption({ format: e.target.value as ExportFormat })} className="w-full bg-white/10 border border-white/20 rounded-md p-2 focus:ring-2 focus:ring-purple-400 focus:outline-none">
                            <option value="mp4">MP4</option>
                            <option value="webm">WebM</option>
                        </select>
                    </div>
                     <div>
                        <label className="text-sm text-gray-300">Resolution</label>
                        <select value={exportOptions.resolution} onChange={(e) => setExportOption({ resolution: e.target.value as ExportResolution })} className="w-full bg-white/10 border border-white/20 rounded-md p-2 focus:ring-2 focus:ring-purple-400 focus:outline-none">
                            <option value="540p">540p</option>
                            <option value="720p">720p</option>
                        </select>
                    </div>
                 </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4 flex flex-col gap-3">
                <h2 className="text-xl font-semibold border-b border-white/20 pb-2">Background Music</h2>
                <select value={backgroundMusic.url} onChange={(e) => setBackgroundMusicUrl(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-md p-2 focus:ring-2 focus:ring-purple-400 focus:outline-none">
                    <option value="">None</option>
                    <option value="https://cdn.pixabay.com/audio/2024/02/09/audio_d5b4b249a2.mp3">Lofi Chill</option>
                    <option value="https://cdn.pixabay.com/audio/2022/08/04/audio_2dde64b97c.mp3">Inspiring Cinematic</option>
                </select>
                <label className="text-sm text-gray-300">Volume</label>
                <input type="range" min="0" max="1" step="0.05" value={backgroundMusic.volume} onChange={(e) => setBackgroundMusicVolume(parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4 flex flex-col gap-4">
                <h2 className="text-xl font-semibold border-b border-white/20 pb-2">Filters</h2>
                <div className="grid grid-cols-3 gap-2">
                    <FilterButton filter="None" activeFilter={activeFilter} onClick={() => applyFilter('None')} icon={<NoneIcon />} />
                    <FilterButton filter="Noir" activeFilter={activeFilter} onClick={() => applyFilter('Noir')} icon={<NoirIcon />} />
                    <FilterButton filter="Vintage" activeFilter={activeFilter} onClick={() => applyFilter('Vintage')} icon={<VintageIcon />} />
                </div>
            </div>
            
            {error && <div className="bg-red-500/30 border border-red-500 text-red-300 p-3 rounded-lg text-sm">{error}</div>}
        </div>
    );
};
