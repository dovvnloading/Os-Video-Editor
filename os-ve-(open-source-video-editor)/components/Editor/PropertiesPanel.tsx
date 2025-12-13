
import React, { useState } from 'react';
import { useProject } from '../../store/ProjectContext';
import { ClipEffects, BlendMode, MediaType, TransitionType } from '../../types';
import { VideoIcon, VolumeIcon, ArrowDownIcon, ArrowUpIcon } from '../UI/Icons';

// --- Types ---
type Tab = 'properties' | 'transitions' | 'audio';

const BLEND_MODES: BlendMode[] = [
    'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 
    'color-dodge', 'color-burn', 'hard-light', 'soft-light', 
    'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'
];

const TRANSITION_TYPES: TransitionType[] = [
    'none', 'fade', 'slide-left', 'slide-right', 'slide-up', 'slide-down', 'zoom-in', 'zoom-out', 'wipe-left', 'wipe-right'
];

// --- Sub-Components ---

const ControlRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex justify-between items-center mb-4">
        <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">{label}</label>
        {children}
    </div>
);

const NumberInput: React.FC<{ value: number; min: number; max: number; onChange: (v: number) => void; unit?: string }> = ({ value, min, max, onChange, unit }) => {
    const safeValue = typeof value === 'number' ? value : 0;
    return (
    <div className="flex items-center gap-3">
        <input 
            type="range" min={min} max={max} step={(max-min)/100} value={safeValue} 
            onChange={e => onChange(Number(e.target.value))}
            className="w-28 h-1.5 bg-osve-border rounded-lg appearance-none cursor-pointer accent-white"
        />
        <div className="flex items-center bg-black rounded border border-osve-border w-16 justify-end px-2 py-1">
             <span className="text-xs text-gray-200 font-mono">{safeValue.toFixed(1)}</span>
             {unit && <span className="text-[10px] text-gray-600 ml-1">{unit}</span>}
        </div>
    </div>
)};

const Section: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-osve-border">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-4 px-5 bg-osve-active hover:bg-osve-border transition-colors"
            >
                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">{title}</span>
                {isOpen ? <ArrowUpIcon className="w-4 h-4 text-gray-500"/> : <ArrowDownIcon className="w-4 h-4 text-gray-500"/>}
            </button>
            {isOpen && <div className="p-5 bg-osve-bg animate-in slide-in-from-top-1 duration-150">{children}</div>}
        </div>
    );
};

// --- Main Panel ---

