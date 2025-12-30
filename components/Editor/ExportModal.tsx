
import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '../../store/ProjectContext';
import { renderFrame } from '../../utils/renderUtils';
import { LoaderIcon, XIcon, VideoIcon, ArrowDownIcon, SettingsIcon, RefreshIcon, CheckIcon, ClockIcon, FileIcon } from '../UI/Icons';
import { MediaType } from '../../types';

interface ExportModalProps {
    onClose: () => void;
}

type OutputFormat = 'webm' | 'mp4';
type QualityPreset = 'Draft' | 'Low' | 'Medium' | 'High' | 'Ultra' | '4K' | 'Custom';

const QUALITY_BITRATES: Record<QualityPreset, number> = {
    'Draft': 1_000_000,
    'Low': 2_500_000,
    'Medium': 5_000_000,
    'High': 8_000_000,
    'Ultra': 15_000_000,
    '4K': 45_000_000,
    'Custom': 5_000_000
};

const ExportModal: React.FC<ExportModalProps> = ({ onClose }) => {
    const { state, actions } = useProject();
    const { duration, assets, clips } = state;

    // --- State: Job Settings ---
    const [fileName, setFileName] = useState('My_Project');
    const [format, setFormat] = useState<OutputFormat>('webm');
    const [resolution, setResolution] = useState<{w: number, h: number, label: string}>({ w: state.width, h: state.height, label: 'Native' });
    const [fps, setFps] = useState(30);
    const [quality, setQuality] = useState<QualityPreset>('High');
    const [bitrate, setBitrate] = useState(QUALITY_BITRATES['High']);
    const [audioBitrate, setAudioBitrate] = useState(128000); // 128 kbps
    const [showPreview, setShowPreview] = useState(true);

    // --- State: Rendering ---
    const [status, setStatus] = useState<'idle' | 'rendering' | 'completed' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [stats, setStats] = useState({
        elapsedTime: 0,
        remainingTime: 0,
        fps: 0,
        currentFrame: 0,
        totalFrames: 0
    });

    // --- Refs ---
    const canvasRef = useRef<HTMLCanvasElement>(null); // For render loop
    const previewCanvasRef = useRef<HTMLCanvasElement>(null); // For visible preview
    const videoElementsRef = useRef<Map<string, HTMLVideoElement>>(new Map());
    const imageElementsRef = useRef<Map<string, HTMLImageElement>>(new Map());
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const frameIdRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);

    // Initialize Asset Cache
    useEffect(() => {
        assets.forEach(asset => {
            if (asset.type === MediaType.VIDEO && !videoElementsRef.current.has(asset.id)) {
                const el = document.createElement('video');
                el.src = asset.url;
                el.crossOrigin = "anonymous";
                el.muted = true;
                el.preload = "auto";
                videoElementsRef.current.set(asset.id, el);
            } else if (asset.type === MediaType.IMAGE && !imageElementsRef.current.has(asset.id)) {
                const el = new Image();
                el.src = asset.url;
                el.crossOrigin = "anonymous";
                imageElementsRef.current.set(asset.id, el);
            }
        });

        // Determine best default format
        if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E,mp4a.40.2')) {
            setFormat('mp4');
        }

        // Cleanup
        return () => stopExport();
    }, [assets]);

    // Update bitrate when preset changes
    useEffect(() => {
        if (quality !== 'Custom') {
            setBitrate(QUALITY_BITRATES[quality]);
        }
    }, [quality]);

    const stopExport = () => {
        if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
    };

    const handleStartExport = () => {
        setStatus('rendering');
        actions.playPause(); // Pause editor
        actions.seek(0);

        // 1. Setup Canvas
        const canvas = document.createElement('canvas');
        canvas.width = resolution.w;
        canvas.height = resolution.h;
        canvasRef.current = canvas;

        // 2. Setup Stream & Recorder
        const stream = canvas.captureStream(fps);
        
        let mimeType = 'video/webm;codecs=vp9,opus';
        if (format === 'mp4') {
            if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E,mp4a.40.2')) {
                mimeType = 'video/mp4;codecs=avc1.42E01E,mp4a.40.2';
            } else if (MediaRecorder.isTypeSupported('video/mp4')) {
                mimeType = 'video/mp4';
            } else {
                setFormat('webm'); // Fallback
            }
        }

        try {
            const recorder = new MediaRecorder(stream, {
                mimeType,
                videoBitsPerSecond: bitrate,
                audioBitsPerSecond: audioBitrate
            });

            const chunks: Blob[] = [];
            recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
            
            recorder.onstop = () => {
                if (status === 'error') return;
                const blob = new Blob(chunks, { type: mimeType.split(';')[0] });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${fileName}.${format}`;
                a.click();
                setStatus('completed');
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            
            // 3. Start Render Loop
            startTimeRef.current = performance.now();
            processFrame(0, 0);

        } catch (e) {
            console.error(e);
            setStatus('error');
        }
    };

    const processFrame = async (frameIndex: number, currentTime: number) => {
        const canvas = canvasRef.current;
        const recorder = mediaRecorderRef.current;
        
        if (!canvas || !recorder || recorder.state === 'inactive') return;

        // End condition
        if (currentTime >= duration) {
            recorder.stop();
            return;
        }

        // --- A. Render Frame ---
        const renderState = { ...state, currentTime };
        
        // Sync Videos
        for (const [id, videoEl] of videoElementsRef.current.entries()) {
            const clip = state.clips.find(c => c.assetId === id && currentTime >= c.startTime && currentTime < c.startTime + c.duration);
            if (clip) {
                const relTime = (currentTime - clip.startTime) + clip.offset;
                videoEl.currentTime = relTime;
            }
        }

        // Draw to Offscreen Canvas (The one being recorded)
        const ctx = canvas.getContext('2d');
        if (ctx) {
            renderFrame(ctx, renderState, videoElementsRef.current, imageElementsRef.current, { width: resolution.w, height: resolution.h });
        }

        // Copy to Preview Canvas (Visible in UI)
        if (showPreview && previewCanvasRef.current) {
            const pCtx = previewCanvasRef.current.getContext('2d');
            if (pCtx) {
                pCtx.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
                pCtx.drawImage(canvas, 0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
            }
        }

        // --- B. Update Stats ---
        const now = performance.now();
        const elapsed = (now - startTimeRef.current) / 1000;
        const totalFrames = Math.ceil(duration * fps);
        const currentFps = frameIndex / elapsed || 0;
        const remaining = (totalFrames - frameIndex) / currentFps || 0;

        setStats({
            elapsedTime: elapsed,
            remainingTime: remaining,
            fps: currentFps,
            currentFrame: frameIndex + 1,
            totalFrames
        });
        setProgress(((frameIndex + 1) / totalFrames) * 100);
        
        frameIdRef.current = requestAnimationFrame(() => {
             processFrame(frameIndex + 1, currentTime + (1 / fps));
        });
    };

    // --- Helpers ---
    const formatTime = (s: number) => {
        if (!isFinite(s) || isNaN(s)) return '--:--';
        const mins = Math.floor(s / 60);
        const secs = Math.floor(s % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const estimatedFileSize = ((bitrate + audioBitrate) * duration) / 8; // bytes

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-sans">
            <div className="bg-[#121212] border border-osve-border rounded-sm w-[900px] h-[600px] shadow-2xl flex flex-col overflow-hidden">
                
                {/* 1. Header */}
                <div className="h-14 bg-[#1a1a1a] border-b border-osve-border flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-sm bg-osve-active flex items-center justify-center border border-osve-border">
                            <SettingsIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-gray-200 uppercase tracking-widest">Render Queue</h2>
                            <p className="text-[10px] text-gray-500 font-mono">Os-Ve Export Module</p>
                        </div>
                    </div>
                    {status !== 'rendering' && (
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors">
                            <XIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* 2. Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    
                    {/* LEFT: Settings Panel */}
                    <div className="w-[400px] bg-osve-panel border-r border-osve-border flex flex-col overflow-y-auto custom-scrollbar">
                        
                        {/* File Output Section */}
                        <div className="p-6 border-b border-osve-border">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <FileIcon className="w-3 h-3" /> Output File
                            </label>
                            <div className="flex gap-2 mb-3">
                                <input 
                                    type="text" 
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                    disabled={status === 'rendering'}
                                    className="flex-1 bg-black border border-osve-border rounded-sm px-3 py-2 text-xs text-white focus:border-white outline-none font-medium placeholder-gray-600 transition-colors"
                                    placeholder="Filename"
                                />
                                <div className="w-20 flex items-center justify-center bg-osve-active border border-osve-border rounded-sm text-xs text-gray-400 font-mono select-none">
                                    .{format}
                                </div>
                            </div>
                            <div className="text-[10px] text-gray-500 flex justify-between">
                                <span>Save to: Downloads/</span>
                                <span className={estimatedFileSize > 100_000_000 ? 'text-white' : 'text-gray-400'}>
                                    Est: ~{(estimatedFileSize / 1024 / 1024).toFixed(1)} MB
                                </span>
                            </div>
                        </div>

                        {/* Video Settings Section */}
                        <div className="p-6 border-b border-osve-border space-y-6">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <VideoIcon className="w-3 h-3" /> Video Config
                                </label>
                                <span className="text-[9px] text-gray-500 bg-black px-1.5 py-0.5 rounded-sm border border-osve-border">H.264 / VP9</span>
                            </div>

                            {/* Preset Grid */}
                            <div className="grid grid-cols-2 gap-2">
                                {(['Draft', 'Low', 'Medium', 'High', 'Ultra', '4K'] as QualityPreset[]).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setQuality(p)}
                                        disabled={status === 'rendering'}
                                        className={`px-3 py-2 text-xs font-medium rounded-sm border transition-all text-left flex justify-between group ${
                                            quality === p 
                                            ? 'bg-white border-white text-black' 
                                            : 'bg-black border-osve-border text-gray-400 hover:border-gray-500'
                                        }`}
                                    >
                                        <span>{p}</span>
                                        {quality === p && <CheckIcon className="w-3 h-3" />}
                                    </button>
                                ))}
                            </div>

                            {/* Resolution & FPS */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] text-gray-500 uppercase mb-1.5 font-bold">Resolution</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full bg-black border border-osve-border rounded-sm p-2 text-xs text-gray-200 outline-none focus:border-white appearance-none disabled:opacity-50"
                                            value={`${resolution.w},${resolution.h}`}
                                            onChange={(e) => {
                                                const [w, h] = e.target.value.split(',');
                                                const label = e.target.selectedOptions[0].text;
                                                setResolution({ w: parseInt(w), h: parseInt(h), label });
                                            }}
                                            disabled={status === 'rendering'}
                                        >
                                            <option value={`${state.width},${state.height}`}>Native ({state.width}x{state.height})</option>
                                            <option value="1920,1080">1080p FHD</option>
                                            <option value="2560,1440">1440p QHD</option>
                                            <option value="3840,2160">2160p 4K</option>
                                            <option value="1280,720">720p HD</option>
                                            <option value="1080,1350">IG Portrait (4:5)</option>
                                            <option value="1080,1920">TikTok (9:16)</option>
                                        </select>
                                        <ArrowDownIcon className="w-3 h-3 text-gray-500 absolute right-2 top-2.5 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[9px] text-gray-500 uppercase mb-1.5 font-bold">Framerate</label>
                                    <div className="flex bg-black rounded-sm border border-osve-border p-0.5">
                                        {[24, 30, 60].map(r => (
                                            <button
                                                key={r}
                                                onClick={() => setFps(r)}
                                                disabled={status === 'rendering'}
                                                className={`flex-1 py-1.5 text-[10px] font-bold rounded-sm transition-colors ${
                                                    fps === r 
                                                    ? 'bg-white text-black shadow-sm' 
                                                    : 'text-gray-500 hover:text-gray-300'
                                                }`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Advanced Bitrate Slider */}
                            <div className="bg-black p-3 rounded-sm border border-osve-border">
                                <div className="flex justify-between text-[10px] text-gray-400 mb-2">
                                    <span>Target Bitrate</span>
                                    <span className="font-mono text-white">{(bitrate / 1_000_000).toFixed(1)} Mbps</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="1000000" 
                                    max="50000000" 
                                    step="500000" 
                                    value={bitrate}
                                    onChange={(e) => {
                                        setBitrate(Number(e.target.value));
                                        setQuality('Custom');
                                    }}
                                    disabled={status === 'rendering'}
                                    className="w-full h-1 bg-osve-border rounded-lg appearance-none cursor-pointer accent-white"
                                />
                            </div>
                        </div>

                        {/* Output Module (Format) */}
                        <div className="p-6">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 block">Container Format</label>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setFormat('mp4')}
                                    disabled={status === 'rendering'}
                                    className={`flex-1 py-3 px-4 rounded-sm border text-left transition-all relative overflow-hidden group ${
                                        format === 'mp4' 
                                        ? 'bg-white border-white text-black' 
                                        : 'bg-black border-osve-border text-gray-400 hover:border-gray-500'
                                    }`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div>
                                            <div className="text-xs font-bold mb-0.5">MP4</div>
                                            <div className={`text-[9px] ${format === 'mp4' ? 'text-gray-600' : 'text-gray-600'}`}>Universal Compatibility</div>
                                        </div>
                                        <VideoIcon className={`w-5 h-5 ${format === 'mp4' ? 'text-black opacity-100' : 'text-gray-600 group-hover:text-gray-400'}`} />
                                    </div>
                                </button>
                                <button 
                                    onClick={() => setFormat('webm')}
                                    disabled={status === 'rendering'}
                                    className={`flex-1 py-3 px-4 rounded-sm border text-left transition-all relative overflow-hidden group ${
                                        format === 'webm' 
                                        ? 'bg-white border-white text-black' 
                                        : 'bg-black border-osve-border text-gray-400 hover:border-gray-500'
                                    }`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div>
                                            <div className="text-xs font-bold mb-0.5">WebM</div>
                                            <div className={`text-[9px] ${format === 'webm' ? 'text-gray-600' : 'text-gray-600'}`}>Efficient & Web Ready</div>
                                        </div>
                                        <VideoIcon className={`w-5 h-5 ${format === 'webm' ? 'text-black opacity-100' : 'text-gray-600 group-hover:text-gray-400'}`} />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Preview & Progress */}
                    <div className="flex-1 bg-[#050505] flex flex-col relative">
                        {/* Preview Area */}
                        <div className="flex-1 flex items-center justify-center p-8 bg-black relative overflow-hidden">
                             <div className="relative z-10 shadow-2xl shadow-black rounded-sm overflow-hidden border border-osve-border bg-black">
                                <canvas 
                                    ref={previewCanvasRef}
                                    width={480}
                                    height={480 * (resolution.h / resolution.w)}
                                    className="block max-w-full max-h-[300px]"
                                />
                                {status === 'idle' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                        <div className="text-center">
                                            <p className="text-gray-400 text-xs font-mono mb-2">Preview Unavailable</p>
                                            <p className="text-[10px] text-gray-600">Start render to view</p>
                                        </div>
                                    </div>
                                )}
                             </div>

                             {/* Render Stats Overlay */}
                             <div className="absolute top-4 right-4 bg-black/80 backdrop-blur border border-white/20 p-3 rounded-sm text-xs font-mono space-y-2 min-w-[140px]">
                                 <div className="flex justify-between text-gray-400">
                                     <span>FPS</span>
                                     <span className="text-white">{Math.round(stats.fps)}</span>
                                 </div>
                                 <div className="flex justify-between text-gray-400">
                                     <span>Elapsed</span>
                                     <span className="text-white">{formatTime(stats.elapsedTime)}</span>
                                 </div>
                                 <div className="flex justify-between text-gray-400">
                                     <span>Remaining</span>
                                     <span className="text-white">{formatTime(stats.remainingTime)}</span>
                                 </div>
                             </div>
                        </div>

                        {/* Progress Footer */}
                        <div className="h-24 bg-osve-panel border-t border-osve-border p-4 flex gap-4 items-center shrink-0">
                            {status === 'rendering' ? (
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-gray-300">
                                        <span className="flex items-center gap-2"><LoaderIcon className="w-3 h-3 text-white"/> Rendering...</span>
                                        <span>{progress.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-osve-border">
                                        <div 
                                            className="h-full bg-white animate-pulse"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            ) : status === 'completed' ? (
                                <div className="flex-1 flex items-center gap-3 text-white">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                        <CheckIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Render Complete</p>
                                        <p className="text-xs text-gray-400">File saved successfully.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Ready to process {duration.toFixed(1)}s of video.</p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                {status === 'rendering' ? (
                                    <button 
                                        onClick={stopExport}
                                        className="px-6 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors"
                                    >
                                        Cancel
                                    </button>
                                ) : status === 'completed' ? (
                                    <button 
                                        onClick={() => setStatus('idle')}
                                        className="px-6 py-2 bg-osve-active hover:bg-osve-border text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                                    >
                                        <RefreshIcon className="w-3 h-3" /> New Render
                                    </button>
                                ) : (
                                    <>
                                        <button 
                                            onClick={onClose}
                                            className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-white transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleStartExport}
                                            className="px-8 py-2 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-wider rounded-sm shadow-sm transition-all flex items-center gap-2"
                                        >
                                            <VideoIcon className="w-3 h-3" /> Render
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;
