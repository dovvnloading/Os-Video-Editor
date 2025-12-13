import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import { ProjectState, Asset, Clip, Track, MediaType, ClipEffects, Action } from '../types';
import { INITIAL_TRACKS, DEFAULT_PROJECT_WIDTH, DEFAULT_PROJECT_HEIGHT, DEFAULT_ZOOM, DEFAULT_EFFECTS, DEFAULT_DURATION } from '../constants';

// --- Types ---

interface ProjectContextType {
  state: ProjectState;
  dispatch: React.Dispatch<Action>;
  actions: {
    seek: (time: number) => void;
    playPause: () => void;
    addAsset: (asset: Asset) => void;
    addClip: (clip: Clip) => void;
    updateClip: (id: string, updates: Partial<Clip>) => void;
    selectClip: (id: string | null) => void;
    deleteClip: (id: string) => void;
    addTrack: (type: MediaType) => void;
    removeTrack: (id: string) => void;
  };
}

// --- Initial State ---

const initialState: ProjectState = {
  assets: [],
  tracks: INITIAL_TRACKS,
  clips: [],
  currentTime: 0,
  duration: DEFAULT_DURATION,
  isPlaying: false,
  zoom: DEFAULT_ZOOM,
  selectedClipId: null,
  width: DEFAULT_PROJECT_WIDTH,
  height: DEFAULT_PROJECT_HEIGHT,
};

// --- Reducer ---

const projectReducer = (state: ProjectState, action: Action): ProjectState => {
  switch (action.type) {
    case 'SET_PROJECT':
      return { ...state, ...action.payload };
      
    case 'ADD_ASSET':
      return { ...state, assets: [...state.assets, action.payload] };
      
    case 'REMOVE_ASSET':
      return { ...state, assets: state.assets.filter(a => a.id !== action.payload) };

    case 'ADD_CLIP':
      const newDuration = Math.max(state.duration, action.payload.startTime + action.payload.duration);
      return { 
        ...state, 
        clips: [...state.clips, action.payload],
        duration: newDuration,
        selectedClipId: action.payload.id
      };

    case 'UPDATE_CLIP':
      return {
        ...state,
        clips: state.clips.map(c => c.id === action.payload.id ? { ...c, ...action.payload.updates } : c)
      };

    case 'REMOVE_CLIP':
      return {
        ...state,
        clips: state.clips.filter(c => c.id !== action.payload),
        selectedClipId: state.selectedClipId === action.payload ? null : state.selectedClipId
      };

    case 'SET_SELECTION':
      return { ...state, selectedClipId: action.payload };

    case 'SET_PLAYHEAD':
      return { ...state, currentTime: Math.max(0, Math.min(state.duration, action.payload)) };

    case 'SET_ZOOM':
      return { ...state, zoom: action.payload };

    case 'TOGGLE_PLAYBACK':
      return { ...state, isPlaying: !state.isPlaying };

    case 'ADD_TRACK': {
      const type = action.payload;
      const typeCount = state.tracks.filter(t => t.type === type).length + 1;
      const newTrack: Track = {
          id: `track-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: `${type === MediaType.AUDIO ? 'Audio' : 'Video'} ${typeCount}`,
          type: type,
          isHidden: false,
          isMuted: false,
          isLocked: false
      };
      return { ...state, tracks: [...state.tracks, newTrack] };
    }

    case 'REMOVE_TRACK':
      if (state.tracks.length <= 1) return state; 
      return {
          ...state,
          tracks: state.tracks.filter(t => t.id !== action.payload),
          clips: state.clips.filter(c => c.trackId !== action.payload)
      };

    case 'UPDATE_TRACK':
      return {
          ...state,
          tracks: state.tracks.map(t => t.id === action.payload.id ? { ...t, ...action.payload.updates } : t)
      };

    case 'SPLIT_CLIP': {
       const { clipId, time } = action.payload;
       const original = state.clips.find(c => c.id === clipId);
       if (!original) return state;

       const offset = time - original.startTime;
       if (offset <= 0 || offset >= original.duration) return state;

       const clipA: Clip = { ...original, duration: offset, id: original.id }; 
       const clipB: Clip = {
           ...original,
           id: `clip-${Date.now()}-split`,
           startTime: time,
           offset: original.offset + offset,
           duration: original.duration - offset
       };
       
       return {
           ...state,
           clips: [...state.clips.filter(c => c.id !== clipId), clipA, clipB],
           selectedClipId: clipB.id
       };
    }

    case 'TICK': {
       const newTime = state.currentTime + action.payload;
       if (newTime >= state.duration) {
           return { ...state, currentTime: 0, isPlaying: false }; // Stop at end
       }
       return { ...state, currentTime: newTime };
    }

    default:
      return state;
  }
};

// --- Context ---

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  // Playback Loop
  useEffect(() => {
    let rafId: number;
    let lastTime: number;

    if (state.isPlaying) {
        lastTime = performance.now();
        const loop = () => {
            const now = performance.now();
            const delta = (now - lastTime) / 1000;
            // Prevent large jumps if frame drops heavily
            const safeDelta = Math.min(delta, 0.1); 
            lastTime = now;
            
            dispatch({ type: 'TICK', payload: safeDelta });
            rafId = requestAnimationFrame(loop);
        };
        rafId = requestAnimationFrame(loop);
    }

    return () => {
        if (rafId) cancelAnimationFrame(rafId);
    };
  }, [state.isPlaying]);

  const actions = {
    seek: useCallback((time: number) => dispatch({ type: 'SET_PLAYHEAD', payload: time }), []),
    playPause: useCallback(() => dispatch({ type: 'TOGGLE_PLAYBACK' }), []),
    addAsset: useCallback((asset: Asset) => dispatch({ type: 'ADD_ASSET', payload: asset }), []),
    addClip: useCallback((clip: Clip) => dispatch({ type: 'ADD_CLIP', payload: clip }), []),
    updateClip: useCallback((id: string, updates: Partial<Clip>) => dispatch({ type: 'UPDATE_CLIP', payload: { id, updates } }), []),
    selectClip: useCallback((id: string | null) => dispatch({ type: 'SET_SELECTION', payload: id }), []),
    deleteClip: useCallback((id: string) => dispatch({ type: 'REMOVE_CLIP', payload: id }), []),
    addTrack: useCallback((type: MediaType) => dispatch({ type: 'ADD_TRACK', payload: type }), []),
    removeTrack: useCallback((id: string) => dispatch({ type: 'REMOVE_TRACK', payload: id }), []),
  };

  return (
    <ProjectContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};