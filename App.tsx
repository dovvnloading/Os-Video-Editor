

import React, { useState } from 'react';
import { ProjectProvider, useProject } from './store/ProjectContext';
import AssetManager from './components/Editor/AssetManager';
import EffectsLibrary from './components/Editor/EffectsLibrary';
import Timeline from './components/Editor/Timeline';
import Preview from './components/Editor/Preview';
import PropertiesPanel from './components/Editor/PropertiesPanel';
import ExportModal from './components/Editor/ExportModal';
import HelpModal from './components/Editor/HelpModal';
import InfoModal from './components/Editor/InfoModal';
import { SettingsIcon, VideoIcon, MagicWandIcon, UploadIcon, ExportIcon, HelpIcon, InfoIcon } from './components/UI/Icons';
import { MediaType } from './types';

type SidebarTab = 'media' | 'effects';

const ProjectSettingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { state, dispatch } = useProject();
    const [values, setValues] = useState({
        width: state.width,
        height: state.height,
        duration: state.duration,
    });

    const handleSave = () => {
        dispatch({ type: 'SET_PROJECT', payload: { 
            width: Number(values.width), 
            height: Number(values.height), 
            duration: Number(values.duration) 
        }});
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-osve-panel border border-osve-border p-8 rounded-lg w-96 shadow-2xl transform transition-all scale-100">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-lg font-bold text-osve-textHighlight flex items-center gap-3 uppercase tracking-wider">
                        <SettingsIcon className="w-6 h-6 text-osve-text" /> Project Settings
                    </h2>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-osve-text uppercase mb-2 tracking-wider">Canvas Resolution</label>
                        <div className="flex gap-3 items-center">
                            <div className="relative flex-1">
                                <input 
                                    type="number" 
                                    value={values.width}
                                    onChange={e => setValues({...values, width: parseInt(e.target.value) || 0})}
                                    className="w-full bg-black border border-osve-border rounded px-3 py-3 text-sm text-white focus:border-white outline-none text-center font-mono"
                                />
                                <span className="absolute right-3 top-3 text-xs text-gray-600 pointer-events-none">W</span>
                            </div>
                            <span className="text-gray-600 text-sm">×</span>
                            <div className="relative flex-1">
                                <input 
                                    type="number" 
                                    value={values.height}
                                    onChange={e => setValues({...values, height: parseInt(e.target.value) || 0})}
                                    className="w-full bg-black border border-osve-border rounded px-3 py-3 text-sm text-white focus:border-white outline-none text-center font-mono"
                                />
                                <span className="absolute right-3 top-3 text-xs text-gray-600 pointer-events-none">H</span>
                            </div>
                        </div>
                    </div>

                    <div>
                         <label className="block text-xs font-bold text-osve-text uppercase mb-2 tracking-wider">Timeline Duration</label>
                         <div className="relative">
                            <input 
                                type="number" 
                                value={values.duration}
                                onChange={e => setValues({...values, duration: parseInt(e.target.value) || 0})}
                                className="w-full bg-black border border-osve-border rounded px-3 py-3 text-sm text-white focus:border-white outline-none font-mono"
                            />
                            <span className="absolute right-4 top-3.5 text-xs text-gray-500 pointer-events-none">Sec</span>
                         </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-osve-border">
                    <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-osve-text hover:text-white transition-colors">Cancel</button>
                    <button onClick={handleSave} className="px-5 py-2 text-sm font-bold bg-white text-black hover:bg-gray-200 rounded shadow-lg transition-all">Apply</button>
                </div>
            </div>
        </div>
    );
};

