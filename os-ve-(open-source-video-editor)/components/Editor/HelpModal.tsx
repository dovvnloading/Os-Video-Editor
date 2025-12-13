import React, { useState, useRef, useEffect } from 'react';
import { XIcon, FileIcon } from '../UI/Icons';

interface HelpModalProps {
    onClose: () => void;
}

interface DocSection {
    id: string;
    title: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
    tags: string[];
}

const DOCS: DocSection[] = [
    {
        id: 'shortcuts',
        title: 'Keyboard Shortcuts',
        tags: ['keyboard', 'hotkeys', 'controls'],
        content: (
            <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-2">Essential hotkeys for rapid editing.</p>
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex justify-between items-center bg-black/50 p-2 rounded-sm border border-osve-border">
                        <span className="text-xs text-gray-300">Play / Pause</span>
                        <span className="text-[10px] font-mono bg-osve-border px-1.5 py-0.5 rounded text-white">Space</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/50 p-2 rounded-sm border border-osve-border">
                        <span className="text-xs text-gray-300">Split Clip</span>
                        <span className="text-[10px] font-mono bg-osve-border px-1.5 py-0.5 rounded text-white">S</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/50 p-2 rounded-sm border border-osve-border">
                        <span className="text-xs text-gray-300">Delete Selected</span>
                        <span className="text-[10px] font-mono bg-osve-border px-1.5 py-0.5 rounded text-white">Del</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/50 p-2 rounded-sm border border-osve-border">
                        <span className="text-xs text-gray-300">Pan Timeline</span>
                        <span className="text-[10px] font-mono bg-osve-border px-1.5 py-0.5 rounded text-white">Shift+Drag</span>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'getting-started',
        title: 'Getting Started',
        tags: ['basics', 'intro', 'import'],
        content: (
            <div className="space-y-3 text-sm text-gray-400 leading-relaxed">
                <p>Welcome to <strong className="text-white">Os-Ve Pro</strong>. This non-linear editor allows you to compose multiple layers of video and audio.</p>
                <ol className="list-decimal pl-4 space-y-1">
                    <li><strong className="text-gray-300">Import Media:</strong> Drag files directly onto the app or use the Upload icon in the Asset Manager.</li>
                    <li><strong className="text-gray-300">Add to Timeline:</strong> Drag assets from the sidebar onto a track. Video goes to 'V' tracks, Audio to 'A' tracks.</li>
                    <li><strong className="text-gray-300">Edit:</strong> Select clips to move, trim, or split them.</li>
                </ol>
            </div>
        )
    },
    {
        id: 'effects',
        title: 'Effects & Grading',
        tags: ['color', 'filters', 'transform'],
        content: (
            <div className="space-y-3 text-sm text-gray-400">
                <p>Select a clip on the timeline to open the <strong className="text-white">Properties Panel</strong> on the right.</p>
                <ul className="list-disc pl-4 space-y-1">
                    <li><strong className="text-gray-300">Visual:</strong> Adjust Opacity, Scale, Rotation, and Blend Modes (Screen, Overlay, etc).</li>
                    <li><strong className="text-gray-300">Color:</strong> Modify Saturation, Contrast, and Brightness.</li>
                    <li><strong className="text-gray-300">Presets:</strong> Open the "Effects" tab in the left sidebar and drag presets like "Cinematic" or "Vintage" onto clips.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'timeline',
        title: 'Timeline Management',
        tags: ['tracks', 'lock', 'hide'],
        content: (
            <div className="space-y-3 text-sm text-gray-400">
                <p>Manage your composition structure using Track Headers.</p>
                <div className="flex gap-4">
                    <div className="flex-1">
                         <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-300">Tracks</span>
                         </div>
                         <p className="text-xs">Add unlimited tracks using the <span className="font-mono text-xs border border-gray-700 px-1 rounded">+ Video</span> or <span className="font-mono text-xs border border-gray-700 px-1 rounded">+ Audio</span> buttons in the timeline toolbar.</p>
                    </div>
                    <div className="flex-1">
                         <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-300">Controls</span>
                         </div>
                         <p className="text-xs">Use the Eye icon to hide tracks and the Lock icon to prevent accidental edits.</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'export',
        title: 'Export & Rendering',
        tags: ['render', 'save', 'output', 'format'],
        content: (
            <div className="space-y-3 text-sm text-gray-400">
                <p>Click <strong className="text-white">Export</strong> in the top right to open the Render Queue.</p>
                <ul className="list-disc pl-4 space-y-1">
                    <li>Choose <strong className="text-gray-300">MP4</strong> for compatibility or <strong className="text-gray-300">WebM</strong> for web usage.</li>
                    <li>Select a quality preset (Draft to 4K) or manually adjust the bitrate.</li>
                    <li>Rendering happens locally in your browser. Do not close the tab while processing.</li>
                </ul>
            </div>
        )
    }
];

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
    const [search, setSearch] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const filteredDocs = DOCS.filter(doc => 
        doc.title.toLowerCase().includes(search.toLowerCase()) || 
        doc.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
            <div className="bg-[#121212] border border-osve-border rounded-sm w-[600px] h-[700px] shadow-2xl flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="h-16 bg-[#1a1a1a] border-b border-osve-border flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-sm bg-white flex items-center justify-center border border-osve-border text-black">
                            <FileIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-200 tracking-tight">Documentation</h2>
                            <p className="text-xs text-gray-500 font-mono">Os-Ve Reference Manual</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-osve-border bg-[#0f0f0f] flex gap-2">
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search documentation..."
                        className="flex-1 bg-[#1e1e1e] border border-osve-border text-white text-sm rounded-sm px-4 py-3 focus:border-white outline-none placeholder-gray-600 transition-colors"
                    />
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-[#0a0a0a]">
                    
                    {filteredDocs.length > 0 ? (
                        filteredDocs.map(doc => (
                            <div key={doc.id} className="animate-in slide-in-from-bottom-2 duration-300">
                                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                                    {doc.title}
                                </h3>
                                <div className="bg-[#171717] border border-osve-border rounded-lg p-5 hover:border-gray-600 transition-colors">
                                    {doc.content}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 opacity-50">
                            <p className="text-sm text-gray-400">No topics found for "{search}".</p>
                        </div>
                    )}
                    
                    <div className="pt-8 border-t border-osve-border text-center">
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest">Os-Ve Professional Editor v1.0.0</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;