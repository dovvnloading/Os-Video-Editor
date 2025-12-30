

export enum MediaType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO'
}

export interface Asset {
  id: string;
  name: string;
  type: MediaType;
  url: string; // Blob URL
  duration: number; // In seconds
  thumbnail?: string;
}

export type TransitionType = 
  | 'none' 
  | 'fade' 
  | 'slide-left' 
  | 'slide-right' 
  | 'slide-up' 
  | 'slide-down' 
  | 'zoom-in' 
  | 'zoom-out' 
  | 'wipe-left' 
  | 'wipe-right';

export interface TransitionConfig {
  type: TransitionType;
  duration: number; // seconds
}

export interface Clip {
  id: string;
  assetId: string;
  trackId: string;
  startTime: number; // Where it starts on the timeline (seconds)
  offset: number; // Start point within the source media (trim start)
  duration: number; // Length on timeline
  name: string;
  effects: ClipEffects;
  transition?: {
    in: TransitionConfig;
    out: TransitionConfig;
  };
}

export type BlendMode = 
  | 'normal' 
  | 'multiply' 
  | 'screen' 
  | 'overlay' 
  | 'darken' 
  | 'lighten' 
  | 'color-dodge' 
  | 'color-burn' 
  | 'hard-light' 
  | 'soft-light' 
  | 'difference' 
  | 'exclusion' 
  | 'hue' 
  | 'saturation' 
  | 'color' 
  | 'luminosity';

export interface ClipEffects {
  opacity: number; // 0-100
  blur: number; // px
  grayscale: number; // 0-100
  sepia: number; // 0-100
  invert: number; // 0-100
  brightness: number; // 0-200 (100 is default)
  contrast: number; // 0-200 (100 is default)
  scale: number; // 0-5 (1 is default)
  rotation: number; // degrees
  volume: number; // 0-100
  saturation: number; // 0-200 (100 default)
  hueRotate: number; // degrees
  blendMode: BlendMode;
  
  // New Effects
  vignette: number; // 0-100
  tint: string; // Hex Color
  tintIntensity: number; // 0-100
}

export interface Track {
  id: string;
  name: string;
  isMuted: boolean;
  isHidden: boolean;
  isLocked: boolean;
  type: MediaType;
}

export interface ProjectState {
  assets: Asset[];
  tracks: Track[];
  clips: Clip[];
  currentTime: number; // Playhead position in seconds
  duration: number; // Total project duration
  isPlaying: boolean;
  zoom: number; // Pixels per second
  selectedClipId: string | null;
  width: number; // Canvas Width
  height: number; // Canvas Height
}

export type Action =
  | { type: 'SET_PROJECT'; payload: Partial<ProjectState> }
  | { type: 'ADD_ASSET'; payload: Asset }
  | { type: 'REMOVE_ASSET'; payload: string }
  | { type: 'ADD_CLIP'; payload: Clip }
  | { type: 'UPDATE_CLIP'; payload: { id: string; updates: Partial<Clip> } }
  | { type: 'REMOVE_CLIP'; payload: string }
  | { type: 'SET_SELECTION'; payload: string | null }
  | { type: 'SET_PLAYHEAD'; payload: number }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'TOGGLE_PLAYBACK' }
  | { type: 'ADD_TRACK'; payload: MediaType }
  | { type: 'REMOVE_TRACK'; payload: string }
  | { type: 'UPDATE_TRACK'; payload: { id: string; updates: Partial<Track> } }
  | { type: 'SPLIT_CLIP'; payload: { clipId: string; time: number } }
  | { type: 'TICK'; payload: number }; // Payload is delta time in seconds