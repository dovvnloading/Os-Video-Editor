
import React, { useState } from 'react';
import { ClipEffects } from '../../types';
import { MagicWandIcon, ArrowDownIcon, ArrowUpIcon } from '../UI/Icons';
import { DEFAULT_EFFECTS } from '../../constants';

interface EffectPreset {
  id: string;
  name: string;
  description: string;
  updates: Partial<ClipEffects>;
  category: 'Cinematic' | 'Vintage' | 'Stylize' | 'Utility';
}

const PRESETS: EffectPreset[] = [
    // --- Cinematic ---
    {
        id: 'cine-teal-orange',
        name: 'Teal & Orange',
        category: 'Cinematic',
        description: 'Blockbuster look',
        updates: { 
            contrast: 120, 
            saturation: 110, 
            tint: '#00a3ff', 
            tintIntensity: 20,
            vignette: 30
        }
    },
    {
        id: 'cine-noir',
        name: 'Film Noir',
        category: 'Cinematic',
        description: 'Dark, moody monochrome',
        updates: { 
            grayscale: 100, 
            contrast: 140, 
            brightness: 90, 
            vignette: 60 
        }
    },
    {
        id: 'cine-dramatic',
        name: 'Dramatic Warm',
        category: 'Cinematic',
        description: 'Intense warm tones',
        updates: { 
            contrast: 130, 
            saturation: 80, 
            tint: '#ff8c00', 
            tintIntensity: 30,
            vignette: 40
        }
    },

    // --- Vintage ---
    {
        id: 'vintage-sepia',
        name: 'Classic Sepia',
        category: 'Vintage',
        description: 'Old photo style',
        updates: { 
            sepia: 90, 
            contrast: 90, 
            brightness: 95, 
            vignette: 20,
            saturation: 40
        }
    },
    {
        id: 'vintage-faded',
        name: 'Faded Memory',
        category: 'Vintage',
        description: 'Washed out and soft',
        updates: { 
            contrast: 80, 
            brightness: 110, 
            saturation: 60,
            tint: '#f5deb3',
            tintIntensity: 20,
            blur: 1
        }
    },
    {
        id: 'vintage-70s',
        name: '1970s',
        category: 'Vintage',
        description: 'Warm, retro vibe',
        updates: { 
            tint: '#d4af37',
            tintIntensity: 25,
            saturation: 120,
            contrast: 110,
            hueRotate: -10
        }
    },

    // --- Stylize ---
    {
        id: 'style-cyber',
        name: 'Cyberpunk',
        category: 'Stylize',
        description: 'Neon purple aesthetics',
        updates: { 
            tint: '#b000ff',
            tintIntensity: 40,
            contrast: 130, 
            saturation: 150,
            hueRotate: 15
        }
    },
    {
        id: 'style-radioactive',
        name: 'Radioactive',
        category: 'Stylize',
        description: 'Toxic green glow',
        updates: { 
            tint: '#00ff00',
            tintIntensity: 30,
            hueRotate: 80,
            contrast: 150,
            invert: 10
        }
    },
    {
        id: 'style-dream',
        name: 'Dreamscape',
        category: 'Stylize',
        description: 'Soft, ethereal glow',
        updates: { 
            blur: 5,
            brightness: 120,
            contrast: 80,
            saturation: 130,
            tint: '#ffc0cb',
            tintIntensity: 15
        }
    },
    {
        id: 'style-matrix',
        name: 'The Matrix',
        category: 'Stylize',
        description: 'Green system code',
        updates: { 
            grayscale: 100,
            tint: '#00ff00',
            tintIntensity: 60,
            contrast: 150,
            brightness: 80
        }
    },

    // --- Utility ---
    {
        id: 'util-bw',
        name: 'Black & White',
        category: 'Utility',
        description: 'Standard Grayscale',
        updates: { grayscale: 100, saturation: 0 }
    },
    {
        id: 'util-fix',
        name: 'Auto Fix',
        category: 'Utility',
        description: 'Slight enhancement',
        updates: { contrast: 110, saturation: 110, brightness: 105 }
    },
    {
        id: 'util-reset',
        name: 'Reset All',
        category: 'Utility',
        description: 'Clear all effects',
        updates: { ...DEFAULT_EFFECTS }
    }
];

