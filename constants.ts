
import { ClipEffects, MediaType } from './types';

export const DEFAULT_ZOOM = 50; // pixels per second
export const MIN_ZOOM = 0.5; // 1 second takes 0.5 pixels (Good for long timelines)
export const MAX_ZOOM = 200; // 1 second takes 200 pixels (Good for detailed editing)

export const DEFAULT_PROJECT_WIDTH = 1920;
export const DEFAULT_PROJECT_HEIGHT = 1080;
export const DEFAULT_DURATION = 300; // 5 minutes

export const DEFAULT_EFFECTS: ClipEffects = {
  opacity: 100,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  invert: 0,
  brightness: 100,
  contrast: 100,
  scale: 1,
  rotation: 0,
  volume: 100,
  saturation: 100,
  hueRotate: 0,
  blendMode: 'normal',
  vignette: 0,
  tint: '#6366f1',
  tintIntensity: 0,
};

export const INITIAL_TRACKS = [
  { id: 'track-v1', name: 'Video 1', isMuted: false, isHidden: false, isLocked: false, type: MediaType.VIDEO },
  { id: 'track-v2', name: 'Video 2', isMuted: false, isHidden: false, isLocked: false, type: MediaType.VIDEO },
  { id: 'track-a1', name: 'Audio 1', isMuted: false, isHidden: false, isLocked: false, type: MediaType.AUDIO },
];
