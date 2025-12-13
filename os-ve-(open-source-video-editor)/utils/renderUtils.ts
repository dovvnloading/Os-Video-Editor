
import { ProjectState, Clip, Asset, MediaType, TransitionConfig, TransitionType } from '../types';

/**
 * Calculates transition progress (0 to 1) and applies context transformations.
 */
const applyTransition = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
  type: TransitionType,
  isOut: boolean
) => {
  // For 'Out' transitions, progress goes 0 -> 1 (where 0 is start of exit, 1 is fully gone)
  // For 'In' transitions, progress goes 0 -> 1 (where 0 is fully invisible, 1 is fully visible)
  
  // Normalize p to represent "Visibility" (0 = invisible, 1 = visible)
  const p = isOut ? 1 - progress : progress;

  switch (type) {
    case 'fade':
      ctx.globalAlpha *= p;
      break;
    
    case 'slide-left': {
       const offset = isOut ? -width * progress : width * (1 - p);
       ctx.translate(offset, 0);
       break;
    }
    case 'slide-right': {
       const offset = isOut ? width * progress : -width * (1 - p);
       ctx.translate(offset, 0);
       break;
    }
    case 'slide-up': {
       const offset = isOut ? -height * progress : height * (1 - p);
       ctx.translate(0, offset);
       break;
    }
    case 'slide-down': {
       const offset = isOut ? height * progress : -height * (1 - p);
       ctx.translate(0, offset);
       break;
    }
    case 'zoom-in': {
        const scale = p;
        ctx.scale(scale, scale);
        break;
    }
    case 'zoom-out': {
        const scale = isOut ? 1 + progress : 2 - p;
        if (isOut) ctx.globalAlpha *= (1-progress);
        ctx.scale(scale, scale);
        break;
    }
    case 'wipe-left': {
        if (isOut) {
            ctx.rect(0, 0, width * p, height); 
        } else {
             ctx.rect(width * (1-p), 0, width * p, height);
        }
        ctx.clip();
        break;
    }
    case 'wipe-right': {
        const w = width * p;
        ctx.beginPath();
        ctx.rect(0, 0, w, height);
        ctx.clip();
        break;
    }
  }
};

/**
 * Renders a single frame of the project state to the provided Canvas Context.
 * Used by both the real-time Preview and the Export renderer.
 */