interface EffectsLibraryProps {
    onDragStart: (e: React.DragEvent, preset: EffectPreset) => void;
}

const PresetPreview: React.FC<{ preset: EffectPreset }> = ({ preset }) => {
    // Generate a CSS preview of the effect on a dummy background
    const style: React.CSSProperties = {
        filter: `
            blur(${preset.updates.blur || 0}px) 
            grayscale(${preset.updates.grayscale || 0}%) 
            sepia(${preset.updates.sepia || 0}%) 
            invert(${preset.updates.invert || 0}%) 
            brightness(${preset.updates.brightness || 100}%) 
            contrast(${preset.updates.contrast || 100}%) 
            saturate(${preset.updates.saturation || 100}%) 
            hue-rotate(${preset.updates.hueRotate || 0}deg)
        `,
    };

    return (
        <div className="w-full aspect-video bg-cover bg-center rounded overflow-hidden relative shadow-sm border border-osve-border group-hover:border-white transition-colors"
             style={{ backgroundImage: 'url(https://picsum.photos/id/16/200/120)', filter: 'grayscale(0.5)' }} // Base grayscale for app consistency
        >
            <div className="w-full h-full" style={style}>
                 {/* Tint Approximation */}
                 {preset.updates.tint && (
                     <div style={{
                         position: 'absolute', inset: 0,
                         backgroundColor: preset.updates.tint,
                         opacity: (preset.updates.tintIntensity || 0) / 100,
                         mixBlendMode: 'overlay'
                     }} />
                 )}
                 {/* Vignette Approximation */}
                 {preset.updates.vignette && (
                     <div style={{
                         position: 'absolute', inset: 0,
                         background: `radial-gradient(circle, transparent ${100 - (preset.updates.vignette || 0)}%, rgba(0,0,0,0.8))`
                     }} />
                 )}
            </div>
        </div>
    );
}

const EffectsLibrary: React.FC<EffectsLibraryProps> = ({ onDragStart }) => {
    const categories: Record<string, EffectPreset[]> = {
        'Cinematic': PRESETS.filter(p => p.category === 'Cinematic'),
        'Vintage': PRESETS.filter(p => p.category === 'Vintage'),
        'Stylize': PRESETS.filter(p => p.category === 'Stylize'),
        'Utility': PRESETS.filter(p => p.category === 'Utility'),
    };

    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

    const toggleCat = (cat: string) => {
        setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    return (
        <div className="flex flex-col h-full bg-osve-panel border-r border-osve-border select-none">
            <div className="p-4 border-b border-osve-border flex items-center gap-2 shrink-0">
                <MagicWandIcon className="w-5 h-5 text-gray-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-osve-text">Effects Library</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                <p className="text-xs text-gray-500 mb-2">Drag presets to timeline clips.</p>
                
                {Object.entries(categories).map(([category, items]) => (
                    <div key={category} className="space-y-3">
                        <button 
                            onClick={() => toggleCat(category)}
                            className="flex items-center gap-2 w-full text-left text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-white transition-colors"
                        >
                             {collapsed[category] ? <ArrowDownIcon className="w-4 h-4" /> : <ArrowUpIcon className="w-4 h-4" />}
                             {category}
                        </button>
                        
                        {!collapsed[category] && (
                            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                                {items.map((preset) => (
                                    <div 
                                        key={preset.id}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, preset)}
                                        className="group cursor-grab active:cursor-grabbing flex flex-col gap-2"
                                        title={preset.description}
                                    >
                                        <PresetPreview preset={preset} />
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-300 group-hover:text-white truncate">{preset.name}</h4>
                                            <p className="text-[10px] text-gray-500 truncate mt-0.5">{preset.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EffectsLibrary;
