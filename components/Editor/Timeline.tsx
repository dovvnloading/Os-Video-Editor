
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useProject } from '../../store/ProjectContext';
import { ZoomInIcon, ZoomOutIcon, ScissorIcon, TrashIcon, MagnetIcon, PlayIcon, PauseIcon, PlusIcon, VideoIcon, AudioIcon } from '../UI/Icons';
import { TimelineRuler, TimelineTrackList, TimelineLanes, Playhead } from './TimelineComponents';
import ContextMenu from '../UI/ContextMenu';
import { MediaType } from '../../types';
import { MIN_ZOOM, MAX_ZOOM } from '../../constants';

const Timeline: React.FC = () => {
  const { state, dispatch, actions } = useProject();
  const { zoom, currentTime, duration, selectedClipId, isPlaying } = state;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const trackListRef = useRef<HTMLDivElement>(null);
  const [isSnapping, setIsSnapping] = useState(true);
  const [viewportWidth, setViewportWidth] = useState(0);

  // Measure viewport to fill screen
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
            setViewportWidth(entry.contentRect.width);
        }
    });
    observer.observe(scrollContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Syncs horizontal scroll for ruler/lanes AND vertical scroll for tracks
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // Sync vertical scroll of track headers
    if (trackListRef.current) {
        trackListRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleZoom = (delta: number) => {
    dispatch({ type: 'SET_ZOOM', payload: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta)) });
  };
  
  const handleFitZoom = () => {
      // Calculate zoom needed to fit duration into viewport (with 10% padding)
      if (viewportWidth > 0 && duration > 0) {
          const fitZoom = (viewportWidth - 40) / duration;
          dispatch({ type: 'SET_ZOOM', payload: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, fitZoom)) });
      }
  };

  // Calculate dynamic width: ensure it's at least the viewport width to prevent "stopping" feeling
  const contentWidth = Math.max((duration + 60) * zoom, viewportWidth);

  // --- Keyboard Handling for Timeline Specifics ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcut triggering when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
          e.preventDefault();
          actions.playPause();
      }
      if (e.code === 'Delete' && selectedClipId) {
          actions.deleteClip(selectedClipId);
      }
      if (e.key === 's') {
          if (selectedClipId) dispatch({ type: 'SPLIT_CLIP', payload: { clipId: selectedClipId, time: currentTime } });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions, selectedClipId, currentTime, dispatch]);

  return (
    <div className="flex flex-col h-full bg-osve-bg select-none border-t border-osve-border">
      
      {/* Timeline Toolbar - Increased Height to h-14 */}
      <div className="h-14 bg-osve-panel border-b border-osve-border flex items-center px-6 justify-between shrink-0 relative z-30">
        
        {/* GROUP 1: Tools & Tracks */}
        <div className="flex items-center gap-6">
            {/* Add Tracks Control */}
            <div className="flex items-center bg-[#111] p-1 rounded border border-osve-border gap-1">
                <button 
                    onClick={() => actions.addTrack(MediaType.VIDEO)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 rounded transition-all"
                    title="Add Video Track"
                >
                    <PlusIcon className="w-4 h-4" />
                    <span>VID</span>
                </button>
                <div className="w-px h-5 bg-osve-border mx-1" />
                <button 
                    onClick={() => actions.addTrack(MediaType.AUDIO)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 rounded transition-all"
                    title="Add Audio Track"
                >
                    <PlusIcon className="w-4 h-4" />
                    <span>AUD</span>
                </button>
            </div>

            {/* Editing Tools */}
            <div className="flex items-center bg-[#111] p-1 rounded border border-osve-border gap-1">
                <button 
                    onClick={() => selectedClipId && dispatch({ type: 'SPLIT_CLIP', payload: { clipId: selectedClipId, time: currentTime } })}
                    disabled={!selectedClipId}
                    className="p-2 rounded hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-gray-400 hover:text-white transition-colors"
                    title="Split Clip (S)"
                >
                    <ScissorIcon className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => selectedClipId && actions.deleteClip(selectedClipId)}
                    disabled={!selectedClipId}
                    className="p-2 rounded hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete Clip (Del)"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
                
                <div className="w-px h-5 bg-osve-border mx-2" />

                {/* Snap Toggle - High Visibility */}
                <button 
                    onClick={() => setIsSnapping(!isSnapping)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                        isSnapping 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-gray-500 hover:bg-white/10 hover:text-gray-300'
                    }`}
                    title="Toggle Magnet Snapping"
                >
                    <MagnetIcon className="w-4 h-4" />
                    <span className={isSnapping ? 'opacity-100' : 'opacity-0 hidden sm:inline'}>SNAP</span>
                </button>
            </div>
        </div>

        {/* GROUP 2: Transport (Center) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4">
             <div className="bg-black px-4 py-2 rounded border border-osve-border min-w-[100px] text-center shadow-inner">
               <span className="text-sm font-mono text-blue-400 font-bold">{(currentTime || 0).toFixed(2)}s</span>
             </div>
             
             <button 
                 onClick={() => actions.playPause()}
                 className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-md"
                 title={isPlaying ? "Pause (Space)" : "Play (Space)"}
             >
                 {isPlaying ? <PauseIcon className="w-5 h-5 fill-current" /> : <PlayIcon className="w-5 h-5 ml-0.5 fill-current" />}
             </button>
        </div>

        {/* GROUP 3: View Controls */}
        <div className="flex items-center gap-3">
            <button 
                onClick={handleFitZoom}
                className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded font-bold uppercase tracking-wider"
                title="Fit Timeline to Screen"
            >
                Fit
            </button>
            <div className="flex items-center bg-[#111] p-1.5 rounded border border-osve-border gap-3">
                <button onClick={() => handleZoom(-10)} className="text-gray-500 hover:text-white p-1"><ZoomOutIcon className="w-5 h-5"/></button>
                <input 
                    type="range" 
                    min={MIN_ZOOM} 
                    max={MAX_ZOOM} 
                    value={zoom}
                    onChange={(e) => dispatch({ type: 'SET_ZOOM', payload: Number(e.target.value) })}
                    className="w-24 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-400 hover:accent-white"
                />
                <button onClick={() => handleZoom(10)} className="text-gray-500 hover:text-white p-1"><ZoomInIcon className="w-5 h-5"/></button>
            </div>
        </div>
      </div>

      {/* Main Timeline Area */}
      <div className="flex-1 flex overflow-hidden relative">
          
          {/* Left: Track Headers - Increased width to 180px */}
          <div className="w-[180px] bg-osve-panel border-r border-osve-border shrink-0 flex flex-col z-20 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">
              <div className="h-8 border-b border-osve-border bg-[#111] shrink-0" /> {/* Spacer for ruler */}
              <div ref={trackListRef} className="flex-1 overflow-hidden"> {/* Scroll controlled by right side */}
                  <TimelineTrackList />
              </div>
          </div>

          {/* Right: Ruler & Lanes */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-auto bg-[#080808] relative flex flex-col"
            onScroll={handleScroll}
          >
              <TimelineRuler width={contentWidth} />
              
              <div className="relative flex-1" style={{ width: contentWidth }}>
                  <Playhead scrollRef={scrollContainerRef} />
                  <TimelineLanes isSnapping={isSnapping} />
              </div>
          </div>
      </div>
    </div>
  );
};

export default Timeline;
