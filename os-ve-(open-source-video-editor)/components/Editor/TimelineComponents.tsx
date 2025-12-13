
import React, { memo, useRef, useState, useEffect, useCallback } from 'react';
import { useProject } from '../../store/ProjectContext';
import { Clip, Track, MediaType } from '../../types';
import { EyeIcon, EyeOffIcon, LockIcon, UnlockIcon, VolumeIcon, MuteIcon, TrashIcon } from '../UI/Icons';
import { DEFAULT_EFFECTS } from '../../constants';

// --- Types & Constants ---

const TRACK_HEIGHT = 112; // h-28 = 7rem = 112px (Increased from 96)
const SNAP_THRESHOLD_PX = 20;

interface DragState {
    clipId: string;
    startX: number;     // Initial mouse X
    startTime: number;  // Initial clip start time
    duration: number;
    trackId: string;    // Initial track
    
    currentX: number;   // Current mouse X relative to timeline start
    currentTime: number;// Current calculated start time
    currentTrackId: string;
    
    offsetTime: number; // Time offset from mouse to clip start
}

// --- Helpers ---

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const f = Math.floor((seconds % 1) * 100);
    return `${m}:${s.toString().padStart(2, '0')}.${f.toString().padStart(2, '0')}`;
};

const formatRulerTime = (seconds: number, step: number) => {
    if (step >= 60) {
        // Show hours:minutes or just minutes
        if (seconds >= 3600) {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            return `${h}h${m > 0 ? ` ${m}m` : ''}`;
        }
        const m = Math.floor(seconds / 60);
        return `${m}m`;
    }
    // Show minutes:seconds
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

// --- Components ---

export const TimelineRuler: React.FC<{ width: number }> = ({ width }) => {
    const { state, actions } = useProject();
    const { zoom } = state;

    const handleMouseDown = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = x / zoom;
        actions.seek(time);
        
        const handleMouseMove = (ev: MouseEvent) => {
            const newX = ev.clientX - rect.left;
            actions.seek(Math.max(0, newX / zoom));
        };
        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    // Dynamic Step Calculation to maintain performant DOM count
    const totalSeconds = Math.ceil(width / zoom);
    
    const step = (() => {
        const targetSpacingPx = 100;
        const rawStep = targetSpacingPx / zoom;
        const niceSteps = [
            0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30, 
            60, 120, 300, 600, 900, 1800, 3600
        ];
        return niceSteps.find(s => s >= rawStep) || 3600;
    })();

    const ticks = [];
    for (let i = 0; i < totalSeconds; i += step) {
        ticks.push(i);
    }

    return (
        <div 
            className="h-8 border-b border-osve-border bg-osve-panel sticky top-0 z-10 cursor-pointer shrink-0 select-none overflow-hidden"
            style={{ width: `${width}px` }}
            onMouseDown={handleMouseDown}
        >
             <div className="relative w-full h-full">
                {ticks.map((t) => (
                    <div key={t} className="absolute top-0 bottom-0 border-l border-osve-border pl-1.5" style={{ left: t * zoom }}>
                        <span className="text-[10px] text-gray-500 font-mono select-none pointer-events-none">
                            {formatRulerTime(t, step)}
                        </span>
                    </div>
                ))}
             </div>
        </div>
    );
};

export const TimelineTrackList: React.FC = memo(() => {
    const { state, dispatch, actions } = useProject();

    return (
        <div className="flex flex-col min-h-full pb-10">
            {state.tracks.map(track => (
                <div key={track.id} className="h-28 border-b border-osve-border p-3 flex flex-col justify-between group bg-osve-panel hover:bg-osve-active transition-colors z-20 relative">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-bold truncate ${track.isLocked ? 'text-gray-600' : 'text-gray-300'}`}>{track.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${track.type === MediaType.VIDEO ? 'border-gray-600 text-gray-400' : 'border-gray-700 text-gray-500'}`}>
                                {track.type === MediaType.VIDEO ? 'VID' : 'AUD'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 justify-between">
                        <div className="flex gap-1">
                            <button onClick={() => dispatch({ type: 'UPDATE_TRACK', payload: { id: track.id, updates: { isHidden: !track.isHidden } } })} className={`p-1.5 rounded hover:bg-white/10 ${track.isHidden ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                                {track.isHidden ? <EyeOffIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                            </button>
                            <button onClick={() => dispatch({ type: 'UPDATE_TRACK', payload: { id: track.id, updates: { isLocked: !track.isLocked } } })} className={`p-1.5 rounded hover:bg-white/10 ${track.isLocked ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                                {track.isLocked ? <LockIcon className="w-5 h-5"/> : <UnlockIcon className="w-5 h-5"/>}
                            </button>
                            <button onClick={() => dispatch({ type: 'UPDATE_TRACK', payload: { id: track.id, updates: { isMuted: !track.isMuted } } })} className={`p-1.5 rounded hover:bg-white/10 ${track.isMuted ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                                {track.isMuted ? <MuteIcon className="w-5 h-5"/> : <VolumeIcon className="w-5 h-5"/>}
                            </button>
                        </div>
                        
                        <button 
                            onClick={() => actions.removeTrack(track.id)}
                            className="p-1.5 rounded text-gray-600 hover:text-white hover:bg-red-900/50 opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete Track"
                        >
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
});

export const TimelineLanes: React.FC<{ isSnapping: boolean }> = memo(({ isSnapping }) => {
    const { state, actions } = useProject();
    const { tracks, clips, zoom, selectedClipId, currentTime, assets } = state;
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Drag State
    const [dragState, setDragState] = useState<DragState | null>(null);
    const [snapLines, setSnapLines] = useState<number[]>([]);

    // --- Drag Logic ---

    const handleDragStart = useCallback((e: React.MouseEvent, clip: Clip) => {
        if (e.button !== 0) return; // Only left click
        e.stopPropagation();
        
        actions.selectClip(clip.id);

        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const startX = e.clientX - rect.left;
        
        // Calculate offset (where within the clip did we click?)
        const clipX = clip.startTime * zoom;
        const offsetTime = (startX - clipX) / zoom;

        setDragState({
            clipId: clip.id,
            startX: e.clientX,
            startTime: clip.startTime,
            duration: clip.duration,
            trackId: clip.trackId,
            currentX: startX,
            currentTime: clip.startTime,
            currentTrackId: clip.trackId,
            offsetTime
        });
    }, [zoom, actions]);

    useEffect(() => {
        if (!dragState) {
            setSnapLines([]);
            return;
        }

        const handleMouseMove = (e: MouseEvent) => {
            const container = containerRef.current;
            if (!container) return;
            const rect = container.getBoundingClientRect();
            
            // 1. Calculate Raw Position
            const rawX = e.clientX - rect.left;
            const rawY = e.clientY - rect.top;

            // 2. Determine Track
            const trackIndex = Math.floor(rawY / TRACK_HEIGHT);
            const targetTrack = tracks[Math.max(0, Math.min(tracks.length - 1, trackIndex))];
            
            // 3. Calculate Time
            let newStartTime = (rawX / zoom) - dragState.offsetTime;
            newStartTime = Math.max(0, newStartTime);

            // 4. Snapping Logic
            const snapPoints: number[] = [0, currentTime]; // Always snap to 0 and Playhead
            
            // Add other clips' start/end points
            clips.forEach(c => {
                if (c.id === dragState.clipId) return; // Don't snap to self
                snapPoints.push(c.startTime);
                snapPoints.push(c.startTime + c.duration);
            });

            let bestSnapTime = newStartTime;
            let minDiff = SNAP_THRESHOLD_PX / zoom;
            let activeSnapLines: number[] = [];

            if (isSnapping) {
                // Snap Start
                for (const point of snapPoints) {
                    const diff = Math.abs(newStartTime - point);
                    if (diff < minDiff) {
                        minDiff = diff;
                        bestSnapTime = point;
                        activeSnapLines = [point];
                    }
                }

                // Snap End (if start didn't snap closely, or if end snap is closer)
                const endTime = newStartTime + dragState.duration;
                for (const point of snapPoints) {
                    const diff = Math.abs(endTime - point);
                    if (diff < minDiff) {
                        minDiff = diff;
                        bestSnapTime = point - dragState.duration;
                        activeSnapLines = [point];
                    }
                }
            }

            setDragState(prev => prev ? ({
                ...prev,
                currentX: rawX,
                currentTime: bestSnapTime,
                currentTrackId: targetTrack.id
            }) : null);
            
            setSnapLines(activeSnapLines);
        };

        const handleMouseUp = () => {
            // Commit changes
            if (dragState) {
                actions.updateClip(dragState.clipId, {
                    startTime: dragState.currentTime,
                    trackId: dragState.currentTrackId
                });
            }
            setDragState(null);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragState, clips, tracks, zoom, isSnapping, currentTime, actions, assets]);

    // --- Drop for new assets ---
    const handleDrop = (e: React.DragEvent, trackId: string) => {
        e.preventDefault();
        const track = tracks.find(t => t.id === trackId);
        if (!track || track.isLocked) return;

        const assetData = e.dataTransfer.getData('application/osve-asset');
        if (assetData) {
            try {
                const asset = JSON.parse(assetData);
                // Basic Type Check
                if (track.type === MediaType.VIDEO && asset.type === MediaType.AUDIO) return; 
                if (track.type === MediaType.AUDIO && asset.type !== MediaType.AUDIO) return; 

                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const time = Math.max(0, x / zoom);

                actions.addClip({
                    id: `clip-${Date.now()}`,
                    assetId: asset.id,
                    trackId,
                    startTime: time,
                    offset: 0,
                    duration: asset.duration,
                    name: asset.name,
                    effects: { ...DEFAULT_EFFECTS } 
                });
            } catch (err) { console.error(err); }
        }
    };

    return (
        <div ref={containerRef} className="flex flex-col min-h-full pb-10 relative">
            
            {/* 1. Snap Lines Layer (Behind clips) */}
            {snapLines.map(time => (
                 <div 
                    key={time}
                    className="absolute top-0 bottom-0 w-px bg-yellow-400 z-50 shadow-[0_0_8px_rgba(250,204,21,0.8)]"
                    style={{ left: time * zoom }}
                 />
            ))}

            {/* 2. Tracks */}
            {tracks.map(track => (
                <div 
                    key={track.id} 
                    className={`h-28 border-b border-osve-border/30 relative transition-colors box-border ${
                        track.isLocked ? 'bg-[repeating-linear-gradient(45deg,#111,#111_10px,#1a1a1a_10px,#1a1a1a_20px)] opacity-50' : 
                        (dragState?.currentTrackId === track.id ? 'bg-white/5' : 'bg-osve-bg')
                    }`}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => handleDrop(e, track.id)}
                >
                    {clips.filter(c => c.trackId === track.id).map(clip => {
                        // If this clip is being dragged, render it differently or hide it
                        const isDragging = dragState?.clipId === clip.id;
                        return (
                            <TimelineClip 
                                key={clip.id} 
                                clip={clip} 
                                zoom={zoom} 
                                isSelected={selectedClipId === clip.id}
                                isLocked={track.isLocked}
                                isDragging={isDragging}
                                onMouseDown={(e) => handleDragStart(e, clip)}
                                onUpdate={(updates) => actions.updateClip(clip.id, updates)}
                                isAudioTrack={track.type === MediaType.AUDIO}
                            />
                        );
                    })}
                </div>
            ))}

            {/* 3. Ghost/Phantom Clip (The one following mouse) */}
            {dragState && (() => {
                const clip = clips.find(c => c.id === dragState.clipId);
                const trackIndex = tracks.findIndex(t => t.id === dragState.currentTrackId);
                if (!clip || trackIndex === -1) return null;

                const topPos = trackIndex * TRACK_HEIGHT;
                const isAudio = tracks[trackIndex].type === MediaType.AUDIO;
                
                return (
                    <div 
                        className={`absolute h-[100px] rounded pointer-events-none z-[60] shadow-2xl flex items-center px-4 ring-2 ring-yellow-400
                            ${isAudio ? "bg-neutral-800/90 text-gray-300" : "bg-neutral-600/90 text-white"}
                        `}
                        style={{
                            top: topPos + 6, // Adjusted for h-28
                            left: dragState.currentTime * zoom,
                            width: clip.duration * zoom,
                            height: '100px' // 28rem - padding
                        }}
                    >
                         <div className="flex flex-col truncate w-full">
                             <span className="truncate font-bold text-sm drop-shadow-md">{clip.name}</span>
                             <span className="text-xs font-mono opacity-80">
                                 {formatTime(dragState.currentTime)}
                             </span>
                         </div>
                    </div>
                );
            })()}

        </div>
    );
});

// --- Timeline Clip Item ---

const TimelineClip: React.FC<{
    clip: Clip;
    zoom: number;
    isSelected: boolean;
    isLocked: boolean;
    isDragging: boolean;
    onMouseDown: (e: React.MouseEvent) => void;
    onUpdate: (u: Partial<Clip>) => void;
    isAudioTrack: boolean;
}> = memo(({ clip, zoom, isSelected, isLocked, isDragging, onMouseDown, onUpdate, isAudioTrack }) => {
    
    const handleDropEffect = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const effectData = e.dataTransfer.getData('application/osve-effect');
        if (effectData) {
            try {
                const preset = JSON.parse(effectData);
                onUpdate({ effects: { ...clip.effects, ...preset.updates } });
            } catch(e) {}
        }
    }

    let styleClass = "";
    if (isSelected) {
        styleClass = "bg-white text-black ring-2 ring-white z-10";
    } else {
        styleClass = isAudioTrack 
            ? "bg-neutral-800 text-gray-300 border border-neutral-700 hover:bg-neutral-700" 
            : "bg-neutral-600 text-white border border-neutral-500 hover:bg-neutral-500";
    }

    if (isDragging) {
        styleClass += " opacity-30 grayscale"; // Dim the original
    }

    const transitionInWidth = (clip.transition?.in?.type && clip.transition.in.type !== 'none') ? (clip.transition.in.duration * zoom) : 0;
    const transitionOutWidth = (clip.transition?.out?.type && clip.transition.out.type !== 'none') ? (clip.transition.out.duration * zoom) : 0;

    return (
        <div
            className={`absolute top-1 bottom-1 rounded overflow-hidden cursor-grab active:cursor-grabbing flex items-center px-3 select-none transition-all ${styleClass}`}
            style={{
                left: clip.startTime * zoom,
                width: Math.max(2, clip.duration * zoom), // Ensure visibility at low zoom
                minWidth: '2px'
            }}
            onMouseDown={!isLocked ? onMouseDown : undefined}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDropEffect}
        >
             {/* Clip Handle Left */}
             <div className="absolute left-0 top-0 bottom-0 w-4 hover:bg-white/20 cursor-w-resize z-20 group/handle-l">
                 <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/30 rounded-full group-hover/handle-l:bg-white/80" />
             </div>
             
             {/* Transition Indicators */}
             {transitionInWidth > 0 && (
                 <div 
                    className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-black/40 to-transparent border-r border-white/10 pointer-events-none"
                    style={{ width: Math.min(transitionInWidth, (clip.duration * zoom)) }}
                 />
             )}
             
             {transitionOutWidth > 0 && (
                 <div 
                    className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-black/40 to-transparent border-l border-white/10 pointer-events-none"
                    style={{ width: Math.min(transitionOutWidth, (clip.duration * zoom)) }}
                 />
             )}

             <div className="flex flex-col truncate pointer-events-none relative z-10 w-full pl-2">
                 {/* Only show text if wide enough */}
                 {clip.duration * zoom > 40 && (
                     <>
                        <span className="truncate text-sm font-bold leading-tight">
                            {clip.name}
                        </span>
                        {zoom > 30 && (
                            <span className="text-xs opacity-70 font-mono mt-0.5">
                                {clip.duration.toFixed(1)}s
                            </span>
                        )}
                     </>
                 )}
             </div>

             {/* Clip Handle Right */}
             <div className="absolute right-0 top-0 bottom-0 w-4 hover:bg-white/20 cursor-e-resize z-20 group/handle-r">
                 <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/30 rounded-full group-hover/handle-r:bg-white/80" />
             </div>
        </div>
    );
});

export const Playhead: React.FC<{ scrollRef: React.RefObject<HTMLDivElement> }> = ({ scrollRef }) => {
    const { state } = useProject();
    const { currentTime, zoom } = state;

    return (
        <div 
            className="absolute top-0 bottom-0 w-0.5 bg-white z-40 pointer-events-none transition-transform duration-75 linear will-change-transform drop-shadow-md"
            style={{ transform: `translateX(${currentTime * zoom}px)` }}
        >
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-white -ml-[7.5px]" />
            <div className="absolute top-0 bottom-0 w-[2px] bg-blue-400 opacity-50 blur-[1px]"></div>
        </div>
    );
};