export const renderFrame = (
    ctx: CanvasRenderingContext2D,
    state: ProjectState,
    videoElements: Map<string, HTMLVideoElement>,
    imageElements: Map<string, HTMLImageElement>,
    overrideDimensions?: { width: number; height: number }
) => {
    // Allows rendering at different resolutions (e.g. 4K export) while keeping aspect logic
    const width = overrideDimensions?.width ?? state.width;
    const height = overrideDimensions?.height ?? state.height;
    const { clips, assets, tracks, currentTime } = state;

    // 1. Clear Canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // 2. Identify active clips & Sort by Track Order
    const activeClips = clips.filter(c => 
        currentTime >= c.startTime && currentTime < c.startTime + c.duration
    );

    const sortedClips = activeClips.map(clip => {
        const trackIndex = tracks.findIndex(t => t.id === clip.trackId);
        return { clip, trackIndex, track: tracks[trackIndex] };
    }).filter(item => item.track && !item.track.isHidden && !item.track.isMuted)
      .sort((a, b) => b.trackIndex - a.trackIndex);

    // 3. Render Loop
    for (const { clip, track } of sortedClips) {
        const asset = assets.find(a => a.id === clip.assetId);
        if (!asset) continue;
        if (asset.type === MediaType.AUDIO) continue;

        const relativeTime = (currentTime - clip.startTime) + clip.offset;

        let source: HTMLVideoElement | HTMLImageElement | null = null;
        
        if (asset.type === MediaType.VIDEO) {
            const videoEl = videoElements.get(asset.id);
            if (videoEl) {
                // Sync handled by caller usually
                source = videoEl;
            }
        } else if (asset.type === MediaType.IMAGE) {
            source = imageElements.get(asset.id) || null;
        }

        if (source) {
            ctx.save();

            // --- TRANSITION CALCULATIONS ---
            const timeIn = currentTime - clip.startTime;
            const timeOut = (clip.startTime + clip.duration) - currentTime;
            
            const centerX = width / 2;
            const centerY = height / 2;
            ctx.translate(centerX, centerY);

            // Handle In Transition
            if (clip.transition?.in && clip.transition.in.type !== 'none' && timeIn < clip.transition.in.duration) {
                const progress = Math.max(0, Math.min(1, timeIn / clip.transition.in.duration));
                applyTransition(ctx, width, height, progress, clip.transition.in.type, false);
            }

            // Handle Out Transition
            if (clip.transition?.out && clip.transition.out.type !== 'none' && timeOut < clip.transition.out.duration) {
                const progress = Math.max(0, Math.min(1, 1 - (timeOut / clip.transition.out.duration)));
                applyTransition(ctx, width, height, progress, clip.transition.out.type, true);
            }

            // --- CLIP TRANSFORMS ---
            ctx.rotate((clip.effects.rotation * Math.PI) / 180);
            ctx.scale(clip.effects.scale, clip.effects.scale);
            
            // Move back to top-left for drawing
            ctx.translate(-centerX, -centerY);


            // --- FILTERS ---
            const filterString = `
                blur(${clip.effects.blur}px) 
                grayscale(${clip.effects.grayscale}%) 
                sepia(${clip.effects.sepia}%) 
                invert(${clip.effects.invert}%) 
                brightness(${clip.effects.brightness}%) 
                contrast(${clip.effects.contrast}%) 
                saturate(${clip.effects.saturation}%) 
                hue-rotate(${clip.effects.hueRotate}deg)
            `;
            ctx.filter = filterString;
            ctx.globalAlpha *= clip.effects.opacity / 100; // Combine with transition alpha
            ctx.globalCompositeOperation = mapBlendMode(clip.effects.blendMode);

            // --- DRAW ---
            const srcW = (source instanceof HTMLVideoElement) ? source.videoWidth : source.width;
            const srcH = (source instanceof HTMLVideoElement) ? source.videoHeight : source.height;

            if (srcW && srcH) {
                const aspectSrc = srcW / srcH;
                const aspectCanvas = width / height;
                let drawW, drawH;

                if (aspectSrc > aspectCanvas) {
                    drawW = width;
                    drawH = width / aspectSrc;
                } else {
                    drawH = height;
                    drawW = height * aspectSrc;
                }
                
                const x = (width - drawW) / 2;
                const y = (height - drawH) / 2;

                ctx.drawImage(source, x, y, drawW, drawH);
            }

            // --- OVERLAYS (Tint / Vignette) ---
            if (clip.effects.tintIntensity > 0) {
                 ctx.globalCompositeOperation = 'overlay'; 
                 ctx.globalAlpha *= (clip.effects.tintIntensity / 100); 
                 ctx.fillStyle = clip.effects.tint;
                 ctx.fillRect(0, 0, width, height); 
            }

            if (clip.effects.vignette > 0) {
                ctx.globalCompositeOperation = 'source-over';
                ctx.globalAlpha = 1.0; 
                ctx.filter = 'none';

                const radius = Math.max(width, height) / 2;
                const gradient = ctx.createRadialGradient(width/2, height/2, radius * 0.5, width/2, height/2, radius);
                
                gradient.addColorStop(0, 'rgba(0,0,0,0)');
                gradient.addColorStop(1 - (100 - clip.effects.vignette)/100, `rgba(0,0,0, ${clip.effects.vignette/100})`);
                gradient.addColorStop(1, 'rgba(0,0,0,1)');

                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
            }

            ctx.restore();
        }
    }
};

const mapBlendMode = (mode: string): GlobalCompositeOperation => {
    if (mode === 'normal') return 'source-over';
    return mode as GlobalCompositeOperation;
};