// Inner component to access Context
const EditorLayout: React.FC = () => {
    const { state, actions, dispatch } = useProject();
    const [activeTab, setActiveTab] = useState<SidebarTab>('media');
    const [showSettings, setShowSettings] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    // Drag Drop Logic for Importing Files
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.types.includes('Files')) {
            setIsDraggingOver(true);
        }
    };
    
    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(false);
        if (e.dataTransfer.files?.length) {
            Array.from(e.dataTransfer.files).forEach((file: File) => {
                const type = file.type.startsWith('image') ? MediaType.IMAGE : file.type.startsWith('audio') ? MediaType.AUDIO : MediaType.VIDEO;
                actions.addAsset({
                    id: `asset-${Date.now()}-${Math.random()}`,
                    name: file.name,
                    type: type,
                    url: URL.createObjectURL(file),
                    duration: 10 // Default
                });
            });
        }
    };

    return (
        <div 
            className="flex flex-col h-screen bg-osve-bg text-osve-text font-sans overflow-hidden relative"
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
        >
            {/* Modals */}
            {showSettings && <ProjectSettingsModal onClose={() => setShowSettings(false)} />}
            {showExport && <ExportModal onClose={() => setShowExport(false)} />}
            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
            {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}

            {/* Import Overlay */}
            {isDraggingOver && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur border-4 border-white m-8 rounded-2xl flex flex-col items-center justify-center animate-in fade-in pointer-events-none">
                    <UploadIcon className="w-24 h-24 text-white mb-6 animate-bounce" />
                    <h2 className="text-3xl font-bold text-white">Drop to Import Media</h2>
                </div>
            )}

            {/* Header */}
            <header className="h-16 bg-osve-panel border-b border-osve-border flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center font-bold text-sm text-black">Os</div>
                    <span className="text-sm font-bold text-gray-200">Os-Ve <span className="text-gray-500 font-normal ml-1">Pro</span></span>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowInfo(true)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-osve-border rounded transition-colors"
                        title="About & Credits"
                    >
                        <InfoIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setShowHelp(true)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-osve-border rounded transition-colors mr-2"
                        title="Help & Documentation"
                    >
                        <HelpIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setShowExport(true)}
                        className="flex items-center gap-2 px-5 py-2 bg-white hover:bg-gray-200 text-black text-sm font-bold rounded shadow-sm transition-all"
                    >
                        <ExportIcon className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                    <div className="w-px h-6 bg-osve-border mx-2"/>
                    <button 
                        onClick={() => setShowSettings(true)}
                        className="text-gray-400 hover:text-white p-2 hover:bg-osve-border rounded transition-colors"
                        title="Project Settings"
                    >
                        <SettingsIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Workspace */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - WIdened to 20rem (w-80) for better text fit */}
                <div className="w-80 border-r border-osve-border bg-osve-panel flex flex-col z-10">
                    <div className="flex border-b border-osve-border">
                        <button onClick={() => setActiveTab('media')} className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'media' ? 'text-white bg-osve-active border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'}`}><VideoIcon className="w-4 h-4"/> Media</button>
                        <button onClick={() => setActiveTab('effects')} className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'effects' ? 'text-white bg-osve-active border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'}`}><MagicWandIcon className="w-4 h-4"/> Effects</button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        {activeTab === 'media' ? 
                            <AssetManager 
                                assets={state.assets} 
                                onAddAsset={actions.addAsset} 
                                onRemoveAsset={(id) => dispatch({ type: 'REMOVE_ASSET', payload: id })} 
                                onDragStart={(e, a) => { e.dataTransfer.setData('application/osve-asset', JSON.stringify(a)); }} 
                            /> 
                            : 
                            <EffectsLibrary onDragStart={(e, p) => { e.dataTransfer.setData('application/osve-effect', JSON.stringify(p)); }} />
                        }
                    </div>
                </div>

                {/* Center */}
                <div className="flex-1 flex flex-col bg-black relative">
                    <Preview 
                        project={state} 
                        onUpdateProject={u => dispatch({ type: 'SET_PROJECT', payload: u })} 
                        onTogglePlay={actions.playPause}
                    />
                </div>

                {/* Right Panel - Widened to 24rem (w-96) */}
                <div className="w-96 border-l border-osve-border bg-osve-panel z-10">
                    <PropertiesPanel />
                </div>
            </div>

            {/* Timeline */}
            <div className="h-[35%] shrink-0 relative z-10">
                <Timeline />
            </div>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <ProjectProvider>
            <EditorLayout />
        </ProjectProvider>
    );
};

export default App;