const PropertiesPanel: React.FC = () => {
    const { state, actions } = useProject();
    const { selectedClipId, clips, assets } = state;
    const [activeTab, setActiveTab] = useState<Tab>('properties');

    const clip = selectedClipId ? clips.find(c => c.id === selectedClipId) : null;
    const asset = clip ? assets.find(a => a.id === clip.assetId) : null;

    if (!clip || !asset) {
        return (
            <div className="h-full bg-osve-panel border-l border-osve-border flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-full bg-osve-active flex items-center justify-center mb-6">
                    <VideoIcon className="w-10 h-10 opacity-20 text-gray-500" />
                </div>
                <p className="text-sm uppercase tracking-widest text-gray-600 font-bold">No Selection</p>
                <p className="text-xs text-gray-700 mt-2">Select a clip to edit properties</p>
            </div>
        );
    }

    const updateEffect = (key: keyof ClipEffects, value: any) => {
        actions.updateClip(clip.id, { effects: { ...clip.effects, [key]: value } });
    };

    const updateTransition = (type: 'in' | 'out', key: 'type' | 'duration', value: any) => {
        const current = clip.transition || { in: { type: 'none', duration: 1 }, out: { type: 'none', duration: 1 } };
        actions.updateClip(clip.id, { 
            transition: { 
                ...current, 
                [type]: { ...current[type], [key]: value }
            } 
        });
    };

    const getTransition = (type: 'in' | 'out') => {
        return clip.transition?.[type] || { type: 'none', duration: 1 };
    }

    return (
        <div className="h-full bg-osve-panel border-l border-osve-border flex flex-col">
            
            {/* Header */}
            <div className="p-5 border-b border-osve-border bg-osve-active">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white truncate">{clip.name}</h3>
                <p className="text-xs text-gray-500 font-mono mt-1.5">
                    {(clip.duration || 0).toFixed(2)}s • {asset.type}
                </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-osve-border bg-osve-panel">
                <button onClick={() => setActiveTab('properties')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'properties' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Visual</button>
                <button onClick={() => setActiveTab('transitions')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'transitions' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>FX</button>
                <button onClick={() => setActiveTab('audio')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'audio' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Audio</button>
            </div>

            {/* Controls */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-osve-bg">
                {activeTab === 'properties' && (
                    <>
                        <Section title="Transform">
                            <ControlRow label="Scale">
                                <NumberInput value={clip.effects.scale} min={0} max={3} onChange={v => updateEffect('scale', v)} />
                            </ControlRow>
                            <ControlRow label="Rotation">
                                <NumberInput value={clip.effects.rotation} min={-180} max={180} onChange={v => updateEffect('rotation', v)} unit="°" />
                            </ControlRow>
                            <ControlRow label="Opacity">
                                <NumberInput value={clip.effects.opacity} min={0} max={100} onChange={v => updateEffect('opacity', v)} unit="%" />
                            </ControlRow>
                        </Section>

                        <Section title="Color & Filter">
                             <ControlRow label="Saturation">
                                <NumberInput value={clip.effects.saturation} min={0} max={200} onChange={v => updateEffect('saturation', v)} unit="%" />
                            </ControlRow>
                            <ControlRow label="Contrast">
                                <NumberInput value={clip.effects.contrast} min={0} max={200} onChange={v => updateEffect('contrast', v)} unit="%" />
                            </ControlRow>
                             <ControlRow label="Grayscale">
                                <NumberInput value={clip.effects.grayscale} min={0} max={100} onChange={v => updateEffect('grayscale', v)} unit="%" />
                            </ControlRow>
                            <div className="mt-5">
                                <label className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-2.5 block">Blend Mode</label>
                                <select 
                                    value={clip.effects.blendMode}
                                    onChange={(e) => updateEffect('blendMode', e.target.value)}
                                    className="w-full bg-black border border-osve-border text-sm text-white rounded p-2 focus:border-white outline-none"
                                >
                                    {BLEND_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        </Section>
                    </>
                )}

                {activeTab === 'transitions' && (
                    <>
                        <Section title="Entrance Animation">
                            <div className="mb-5">
                                <label className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-2.5 block">Type</label>
                                <select 
                                    value={getTransition('in').type}
                                    onChange={(e) => updateTransition('in', 'type', e.target.value)}
                                    className="w-full bg-black border border-osve-border text-sm text-white rounded p-2 focus:border-white outline-none"
                                >
                                    {TRANSITION_TYPES.map(m => <option key={m} value={m}>{m.replace('-', ' ')}</option>)}
                                </select>
                            </div>
                            <ControlRow label="Duration">
                                <NumberInput value={getTransition('in').duration} min={0.1} max={5} onChange={v => updateTransition('in', 'duration', v)} unit="s" />
                            </ControlRow>
                        </Section>
                        
                        <Section title="Exit Animation">
                            <div className="mb-5">
                                <label className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-2.5 block">Type</label>
                                <select 
                                    value={getTransition('out').type}
                                    onChange={(e) => updateTransition('out', 'type', e.target.value)}
                                    className="w-full bg-black border border-osve-border text-sm text-white rounded p-2 focus:border-white outline-none"
                                >
                                    {TRANSITION_TYPES.map(m => <option key={m} value={m}>{m.replace('-', ' ')}</option>)}
                                </select>
                            </div>
                            <ControlRow label="Duration">
                                <NumberInput value={getTransition('out').duration} min={0.1} max={5} onChange={v => updateTransition('out', 'duration', v)} unit="s" />
                            </ControlRow>
                        </Section>
                    </>
                )}

                {activeTab === 'audio' && (
                    <div className="p-6">
                        <div className="bg-osve-active rounded-lg p-8 border border-osve-border text-center">
                            <VolumeIcon className="w-10 h-10 text-gray-400 mx-auto mb-6" />
                            <ControlRow label="Volume">
                                <NumberInput value={clip.effects.volume ?? 100} min={0} max={100} onChange={v => updateEffect('volume', v)} unit="%" />
                            </ControlRow>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertiesPanel;
