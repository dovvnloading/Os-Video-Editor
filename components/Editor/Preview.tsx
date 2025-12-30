
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ProjectState, MediaType } from '../../types';
import { ZoomInIcon, ZoomOutIcon } from '../UI/Icons';
import { renderFrame } from '../../utils/renderUtils';

interface PreviewProps {
  project: ProjectState;
  onUpdateProject: (updates: Partial<ProjectState>) => void;
  onTogglePlay: () => void;
}

const RATIOS = [
    { label: '16:9 Landscape', width: 1920, height: 1080 },
    { label: '9:16 Portrait', width: 1080, height: 1920 },
    { label: '4:5 Social', width: 1080, height: 1350 },
    { label: '1:1 Square', width: 1080, height: 1080 },
];

/**
 * High-Performance Canvas Preview Engine.
 */
const Preview: React.FC<PreviewProps> = ({ project, onUpdateProject, onTogglePlay }) => {
  const { width, height, assets } = project;
  
  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Media Cache
  const videoElementsRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const imageElementsRef = useRef<Map<string, HTMLImageElement>>(new Map());
  
  // State Ref for Animation Loop
  // This decoupling prevents the render loop from stopping/starting on every React render
  const projectRef = useRef(project);
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  // Viewport State
  const [viewZoom, setViewZoom] = useState(0.5); 
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasFittedRef = useRef(false);

  // --- Media Resource Management ---

  useEffect(() => {
      assets.forEach(asset => {
          if (asset.type === MediaType.VIDEO) {
              if (!videoElementsRef.current.has(asset.id)) {
                  const el = document.createElement('video');
                  el.src = asset.url;
                  el.muted = true; 
                  el.playsInline = true;
                  el.preload = 'auto';
                  videoElementsRef.current.set(asset.id, el);
              }
          } else if (asset.type === MediaType.IMAGE) {
              if (!imageElementsRef.current.has(asset.id)) {
                  const el = new Image();
                  el.src = asset.url;
                  imageElementsRef.current.set(asset.id, el);
              }
          }
      });
  }, [assets]);

  // --- Rendering Loop ---

  useEffect(() => {
      let animationFrameId: number;

      const render = () => {
          const currentProject = projectRef.current;
          const { isPlaying, currentTime, clips, tracks } = currentProject;
          const canvas = canvasRef.current;

          // 1. Sync Video Elements
          const activeClips = clips.filter(c => 
            currentTime >= c.startTime && currentTime < c.startTime + c.duration
          );

          activeClips.forEach(clip => {
              const asset = currentProject.assets.find(a => a.id === clip.assetId);
              if (asset && asset.type === MediaType.VIDEO) {
                  const el = videoElementsRef.current.get(asset.id);
                  if (el) {
                      const track = tracks.find(t => t.id === clip.trackId);
                      el.muted = track?.isMuted ?? false;
                      el.volume = track?.isMuted ? 0 : (clip.effects.volume ?? 100) / 100;

                      const relativeTime = (currentTime - clip.startTime) + clip.offset;
                      
                      // Sync Time (Allow some drift for smooth playback)
                      if (Math.abs(el.currentTime - relativeTime) > 0.3) {
                          el.currentTime = relativeTime;
                      }

                      // Sync Play/Pause
                      if (isPlaying && el.paused) {
                          el.play().catch(() => {});
                      } else if (!isPlaying && !el.paused) {
                          el.pause();
                      }
                  }
              }
          });
          
          // Pause inactive videos
          videoElementsRef.current.forEach((el, id) => {
              const isActive = activeClips.some(c => c.assetId === id);
              if (!isActive && !el.paused) {
                  el.pause();
              }
          });

          // 2. Render to Canvas
          if (canvas) {
              const ctx = canvas.getContext('2d');
              if (ctx) {
                  renderFrame(ctx, currentProject, videoElementsRef.current, imageElementsRef.current);
              }
          }

          animationFrameId = requestAnimationFrame(render);
      };

      // Start Loop
      render();

      return () => cancelAnimationFrame(animationFrameId);
  }, []); // Run ONCE, depend on refs

  // --- Viewport Logic ---
  const handleFit = useCallback(() => {
      if (containerRef.current) {
          const { clientWidth, clientHeight } = containerRef.current;
          if (clientWidth <= 0) return;
          const padding = 40;
          const scaleX = (clientWidth - padding) / width;
          const scaleY = (clientHeight - padding) / height;
          setViewZoom(Math.max(0.1, Math.min(scaleX, scaleY)));
          setPan({ x: 0, y: 0 });
          hasFittedRef.current = true;
      }
  }, [width, height]);

  useEffect(() => {
    if (!hasFittedRef.current && containerRef.current) handleFit();
  }, [handleFit]);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] relative overflow-hidden">
        
        {/* Toolbar - Increased height and button sizes */}
        <div className="h-14 bg-osve-panel border-b border-osve-border flex items-center px-6 justify-between shrink-0 z-20">
            <div className="flex items-center gap-4">
                <select 
                    className="bg-slate-900 border border-slate-700 text-sm text-gray-300 rounded px-3 py-1.5 outline-none focus:border-indigo-500"
                    value={`${width}x${height}`}
                    onChange={(e) => onUpdateProject({ width: Number(e.target.value.split('x')[0]), height: Number(e.target.value.split('x')[1]) })}
                >
                    {RATIOS.map(r => (
                        <option key={r.label} value={`${r.width}x${r.height}`}>{r.label}</option>
                    ))}
                </select>
                <div className="w-px h-6 bg-gray-700 mx-1"></div>
                <button onClick={() => setViewZoom(z => Math.max(0.1, z - 0.1))} className="p-2 hover:text-white text-gray-400"><ZoomOutIcon className="w-5 h-5"/></button>
                <span className="text-sm font-mono w-14 text-center text-gray-300">{Math.round(viewZoom * 100)}%</span>
                <button onClick={() => setViewZoom(z => Math.min(5, z + 0.1))} className="p-2 hover:text-white text-gray-400"><ZoomInIcon className="w-5 h-5"/></button>
                <button onClick={handleFit} className="text-xs ml-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-gray-300 font-bold uppercase">Fit</button>
            </div>
            
            <div className="text-xs text-gray-500 font-mono">
                {isPanning ? 'Panning...' : 'Shift+Drag to Pan'}
            </div>
        </div>

        {/* Viewport Area */}
        <div 
            ref={containerRef}
            className={`flex-1 relative overflow-hidden outline-none ${isPanning ? 'cursor-grabbing' : 'cursor-default'}`}
            style={{ 
                backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                backgroundColor: '#131313'
            }}
            onMouseDown={(e) => {
                if (e.button === 1 || e.shiftKey) { 
                    e.preventDefault();
                    setIsPanning(true);
                    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
                }
            }}
            onMouseMove={(e) => {
                if (isPanning) {
                    setPan({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y });
                }
            }}
            onMouseUp={() => setIsPanning(false)}
            onMouseLeave={() => setIsPanning(false)}
            onWheel={(e) => {
                if (e.ctrlKey) {
                     e.preventDefault();
                     setViewZoom(z => Math.max(0.1, z - e.deltaY * 0.001));
                } else {
                     setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
                }
            }}
        >
            <div 
                className="absolute top-1/2 left-1/2 transition-transform duration-75 origin-center will-change-transform"
                style={{
                    transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${viewZoom})`,
                    width: width,
                    height: height,
                }}
            >
                <canvas 
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className="w-full h-full bg-black shadow-2xl"
                    style={{ boxShadow: '0 0 0 1px #333, 0 20px 50px rgba(0,0,0,0.5)' }}
                />
            </div>
        </div>
    </div>
  );
};

export default Preview;
