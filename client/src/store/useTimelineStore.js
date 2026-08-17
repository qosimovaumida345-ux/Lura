import { create } from 'zustand';
import { TRACK_TYPES } from '../utils/constants';

const generateId = () => `clip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const generateTrackId = () => `track_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const createDefaultTracks = () => [
  { id: generateTrackId(), type: TRACK_TYPES.VIDEO, name: 'Video 1', clips: [], locked: false, visible: true, height: 50 },
  { id: generateTrackId(), type: TRACK_TYPES.AUDIO, name: 'Audio 1', clips: [], locked: false, visible: true, height: 40 },
  { id: generateTrackId(), type: TRACK_TYPES.TEXT, name: 'Text 1', clips: [], locked: false, visible: true, height: 36 },
];

export const useTimelineStore = create((set, get) => ({
  tracks: createDefaultTracks(),
  currentTime: 0,
  duration: 60, // seconds
  zoom: 1,
  isPlaying: false,
  selectedClipId: null,
  selectedTrackId: null,
  pixelsPerSecond: 80,
  history: [],
  historyIndex: -1,

  // ---- Playback ----
  setCurrentTime: (time) => set({ currentTime: Math.max(0, time) }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  // ---- Zoom ----
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)), pixelsPerSecond: 80 * Math.max(0.1, Math.min(5, zoom)) }),
  zoomIn: () => {
    const z = Math.min(5, get().zoom + 0.2);
    set({ zoom: z, pixelsPerSecond: 80 * z });
  },
  zoomOut: () => {
    const z = Math.max(0.1, get().zoom - 0.2);
    set({ zoom: z, pixelsPerSecond: 80 * z });
  },

  // ---- Selection ----
  selectClip: (clipId, trackId) => set({ selectedClipId: clipId, selectedTrackId: trackId }),
  clearSelection: () => set({ selectedClipId: null, selectedTrackId: null }),

  // ---- Tracks ----
  addTrack: (type = TRACK_TYPES.VIDEO) => {
    const count = get().tracks.filter((t) => t.type === type).length + 1;
    const nameMap = { video: 'Video', audio: 'Audio', text: 'Text', sticker: 'Sticker', effect: 'Effect' };
    const track = {
      id: generateTrackId(),
      type,
      name: `${nameMap[type] || 'Track'} ${count}`,
      clips: [],
      locked: false,
      visible: true,
      height: type === TRACK_TYPES.VIDEO ? 50 : type === TRACK_TYPES.AUDIO ? 40 : 36,
    };
    set({ tracks: [...get().tracks, track] });
  },

  removeTrack: (trackId) => {
    set({ tracks: get().tracks.filter((t) => t.id !== trackId) });
  },

  toggleTrackLock: (trackId) => {
    set({
      tracks: get().tracks.map((t) => (t.id === trackId ? { ...t, locked: !t.locked } : t)),
    });
  },

  toggleTrackVisibility: (trackId) => {
    set({
      tracks: get().tracks.map((t) => (t.id === trackId ? { ...t, visible: !t.visible } : t)),
    });
  },

  // ---- Clips ----
  addClip: (trackId, clip) => {
    const newClip = {
      id: generateId(),
      name: clip.name || 'Untitled Clip',
      startTime: clip.startTime || 0,
      duration: clip.duration || 5,
      offset: clip.offset || 0,
      type: clip.type || TRACK_TYPES.VIDEO,
      mediaType: clip.mediaType || 'video',
      color: clip.color || null,
      // Video specific
      src: clip.src || null,
      thumbnail: clip.thumbnail || null,
      effect: clip.effect || 'none',
      transition: clip.transition || 'none',
      volume: clip.volume ?? 1,
      speed: clip.speed || 1,
      // Text specific
      text: clip.text || '',
      fontSize: clip.fontSize || 48,
      fontFamily: clip.fontFamily || 'Inter',
      fontColor: clip.fontColor || '#ffffff',
      textAlign: clip.textAlign || 'center',
      // Sticker specific
      sticker: clip.sticker || null,
      // Position (for overlay)
      x: clip.x ?? 50,
      y: clip.y ?? 50,
      scale: clip.scale ?? 1,
      rotation: clip.rotation ?? 0,
      opacity: clip.opacity ?? 1,
    };

    set({
      tracks: get().tracks.map((t) =>
        t.id === trackId ? { ...t, clips: [...t.clips, newClip] } : t
      ),
    });

    // Update duration if clip extends beyond current
    const clipEnd = newClip.startTime + newClip.duration;
    if (clipEnd > get().duration) {
      set({ duration: clipEnd + 5 });
    }

    return newClip;
  },

  updateClip: (trackId, clipId, updates) => {
    set({
      tracks: get().tracks.map((t) =>
        t.id === trackId
          ? { ...t, clips: t.clips.map((c) => (c.id === clipId ? { ...c, ...updates } : c)) }
          : t
      ),
    });
  },

  removeClip: (trackId, clipId) => {
    set({
      tracks: get().tracks.map((t) =>
        t.id === trackId ? { ...t, clips: t.clips.filter((c) => c.id !== clipId) } : t
      ),
      selectedClipId: get().selectedClipId === clipId ? null : get().selectedClipId,
    });
  },

  splitClip: (trackId, clipId, splitTime) => {
    const track = get().tracks.find((t) => t.id === trackId);
    if (!track) return;
    const clip = track.clips.find((c) => c.id === clipId);
    if (!clip) return;

    const relSplit = splitTime - clip.startTime;
    if (relSplit <= 0 || relSplit >= clip.duration) return;

    const clip1 = { ...clip, duration: relSplit };
    const clip2 = {
      ...clip,
      id: generateId(),
      name: `${clip.name} (2)`,
      startTime: splitTime,
      duration: clip.duration - relSplit,
      offset: clip.offset + relSplit,
    };

    set({
      tracks: get().tracks.map((t) =>
        t.id === trackId
          ? { ...t, clips: t.clips.map((c) => (c.id === clipId ? clip1 : c)).concat(clip2) }
          : t
      ),
    });
  },

  moveClip: (fromTrackId, toTrackId, clipId, newStartTime) => {
    const fromTrack = get().tracks.find((t) => t.id === fromTrackId);
    if (!fromTrack) return;
    const clip = fromTrack.clips.find((c) => c.id === clipId);
    if (!clip) return;

    const movedClip = { ...clip, startTime: Math.max(0, newStartTime) };

    if (fromTrackId === toTrackId) {
      set({
        tracks: get().tracks.map((t) =>
          t.id === fromTrackId
            ? { ...t, clips: t.clips.map((c) => (c.id === clipId ? movedClip : c)) }
            : t
        ),
      });
    } else {
      set({
        tracks: get().tracks.map((t) => {
          if (t.id === fromTrackId) return { ...t, clips: t.clips.filter((c) => c.id !== clipId) };
          if (t.id === toTrackId) return { ...t, clips: [...t.clips, movedClip] };
          return t;
        }),
      });
    }
  },

  // ---- Reset ----
  resetTimeline: () => set({ tracks: createDefaultTracks(), currentTime: 0, duration: 60, selectedClipId: null }),
}));
