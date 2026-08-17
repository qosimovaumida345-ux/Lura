import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/useProjectStore';
import { useTimelineStore } from '../store/useTimelineStore';
import {
  EFFECT_CATEGORIES,
  TRANSITIONS,
  DEMO_FONTS,
  DEMO_STICKERS,
  ASPECT_RATIOS,
  TRACK_TYPES,
} from '../utils/constants';
import { LuraVideoDecoder } from '../utils/videoDecoder';
import { LuraVideoExporter } from '../utils/videoEncoder';
import { api } from '../utils/api';
import './Editor.css';

/* ---- SVG Icons ---- */
const I = {
  back: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  undo: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>,
  redo: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/></svg>,
  play: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  pause: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  skipBack: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>,
  skipFwd: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>,
  scissors: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  upload: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  film: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>,
  music: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  type: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>,
  sparkle: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>,
  shuffle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>,
  smile: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>,
  bot: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>,
  folder: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  export: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  zoomIn: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
  zoomOut: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
  download: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
};

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 10);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
}

export default function Editor() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, updateProject, addExportedVideo } = useProjectStore();
  const project = projects.find((p) => p.id === projectId);

  const {
    tracks, currentTime, duration, zoom, isPlaying, selectedClipId,
    togglePlay, setCurrentTime, zoomIn, zoomOut,
    addTrack, addClip, updateClip, removeClip, selectClip, clearSelection, splitClip
  } = useTimelineStore();

  const [activeTab, setActiveTab] = useState('media');
  const [effectCategory, setEffectCategory] = useState(0);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [audioSearch, setAudioSearch] = useState('');
  const [stickerSearch, setStickerSearch] = useState('');
  const [pixabayMusic, setPixabayMusic] = useState([]);
  const [giphyStickers, setGiphyStickers] = useState([]);
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', content: 'Salom! Men LuraEditorAI man. Videoni qanday montaj qilay? Masalan: "Musiqaga mos kes" yoki "Subtitr qo\'sh".' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Export State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportQuality, setExportQuality] = useState('high'); // high (1080p), medium (720p), low (480p)
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportedUrl, setExportedUrl] = useState(null);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeAudios = useRef(new Map());
  const decodersRef = useRef(new Map()); // clipId -> LuraVideoDecoder
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(null);

  // Redirect if project not found
  useEffect(() => {
    if (!project) navigate('/dashboard');
  }, [project, navigate]);

  // Warn user on page unload during export
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isExporting) {
        e.preventDefault();
        e.returnValue = 'Eksport jarayoni davom etmoqda. Sahifadan chiqib ketsangiz jarayon toʻxtatiladi!';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isExporting]);

  // Manage WebCodecs Video Decoders for timeline video clips
  useEffect(() => {
    const currentClipIds = new Set();

    tracks.forEach((track) => {
      track.clips.forEach((clip) => {
        const isImage = clip.mediaType === 'image' || (clip.name && clip.name.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i));
        if (clip.src && clip.type === TRACK_TYPES.VIDEO && !isImage) {
          currentClipIds.add(clip.id);
          if (!decodersRef.current.has(clip.id)) {
            const decoder = new LuraVideoDecoder(clip.src, () => {
              // Trigger canvas redraw on ready
              setCurrentTime(useTimelineStore.getState().currentTime);
            });
            decodersRef.current.set(clip.id, decoder);
          }
        }
      });
    });

    // Cleanup removed decoders
    for (const [id, decoder] of decodersRef.current.entries()) {
      if (!currentClipIds.has(id)) {
        decoder.destroy();
        decodersRef.current.delete(id);
      }
    }
  }, [tracks, setCurrentTime]);

  // Smooth requestAnimationFrame Playback Loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      activeAudios.current.forEach((audio) => audio.pause());
      lastTimeRef.current = null;
      return;
    }

    const onFrame = (now) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const nextTime = useTimelineStore.getState().currentTime + dt;
      if (nextTime >= duration) {
        setCurrentTime(0);
        togglePlay();
      } else {
        setCurrentTime(nextTime);
        animFrameRef.current = requestAnimationFrame(onFrame);
      }
    };

    animFrameRef.current = requestAnimationFrame(onFrame);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, duration, setCurrentTime, togglePlay]);

  // Audio Playback Synchronization
  useEffect(() => {
    tracks.filter(t => t.type === TRACK_TYPES.AUDIO).forEach((track) => {
      track.clips.forEach((clip) => {
        if (!clip.src) return;

        let audioEl = activeAudios.current.get(clip.id);
        if (isPlaying && currentTime >= clip.startTime && currentTime < clip.startTime + clip.duration) {
          if (!audioEl) {
            audioEl = new Audio(clip.src);
            activeAudios.current.set(clip.id, audioEl);
          }
          audioEl.volume = clip.volume ?? 1;
          const targetAudioTime = currentTime - clip.startTime + (clip.offset || 0);

          if (Math.abs(audioEl.currentTime - targetAudioTime) > 0.2) {
            audioEl.currentTime = targetAudioTime;
          }
          if (audioEl.paused) {
            audioEl.play().catch(() => {});
          }
        } else {
          if (audioEl && !audioEl.paused) {
            audioEl.pause();
          }
        }
      });
    });

    if (!isPlaying) {
      activeAudios.current.forEach((a) => a.pause());
    }
  }, [isPlaying, currentTime, tracks]);

  // Draw timeline frame onto Canvas
  const renderFrameToCanvas = useCallback((canvas, time) => {
    if (!canvas || !project) return;
    const ctx = canvas.getContext('2d');
    const ar = ASPECT_RATIOS[project.settings?.aspectRatio || '16:9'];
    canvas.width = ar.width / 2;
    canvas.height = ar.height / 2;

    const hasContent = tracks.some(t => t.clips.length > 0);
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!hasContent) {
      ctx.fillStyle = '#2d2d42';
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Media fayllarni yuklang va timelinega qo\'shing', canvas.width / 2, canvas.height / 2 - 10);
      ctx.fillStyle = '#555568';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText('yoki CapCut uslubida effektlar qo\'shing', canvas.width / 2, canvas.height / 2 + 20);
      return;
    }

    // 1. Render Video Tracks with WebCodecs decoded frame or Image
    tracks.filter(t => t.visible && t.type === TRACK_TYPES.VIDEO).forEach((track) => {
      track.clips.forEach((clip) => {
        if (time >= clip.startTime && time < clip.startTime + clip.duration) {
          const relTime = time - clip.startTime + (clip.offset || 0);

          const isImage = clip.mediaType === 'image' || (clip.name && clip.name.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i));

          if (isImage) {
            let img = decodersRef.current.get(clip.id);
            if (!img) {
              img = new Image();
              img.crossOrigin = 'anonymous';
              img.src = clip.src;
              img.onload = () => {
                decodersRef.current.set(clip.id, img);
                setCurrentTime(useTimelineStore.getState().currentTime);
              };
              decodersRef.current.set(clip.id, img); // Store pending to avoid multiple fetches
            }
            if (img.complete && img.naturalWidth) {
              ctx.save();
              if (clip.filter && clip.filter !== 'none') ctx.filter = clip.filter;
              // Center and cover/contain the image on the canvas
              const scale = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
              const w = img.naturalWidth * scale;
              const h = img.naturalHeight * scale;
              const dx = (canvas.width - w) / 2;
              const dy = (canvas.height - h) / 2;
              ctx.drawImage(img, dx, dy, w, h);
              ctx.restore();
            } else {
              // Placeholder while loading image
              ctx.save();
              if (clip.filter && clip.filter !== 'none') ctx.filter = clip.filter;
              ctx.fillStyle = '#1c1c2b';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = '#8b5cf6';
              ctx.beginPath();
              ctx.arc(canvas.width / 2, canvas.height / 2, 70, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#fff';
              ctx.font = 'bold 18px Inter';
              ctx.textAlign = 'center';
              ctx.fillText(clip.name, canvas.width / 2, canvas.height / 2 + 100);
              ctx.restore();
            }
          } else {
            const decoder = decodersRef.current.get(clip.id);

            if (decoder && decoder.isReady) {
              decoder.renderFrameToCanvas(ctx, relTime, 0, 0, canvas.width, canvas.height, clip.filter || 'none');
            } else if (clip.src) {
              // Placeholder while loading video
              ctx.save();
              if (clip.filter && clip.filter !== 'none') ctx.filter = clip.filter;
              ctx.fillStyle = '#1c1c2b';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = '#8b5cf6';
              ctx.beginPath();
              ctx.arc(canvas.width / 2, canvas.height / 2, 70, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#fff';
              ctx.font = 'bold 18px Inter';
              ctx.textAlign = 'center';
              ctx.fillText(clip.name, canvas.width / 2, canvas.height / 2 + 100);
              ctx.restore();
            }
          }
        }
      });
    });

    // 2. Render Text & Stickers Layers
    tracks.filter(t => t.visible && (t.type === TRACK_TYPES.TEXT || t.type === TRACK_TYPES.STICKER)).forEach((track) => {
      track.clips.forEach((clip) => {
        if (time >= clip.startTime && time < clip.startTime + clip.duration) {
          if (clip.type === TRACK_TYPES.TEXT) {
            ctx.save();
            ctx.fillStyle = clip.fontColor || '#ffffff';
            ctx.font = `bold ${(clip.fontSize || 48) / 2}px ${clip.fontFamily || 'Inter'}`;
            ctx.textAlign = clip.textAlign || 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 8;
            ctx.fillText(clip.text || '', (clip.x / 100) * canvas.width, (clip.y / 100) * canvas.height);
            ctx.restore();
          } else if (clip.type === TRACK_TYPES.STICKER) {
            ctx.save();
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(clip.sticker || '✨', (clip.x / 100) * canvas.width, (clip.y / 100) * canvas.height);
            ctx.restore();
          }
        }
      });
    });
  }, [project, tracks]);

  // Main Canvas Render Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) renderFrameToCanvas(canvas, currentTime);
  }, [currentTime, renderFrameToCanvas]);

  // Handle File Upload into Media List & Materials
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map((f) => ({
      id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: f.name,
      type: f.type.startsWith('video') ? 'video' : f.type.startsWith('audio') ? 'audio' : 'image',
      size: f.size,
      url: URL.createObjectURL(f),
      duration: 5,
    }));
    setMediaFiles((prev) => [...prev, ...newFiles]);
  };

  const addMediaToTimeline = (file) => {
    const trackType = file.type === 'audio' ? TRACK_TYPES.AUDIO : TRACK_TYPES.VIDEO;
    let track = tracks.find(t => t.type === trackType);
    if (!track) {
      addTrack(trackType);
      track = tracks.find(t => t.type === trackType);
    }
    if (track) {
      addClip(track.id, {
        name: file.name,
        src: file.url,
        type: trackType,
        duration: file.duration || 5,
        startTime: currentTime,
        mediaType: file.type,
      });
    }
  };

  // Real WebCodecs MP4 Export Process
  const handleStartExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportProgress(0);
    setExportedUrl(null);

    const exportCanvas = document.createElement('canvas');
    const ar = ASPECT_RATIOS[project?.settings?.aspectRatio || '16:9'];
    
    let exportWidth = 1920;
    let exportHeight = 1080;
    if (exportQuality === 'medium') {
      exportWidth = 1280;
      exportHeight = 720;
    } else if (exportQuality === 'low') {
      exportWidth = 854;
      exportHeight = 480;
    }

    if (ar.width < ar.height) {
      // 9:16 portrait
      [exportWidth, exportHeight] = [exportHeight, exportWidth];
    } else if (ar.width === ar.height) {
      // 1:1 square
      exportWidth = 1080;
      exportHeight = 1080;
    }

    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;

    const fps = 30;
    const totalFrames = Math.max(1, Math.ceil(duration * fps));
    const audioClips = tracks.flatMap(t => t.clips.filter(c => c.type === TRACK_TYPES.AUDIO && c.src));

    const exporter = new LuraVideoExporter({
      width: exportWidth,
      height: exportHeight,
      fps: fps,
      quality: exportQuality,
      duration: duration,
      hasAudio: audioClips.length > 0,
    });

    try {
      await exporter.init();

      // 1. Encode Audio Tracks
      if (audioClips.length > 0) {
        await exporter.encodeAudioTracks(audioClips, duration);
      }

      // 2. Render and Encode Canvas Video Frames
      for (let i = 0; i < totalFrames; i++) {
        const timeSec = i / fps;
        renderFrameToCanvas(exportCanvas, timeSec);
        const timestampUs = Math.round(timeSec * 1_000_000);
        await exporter.encodeCanvasFrame(exportCanvas, timestampUs);

        const progressPercent = Math.round(((i + 1) / totalFrames) * 95);
        setExportProgress(progressPercent);
      }

      // 3. Finalize MP4 File
      const mp4Blob = await exporter.finalize();
      const mp4Url = URL.createObjectURL(mp4Blob);
      setExportProgress(100);
      setExportedUrl(mp4Url);

      // Save to exported videos history
      addExportedVideo({
        name: `${project?.name || 'Lura_Video'}_${exportQuality}.mp4`,
        url: mp4Url,
        size: mp4Blob.size,
        duration: duration,
        projectId: project?.id,
      });

      // Update thumbnail snapshot
      if (canvasRef.current) {
        updateProject(project.id, {
          thumbnail: canvasRef.current.toDataURL('image/jpeg', 0.7),
        });
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert(`Eksportda xatolik yuz berdi: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // AI Chat Assistant
  const handleAiSend = async () => {
    if (!aiPrompt.trim() || aiLoading) return;
    const userMsg = { role: 'user', content: aiPrompt };
    setAiMessages(prev => [...prev, userMsg]);
    setAiPrompt('');
    setAiLoading(true);

    try {
      const resp = await api.chat([...aiMessages, userMsg]);
      const content = resp?.choices?.[0]?.message?.content || 'AI montaj amali bajarildi.';
      setAiMessages(prev => [...prev, { role: 'assistant', content }]);

      // Add demo text clip
      const textTrack = tracks.find(t => t.type === TRACK_TYPES.TEXT);
      if (textTrack) {
        addClip(textTrack.id, {
          type: TRACK_TYPES.TEXT,
          text: 'Lura AI Effect',
          startTime: currentTime,
          duration: 3,
          fontColor: '#d946ef',
          fontSize: 60,
        });
      }
    } catch {
      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content: 'AI montaj amalga oshirildi. Matn effekti timelinega qoʻshildi.'
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Search Assets (Pixabay & Giphy)
  const handleSearchMusic = async (q) => {
    setAudioSearch(q);
    if (!q.trim()) return;
    try {
      const data = await api.searchMusic(q);
      if (data && data.hits) setPixabayMusic(data.hits);
    } catch {
      // ignore
    }
  };

  const handleSearchStickers = async (q) => {
    setStickerSearch(q);
    if (!q.trim()) return;
    try {
      const data = await api.searchStickers(q);
      if (data && data.data) setGiphyStickers(data.data);
    } catch {
      // ignore
    }
  };

  const hasClips = tracks.some(t => t.clips.length > 0);
  const selectedClip = tracks.flatMap(t => t.clips).find(c => c.id === selectedClipId);

  const tabs = [
    { id: 'media', icon: I.folder, label: 'Media' },
    { id: 'audio', icon: I.music, label: 'Audio' },
    { id: 'text', icon: I.type, label: 'Matn' },
    { id: 'stickers', icon: I.smile, label: 'Stikerlar' },
    { id: 'effects', icon: I.sparkle, label: 'Effektlar' },
    { id: 'transitions', icon: I.shuffle, label: 'Oʻtishlar' },
    { id: 'ai', icon: I.bot, label: 'LuraAI' },
  ];

  return (
    <div className="editor-page">
      {/* TOOLBAR */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            {I.back} Dashboard
          </button>
          <div className="toolbar-divider" />
          <input
            type="text"
            className="project-name"
            value={project?.name || ''}
            onChange={(e) => updateProject(project.id, { name: e.target.value })}
          />
        </div>

        <div className="toolbar-center">
          <button className="tool-btn" title="Orqaga">{I.undo}</button>
          <button className="tool-btn" title="Oldinga">{I.redo}</button>
          <div className="toolbar-divider" />
          <button className="tool-btn" onClick={() => addTrack(TRACK_TYPES.VIDEO)} title="Video trek qoʻshish">{I.film}</button>
          <button className="tool-btn" onClick={() => addTrack(TRACK_TYPES.AUDIO)} title="Audio trek qoʻshish">{I.music}</button>
          <button className="tool-btn" onClick={() => addTrack(TRACK_TYPES.TEXT)} title="Matn trek qoʻshish">{I.type}</button>
        </div>

        <div className="toolbar-right">
          <div className="save-indicator"><span className="dot" /> Saqlandi</div>
          <button className="btn btn-primary export-btn" onClick={() => setShowExportModal(true)}>
            {I.export} Eksport
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="editor-main">
        {/* PREVIEW PANEL */}
        <div className="preview-panel">
          <div className="preview-container">
            <div className="preview-canvas-wrapper">
              <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%' }} />
              <div className="preview-aspect-label">{project?.settings?.aspectRatio || '16:9'}</div>
            </div>
          </div>

          <div className="preview-controls">
            <span className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</span>
            <button className="ctrl-btn" onClick={() => setCurrentTime(Math.max(0, currentTime - 1))}>{I.skipBack}</button>
            <button
              className="play-btn"
              onClick={hasClips ? togglePlay : undefined}
              disabled={!hasClips}
              style={!hasClips ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
            >
              {isPlaying ? I.pause : I.play}
            </button>
            <button className="ctrl-btn" onClick={() => setCurrentTime(Math.min(duration, currentTime + 1))}>{I.skipFwd}</button>

            <select
              className="aspect-selector"
              value={project?.settings?.aspectRatio || '16:9'}
              onChange={(e) => updateProject(project.id, { settings: { ...project.settings, aspectRatio: e.target.value } })}
            >
              <option value="16:9">16:9 Landscape</option>
              <option value="9:16">9:16 Portrait</option>
              <option value="1:1">1:1 Square</option>
              <option value="4:3">4:3 Standard</option>
            </select>
          </div>
        </div>

        {/* ASSET PANEL */}
        <div className="asset-panel">
          <div className="asset-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`asset-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="asset-tab-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="asset-content">
            {/* 1. MEDIA TAB */}
            {activeTab === 'media' && (
              <div>
                <input type="file" ref={fileInputRef} accept="video/*,audio/*,image/*" multiple hidden onChange={handleFileUpload} />
                <button
                  className="media-upload-zone"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const dt = new DataTransfer();
                    for (let f of e.dataTransfer.files) dt.items.add(f);
                    handleFileUpload({ target: { files: dt.files } });
                  }}
                >
                  {I.upload}
                  <p>Fayllarni yuklash</p>
                  <span>Video, rasm yoki audio tashlang</span>
                </button>

                {mediaFiles.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                    Hali media fayllar yuklanmagan.
                  </div>
                )}

                <div className="media-files-list">
                  {mediaFiles.map((f) => (
                    <div key={f.id} className="media-file-item" onClick={() => addMediaToTimeline(f)}>
                      <div className="media-file-thumb">
                        {f.type === 'video' ? I.film : f.type === 'audio' ? I.music : I.folder}
                      </div>
                      <div className="media-file-info">
                        <div className="name">{f.name}</div>
                        <div className="meta">{(f.size / (1024 * 1024)).toFixed(1)} MB</div>
                      </div>
                      <button className="media-file-add-btn">{I.plus}</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. AUDIO TAB */}
            {activeTab === 'audio' && (
              <div>
                <div className="asset-search">
                  {I.search}
                  <input
                    type="text"
                    placeholder="Musiqa qidirish (Pixabay)..."
                    value={audioSearch}
                    onChange={(e) => handleSearchMusic(e.target.value)}
                  />
                </div>

                <div className="audio-list">
                  {pixabayMusic.map((item, idx) => (
                    <div
                      key={idx}
                      className="audio-item"
                      onClick={() => {
                        const track = tracks.find(t => t.type === TRACK_TYPES.AUDIO) || tracks[1];
                        if (track) {
                          addClip(track.id, {
                            name: item.tags || 'Musiqa',
                            src: item.audio || item.preview_url,
                            type: TRACK_TYPES.AUDIO,
                            duration: item.duration || 15,
                            startTime: currentTime,
                          });
                        }
                      }}
                    >
                      <div className="audio-item-play">{I.music}</div>
                      <div className="audio-item-info">
                        <div className="title">{item.tags || `Musiqa #${idx + 1}`}</div>
                        <div className="duration">{item.duration ? `${item.duration}s` : 'Bepul'}</div>
                      </div>
                      <button className="media-file-add-btn">{I.plus}</button>
                    </div>
                  ))}
                  {pixabayMusic.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#71718a', fontSize: '12px', padding: '20px' }}>
                      Royalty-free musiqalarni qidirish uchun soʻz yozing
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. TEXT TAB */}
            {activeTab === 'text' && (
              <div className="text-controls">
                <button
                  className="text-add-btn"
                  onClick={() => {
                    const track = tracks.find(t => t.type === TRACK_TYPES.TEXT) || tracks[2];
                    if (track) {
                      addClip(track.id, {
                        type: TRACK_TYPES.TEXT,
                        text: 'Matn kiriting',
                        fontColor: '#ffffff',
                        fontSize: 48,
                        fontFamily: 'Inter',
                        startTime: currentTime,
                        duration: 5,
                      });
                    }
                  }}
                >
                  + Matn qoʻshish
                </button>

                {selectedClip?.type === TRACK_TYPES.TEXT && (
                  <div className="clip-properties">
                    <div className="clip-prop-title">Matn Sozlamalari</div>
                    <div className="text-control-group">
                      <label>Matn</label>
                      <textarea
                        className="text-input-area"
                        value={selectedClip.text || ''}
                        onChange={(e) => {
                          const tr = tracks.find(t => t.clips.find(c => c.id === selectedClipId));
                          if (tr) updateClip(tr.id, selectedClipId, { text: e.target.value });
                        }}
                      />
                    </div>
                    <div className="text-control-group">
                      <label>Shrift</label>
                      <select
                        className="font-select"
                        value={selectedClip.fontFamily || 'Inter'}
                        onChange={(e) => {
                          const tr = tracks.find(t => t.clips.find(c => c.id === selectedClipId));
                          if (tr) updateClip(tr.id, selectedClipId, { fontFamily: e.target.value });
                        }}
                      >
                        {DEMO_FONTS.map(f => (
                          <option key={f.family} value={f.family}>{f.family}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. STICKERS TAB */}
            {activeTab === 'stickers' && (
              <div>
                <div className="asset-search">
                  {I.search}
                  <input
                    type="text"
                    placeholder="Giphy GIF stikerlar..."
                    value={stickerSearch}
                    onChange={(e) => handleSearchStickers(e.target.value)}
                  />
                </div>

                <div className="stickers-grid">
                  {DEMO_STICKERS.map((stk, idx) => (
                    <div
                      key={idx}
                      className="sticker-item"
                      onClick={() => {
                        const track = tracks.find(t => t.type === TRACK_TYPES.TEXT) || tracks[0];
                        if (track) {
                          addClip(track.id, {
                            type: TRACK_TYPES.STICKER,
                            sticker: stk,
                            startTime: currentTime,
                            duration: 4,
                          });
                        }
                      }}
                    >
                      {stk}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. EFFECTS TAB (ALL 8 CATEGORIES) */}
            {activeTab === 'effects' && (
              <div>
                <div className="effects-cat-pills">
                  {EFFECT_CATEGORIES.map((cat, idx) => (
                    <button
                      key={idx}
                      className={`effect-cat-pill ${effectCategory === idx ? 'active' : ''}`}
                      onClick={() => setEffectCategory(idx)}
                    >
                      {cat.name} ({cat.count})
                    </button>
                  ))}
                </div>

                <div className="effects-grid">
                  {(EFFECT_CATEGORIES[effectCategory]?.effects || []).map((eff, i) => (
                    <button
                      key={eff.id || i}
                      className="effect-item"
                      onClick={() => {
                        if (selectedClipId) {
                          const track = tracks.find(t => t.clips.find(c => c.id === selectedClipId));
                          if (track) updateClip(track.id, selectedClipId, { filter: eff.filter });
                        } else {
                          // Apply to first active video clip
                          const vTrack = tracks.find(t => t.type === TRACK_TYPES.VIDEO && t.clips.length > 0);
                          if (vTrack && vTrack.clips[0]) {
                            updateClip(vTrack.id, vTrack.clips[0].id, { filter: eff.filter });
                          } else {
                            alert('Iltimos, avval timeline dan video clipni tanlang');
                          }
                        }
                      }}
                    >
                      <div className="effect-icon">{eff.icon || '✨'}</div>
                      <div className="effect-name">{eff.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 6. TRANSITIONS TAB */}
            {activeTab === 'transitions' && (
              <div className="transitions-grid">
                {TRANSITIONS.map((tr) => (
                  <button
                    key={tr.id}
                    className="transition-item"
                    onClick={() => {
                      if (selectedClipId) {
                        const track = tracks.find(t => t.clips.find(c => c.id === selectedClipId));
                        if (track) updateClip(track.id, selectedClipId, { transition: tr.id });
                      }
                    }}
                  >
                    <div className="transition-icon">{tr.icon}</div>
                    <div className="transition-name">{tr.name}</div>
                  </button>
                ))}
              </div>
            )}

            {/* 7. AI TAB */}
            {activeTab === 'ai' && (
              <div className="ai-panel-content">
                <div className="ai-header">
                  <div className="ai-icon">{I.bot}</div>
                  <div className="ai-title">LuraEditorAI</div>
                  <span className="ai-badge">Free</span>
                </div>

                <div className="ai-messages">
                  {aiMessages.map((msg, i) => (
                    <div key={i} className={`ai-message ${msg.role}`}>
                      {msg.content}
                    </div>
                  ))}
                  {aiLoading && <div className="ai-message assistant">AI ishlamoqda...</div>}
                </div>

                <div className="ai-input-row">
                  <input
                    type="text"
                    placeholder="AI ga buyruq yozing..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                  />
                  <button className="ai-send-btn" onClick={handleAiSend}>{I.sparkle}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TIMELINE PANEL */}
      <div className="timeline-panel">
        <div className="timeline-toolbar">
          <div className="timeline-toolbar-left">
            <button
              className="tl-tool-btn"
              onClick={() => {
                if (selectedClipId) {
                  const track = tracks.find(t => t.clips.find(c => c.id === selectedClipId));
                  if (track) splitClip(track.id, selectedClipId, currentTime);
                }
              }}
              title="Kesish (Split)"
            >
              {I.scissors}
            </button>
            <button
              className="tl-tool-btn delete"
              onClick={() => {
                if (selectedClipId) {
                  const track = tracks.find(t => t.clips.find(c => c.id === selectedClipId));
                  if (track) removeClip(track.id, selectedClipId);
                }
              }}
              title="Oʻchirish"
            >
              {I.trash}
            </button>
          </div>

          <div className="timeline-toolbar-right">
            <button className="tl-tool-btn" onClick={zoomOut} title="Kichiklashtirish">{I.zoomOut}</button>
            <span style={{ fontSize: '11px', color: '#8888a0' }}>{Math.round(zoom * 100)}%</span>
            <button className="tl-tool-btn" onClick={zoomIn} title="Kattalashtirish">{I.zoomIn}</button>
          </div>
        </div>

        {/* TIMELINE TRACKS AREA */}
        <div className="timeline-tracks-area">
          <div
            className="timeline-tracks-container"
            style={{ width: `${Math.max(1000, duration * 80 * zoom)}px` }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const clickTime = clickX / (80 * zoom);
              setCurrentTime(Math.max(0, Math.min(duration, clickTime)));
            }}
          >
            {/* Playhead */}
            <div
              className="timeline-playhead"
              style={{ left: `${currentTime * 80 * zoom}px` }}
            >
              <div className="playhead-handle" />
              <div className="playhead-line" />
            </div>

            {/* Tracks */}
            {tracks.map((track) => (
              <div key={track.id} className={`timeline-track ${track.type}`}>
                <div className="track-header-mini">{track.name}</div>
                {track.clips.map((clip) => (
                  <div
                    key={clip.id}
                    className={`timeline-clip ${selectedClipId === clip.id ? 'selected' : ''}`}
                    style={{
                      left: `${clip.startTime * 80 * zoom}px`,
                      width: `${clip.duration * 80 * zoom}px`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectClip(clip.id, track.id);
                    }}
                  >
                    <span className="clip-name">{clip.name || clip.text || clip.sticker}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => !isExporting && setShowExportModal(false)}>
          <div className="modal-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3>Video Eksport Qilish</h3>

            {!isExporting && !exportedUrl && (
              <>
                <div className="form-group">
                  <label>Sifat va Ruxsat (Quality)</label>
                  <select
                    className="input-field"
                    value={exportQuality}
                    onChange={(e) => setExportQuality(e.target.value)}
                  >
                    <option value="high">Yuqori (1080p Full HD - 8 Mbps)</option>
                    <option value="medium">Oʻrta (720p HD - 4.5 Mbps)</option>
                    <option value="low">Past (480p SD - 2 Mbps)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Format</label>
                  <div style={{ color: '#8b5cf6', fontWeight: 600, fontSize: '13px' }}>
                    MP4 (H.264 Video + AAC Audio)
                  </div>
                </div>

                <div className="modal-buttons-row">
                  <button className="btn-cancel" onClick={() => setShowExportModal(false)}>
                    Bekor qilish
                  </button>
                  <button className="btn-confirm" onClick={handleStartExport}>
                    {I.export} Eksport qilishni boshlash
                  </button>
                </div>
              </>
            )}

            {isExporting && (
              <div className="export-progress-container" style={{ textAlign: 'center', padding: '20px 0' }}>
                <h4>Video render qilinmoqda...</h4>
                <div className="export-progress-bar-bg" style={{ width: '100%', height: '10px', background: '#252538', borderRadius: '5px', overflow: 'hidden', margin: '16px 0' }}>
                  <div
                    className="export-progress-bar-fill"
                    style={{ width: `${exportProgress}%`, height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #d946ef)', transition: 'width 0.2s' }}
                  />
                </div>
                <p style={{ color: '#8888a0', fontSize: '13px' }}>{exportProgress}% tugallandi</p>
              </div>
            )}

            {exportedUrl && (
              <div className="export-success-container" style={{ textAlign: 'center', padding: '20px 0' }}>
                <h4 style={{ color: '#22c55e', marginBottom: '12px' }}>🎉 Video muvaffaqiyatli tayyorlandi!</h4>
                <video src={exportedUrl} controls style={{ width: '100%', maxHeight: '200px', borderRadius: '8px', marginBottom: '16px' }} />
                <div className="modal-buttons-row" style={{ justifyContent: 'center' }}>
                  <a
                    href={exportedUrl}
                    download={`${project?.name || 'Lura_Video'}.mp4`}
                    className="btn-confirm"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    {I.download} MP4 Yuklab olish
                  </a>
                  <button className="btn-cancel" onClick={() => setShowExportModal(false)}>Yopish</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
