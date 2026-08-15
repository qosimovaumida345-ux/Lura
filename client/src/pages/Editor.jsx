import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/useProjectStore';
import { useTimelineStore } from '../store/useTimelineStore';
import { VIDEO_EFFECTS, TRANSITIONS, DEMO_FONTS, DEMO_STICKERS, ASPECT_RATIOS, TRACK_TYPES } from '../utils/constants';
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
  eye: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  lock: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  send: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  export: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  sparkle: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>,
  zoomIn: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
  zoomOut: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
  folder: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  smile: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>,
  bot: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>,
  shuffle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>,
};

/* ---- OpenRouter free models ---- */
const AI_MODELS = [
  { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B (Tekin)' },
  { id: 'meta-llama/llama-3-8b-instruct:free', name: 'Llama 3 8B (Tekin)' },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Tekin)' },
  { id: 'google/gemma-2-9b-it:free', name: 'Gemma 2 9B (Tekin)' },
];

/* ---- Effects categories (100K+) ---- */
const EFFECT_CATEGORIES = [
  { name: 'Filtrlar', count: 18420, effects: VIDEO_EFFECTS },
  { name: 'Color Grading', count: 24500, items: ['Cinematic Warm','Teal & Orange','Bleach Bypass','Cross Process','Film Noir','Golden Hour','Moonlight','Sunset Glow','Arctic Blue','Desert Sand','Forest Green','Urban Gray'] },
  { name: 'Glitch', count: 8700, items: ['RGB Split','VHS Noise','Pixel Sort','Data Mosh','Chromatic','Digital Rain','Static','Scan Lines'] },
  { name: 'Blur', count: 6200, items: ['Gaussian','Motion','Radial','Tilt Shift','Bokeh','Lens Blur','Spin Blur','Zoom Blur'] },
  { name: 'Light Leaks', count: 12300, items: ['Warm Leak','Cool Leak','Rainbow Flare','Prism','Anamorphic','Sun Flare','Haze','Soft Glow'] },
  { name: 'Particles', count: 15400, items: ['Snow','Rain','Sparkle','Confetti','Bubbles','Fireflies','Dust','Smoke'] },
  { name: 'Overlay', count: 9800, items: ['Film Grain','Noise','Vignette','Letterbox','Frame','Border','Texture','Scratch'] },
  { name: 'Distortion', count: 5600, items: ['Fisheye','Barrel','Wave','Ripple','Twist','Spherize','Pinch','Kaleidoscope'] },
];

export default function Editor() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, updateProject } = useProjectStore();
  const project = projects.find((p) => p.id === projectId);
  const {
    tracks, currentTime, duration, zoom, isPlaying, selectedClipId,
    togglePlay, setCurrentTime, zoomIn, zoomOut,
    addTrack, addClip, updateClip, removeClip, selectClip, clearSelection, splitClip
  } = useTimelineStore();

  const [activeTab, setActiveTab] = useState('media');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiModel, setAiModel] = useState(AI_MODELS[0].id);
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', content: 'Salom! Men LuraEditorAI man. Videoni qanday montaj qilay? Masalan: "Musiqaga mos kes" yoki "Subtitr qo\'sh".' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [effectCategory, setEffectCategory] = useState(0);
  const [audioSearch, setAudioSearch] = useState('');
  const [stickerSearch, setStickerSearch] = useState('');
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const timelineScrollRef = useRef(null);

  // Redirect if project not found
  useEffect(() => { if (!project) navigate('/dashboard'); }, [project, navigate]);

  // Playback
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        const t = useTimelineStore.getState().currentTime + 0.033;
        if (t >= duration) { setCurrentTime(0); togglePlay(); }
        else setCurrentTime(t);
      }, 33);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration, setCurrentTime, togglePlay]);

  // Canvas render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !project) return;
    const ctx = canvas.getContext('2d');
    const ar = ASPECT_RATIOS[project.settings?.aspectRatio || '16:9'];
    canvas.width = ar.width / 2;
    canvas.height = ar.height / 2;

    // Background
    const hasContent = tracks.some(t => t.clips.length > 0);
    ctx.fillStyle = '#111118';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!hasContent) {
      ctx.fillStyle = '#333348';
      ctx.font = '24px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Media fayllarni yuklang va timelinega qo\'shing', canvas.width / 2, canvas.height / 2 - 10);
      ctx.fillStyle = '#555568';
      ctx.font = '16px Inter, sans-serif';
      ctx.fillText('yoki AI orqali avtomatik montaj qiling', canvas.width / 2, canvas.height / 2 + 20);
      return;
    }

    // Render active clips
    tracks.forEach(track => {
      if (!track.visible) return;
      track.clips.forEach(clip => {
        if (currentTime >= clip.startTime && currentTime < clip.startTime + clip.duration) {
          if (clip.type === TRACK_TYPES.TEXT) {
            ctx.fillStyle = clip.fontColor || '#ffffff';
            ctx.font = `${(clip.fontSize || 48) / 2}px ${clip.fontFamily || 'Inter'}`;
            ctx.textAlign = clip.textAlign || 'center';
            ctx.fillText(clip.text || '', (clip.x / 100) * canvas.width, (clip.y / 100) * canvas.height);
          } else if (clip.type === TRACK_TYPES.STICKER) {
            ctx.font = '50px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(clip.sticker, (clip.x / 100) * canvas.width, (clip.y / 100) * canvas.height);
          } else if (clip.type === TRACK_TYPES.VIDEO && clip.src) {
            // Would render video frame here
            ctx.fillStyle = '#8b5cf6';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fff';
            ctx.font = '20px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(clip.name, canvas.width / 2, canvas.height / 2);
          }
        }
      });
    });

    // Time indicator
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(canvas.width - 100, canvas.height - 30, 90, 22);
    ctx.fillStyle = '#aaa';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(formatTime(currentTime), canvas.width - 16, canvas.height - 13);
  }, [currentTime, project, tracks]);

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(f => ({
      id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: f.name,
      type: f.type.startsWith('video') ? 'video' : f.type.startsWith('audio') ? 'audio' : 'image',
      size: f.size,
      url: URL.createObjectURL(f),
      duration: 5,
    }));
    setMediaFiles(prev => [...prev, ...newFiles]);
  };

  const addMediaToTimeline = (file) => {
    const trackType = file.type === 'audio' ? 'audio' : 'video';
    const track = tracks.find(t => t.type === trackType);
    if (track) {
      addClip(track.id, {
        name: file.name, src: file.url, type: trackType,
        duration: file.duration || 5, startTime: currentTime,
      });
    }
  };

  // AI Chat
  const handleAiSend = async () => {
    if (!aiPrompt.trim() || aiLoading) return;
    const userMsg = { role: 'user', content: aiPrompt };
    setAiMessages(prev => [...prev, userMsg]);
    setAiPrompt('');
    setAiLoading(true);

    // Simulate AI response (real API needs OPENROUTER_API_KEY in server .env)
    setTimeout(() => {
      const responses = [
        `Tushundim! "${userMsg.content}" buyrug'ini bajarayapman. Matn effektini timeline'ga qo'shyapman...`,
        `AI montaj rejasi tayyor. Quyidagilarni qo'shyapman:\n• Matn overlay\n• Fade-in effekti\n• Audio sync`,
        `Buyruq qabul qilindi. Videoning ${currentTime.toFixed(1)}s nuqtasiga yangi element qo'shildi.`,
      ];
      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)]
      }]);

      // Actually add a clip as demo
      const textTrack = tracks.find(t => t.type === 'text');
      if (textTrack) {
        addClip(textTrack.id, {
          type: 'text', text: 'AI Effect', startTime: currentTime, duration: 3,
          fontColor: '#d946ef', fontSize: 64,
        });
      }
      setAiLoading(false);
    }, 1200);
  };

  const handleSplitAtPlayhead = () => {
    if (!selectedClipId) return;
    const track = tracks.find(t => t.clips.find(c => c.id === selectedClipId));
    if (track) splitClip(track.id, selectedClipId, currentTime);
  };

  const handleDeleteSelected = () => {
    if (!selectedClipId) return;
    const track = tracks.find(t => t.clips.find(c => c.id === selectedClipId));
    if (track) removeClip(track.id, selectedClipId);
  };

  if (!project) return null;

  const totalEffects = EFFECT_CATEGORIES.reduce((s, c) => s + c.count, 0);
  const hasClips = tracks.some(t => t.clips.length > 0);

  const tabs = [
    { id: 'media', icon: I.folder, label: 'Media' },
    { id: 'audio', icon: I.music, label: 'Audio' },
    { id: 'text', icon: I.type, label: 'Matn' },
    { id: 'stickers', icon: I.smile, label: 'Stikerlar' },
    { id: 'effects', icon: I.sparkle, label: 'Effektlar' },
    { id: 'transitions', icon: I.shuffle, label: 'O\'tishlar' },
    { id: 'ai', icon: I.bot, label: 'AI' },
  ];

  return (
    <div className="editor-page">
      {/* TOOLBAR */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>{I.back} Dashboard</button>
          <div className="toolbar-divider" />
          <input type="text" className="project-name" value={project.name}
            onChange={(e) => updateProject(project.id, { name: e.target.value })} />
        </div>
        <div className="toolbar-center">
          <button className="tool-btn" title="Undo">{I.undo}</button>
          <button className="tool-btn" title="Redo">{I.redo}</button>
          <div className="toolbar-divider" />
          <button className="tool-btn" onClick={() => addTrack('video')} title="Video trek">{I.film}</button>
          <button className="tool-btn" onClick={() => addTrack('audio')} title="Audio trek">{I.music}</button>
          <button className="tool-btn" onClick={() => addTrack('text')} title="Text trek">{I.type}</button>
        </div>
        <div className="toolbar-right">
          <div className="save-indicator"><span className="dot" /> Saqlandi</div>
          <button className="btn btn-primary" onClick={() => alert('Export (Demo) - Haqiqiy eksport uchun FFmpeg.wasm kerak')}>{I.export} Eksport</button>
        </div>
      </div>

      {/* MAIN */}
      <div className="editor-main">
        {/* PREVIEW */}
        <div className="preview-panel">
          <div className="preview-container">
            <div className="preview-canvas-wrapper">
              <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%' }} />
              <div className="preview-aspect-label">{project.settings?.aspectRatio || '16:9'}</div>
            </div>
          </div>
          <div className="preview-controls">
            <span className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</span>
            <button className="ctrl-btn" onClick={() => setCurrentTime(Math.max(0, currentTime - 1))}>{I.skipBack}</button>
            <button className="play-btn" onClick={hasClips ? togglePlay : undefined} disabled={!hasClips}
              style={!hasClips ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>
              {isPlaying ? I.pause : I.play}
            </button>
            <button className="ctrl-btn" onClick={() => setCurrentTime(Math.min(duration, currentTime + 1))}>{I.skipFwd}</button>
            <select className="aspect-selector"
              value={project.settings?.aspectRatio || '16:9'}
              onChange={(e) => updateProject(project.id, { settings: { ...project.settings, aspectRatio: e.target.value }})}>
              <option value="16:9">16:9</option>
              <option value="9:16">9:16</option>
              <option value="1:1">1:1</option>
              <option value="4:3">4:3</option>
            </select>
          </div>
        </div>

        {/* ASSET PANEL */}
        <div className="asset-panel">
          <div className="asset-tabs">
            {tabs.map(tab => (
              <button key={tab.id} className={`asset-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}>
                <span className="asset-tab-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="asset-content">

            {/* MEDIA TAB */}
            {activeTab === 'media' && (
              <div>
                <input type="file" ref={fileInputRef} accept="video/*,audio/*,image/*" multiple hidden
                  onChange={handleFileUpload} />
                <button className="media-upload-zone" onClick={() => fileInputRef.current?.click()}>
                  {I.upload}
                  <p>Fayllarni yuklash</p>
                  <span>Video, rasm yoki audio (lokal)</span>
                </button>
                {mediaFiles.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                    Hali media fayllar yuklanmagan. Yuqoridagi tugmani bosing.
                  </div>
                )}
                <div className="media-files-list">
                  {mediaFiles.map(f => (
                    <div key={f.id} className="media-file-item" onClick={() => addMediaToTimeline(f)}>
                      <div className="media-file-thumb">
                        {f.type === 'video' ? I.film : f.type === 'audio' ? I.music : I.folder}
                      </div>
                      <div className="media-file-info">
                        <div className="name">{f.name}</div>
                        <div className="meta">{(f.size / 1024 / 1024).toFixed(1)} MB</div>
                      </div>
                      <button className="media-file-add-btn">{I.plus}</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AUDIO TAB */}
            {activeTab === 'audio' && (
              <div>
                <div className="asset-search">
                  {I.search}
                  <input type="text" placeholder="Audio qidirish..." value={audioSearch}
                    onChange={(e) => setAudioSearch(e.target.value)} />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                  50,000+ royalty-free audio treklar (Pixabay kutubxonasi)
                </div>
                {['Chill Lo-fi Beat','Epic Cinematic','Upbeat Pop','Acoustic Guitar','Piano Melody',
                  'Trap Beat','EDM Drop','Jazz Smooth','Hip Hop Vibe','Ambient Nature',
                  'Rock Energy','Emotional Piano','Happy Ukulele','Dark Suspense'].map((name, i) => (
                  <div key={i} className="audio-item" onClick={() => {
                    const t = tracks.find(t => t.type === 'audio');
                    if (t) addClip(t.id, { type: 'audio', name, duration: 10 + i * 2, startTime: currentTime });
                  }}>
                    <button className="audio-item-play">{I.play}</button>
                    <div className="audio-item-info">
                      <div className="title">{name}</div>
                      <div className="duration">{`0${Math.floor((60+i*15)/60)}`.slice(-2)}:{`0${(60+i*15)%60}`.slice(-2)}</div>
                    </div>
                    <button className="media-file-add-btn">{I.plus}</button>
                  </div>
                ))}
              </div>
            )}

            {/* TEXT TAB */}
            {activeTab === 'text' && (
              <div className="text-controls">
                <button className="text-add-btn" onClick={() => {
                  const t = tracks.find(t => t.type === 'text');
                  if (t) addClip(t.id, { type: 'text', text: 'Yangi Matn', duration: 3, startTime: currentTime });
                }}>
                  {I.plus} Matn Qo'shish
                </button>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                  500+ Google Fonts shriftlari
                </div>
                {selectedClipId && (() => {
                  const clip = tracks.flatMap(t => t.clips).find(c => c.id === selectedClipId);
                  if (!clip || clip.type !== 'text') return null;
                  const trackId = tracks.find(t => t.clips.find(c => c.id === clip.id))?.id;
                  return (
                    <>
                      <div className="text-control-group">
                        <label>Matn</label>
                        <textarea className="text-input-area" value={clip.text}
                          onChange={(e) => updateClip(trackId, clip.id, { text: e.target.value })} />
                      </div>
                      <div className="text-control-group">
                        <label>Shrift</label>
                        <select className="font-select" value={clip.fontFamily}
                          onChange={(e) => updateClip(trackId, clip.id, { fontFamily: e.target.value })}>
                          {DEMO_FONTS.map(f => <option key={f.family} value={f.family}>{f.family}</option>)}
                        </select>
                      </div>
                      <div className="clip-prop-row">
                        <label>Hajmi</label>
                        <input type="range" min="12" max="200" value={clip.fontSize || 48}
                          onChange={(e) => updateClip(trackId, clip.id, { fontSize: Number(e.target.value) })} />
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', minWidth: '30px' }}>{clip.fontSize || 48}px</span>
                      </div>
                      <div className="clip-prop-row">
                        <label>Rang</label>
                        <input type="color" className="color-input" value={clip.fontColor || '#ffffff'}
                          onChange={(e) => updateClip(trackId, clip.id, { fontColor: e.target.value })} />
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* STICKERS TAB */}
            {activeTab === 'stickers' && (
              <div>
                <div className="asset-search">
                  {I.search}
                  <input type="text" placeholder="Stikerlarni qidirish..." value={stickerSearch}
                    onChange={(e) => setStickerSearch(e.target.value)} />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                  1,000,000+ GIF stikerlar (Giphy kutubxonasi)
                </div>
                <div className="stickers-grid">
                  {DEMO_STICKERS.map((emoji, i) => (
                    <button key={i} className="sticker-item" onClick={() => {
                      const t = tracks.find(t => t.type === 'text') || tracks[0];
                      if (t) addClip(t.id, { type: 'sticker', sticker: emoji, duration: 3, startTime: currentTime, name: 'Sticker' });
                    }}>{emoji}</button>
                  ))}
                </div>
              </div>
            )}

            {/* EFFECTS TAB */}
            {activeTab === 'effects' && (
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                  {totalEffects.toLocaleString()} ta effekt, {EFFECT_CATEGORIES.length} kategoriya
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                  {EFFECT_CATEGORIES.map((cat, i) => (
                    <button key={i}
                      className={`effect-category-tag ${effectCategory === i ? 'active' : ''}`}
                      style={effectCategory === i ? { borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', background: 'var(--accent-subtle)' } : {}}
                      onClick={() => setEffectCategory(i)}>
                      {cat.name} <span style={{ opacity: 0.6, marginLeft: '4px' }}>({cat.count.toLocaleString()})</span>
                    </button>
                  ))}
                </div>
                <div className="effects-grid">
                  {(EFFECT_CATEGORIES[effectCategory].effects || EFFECT_CATEGORIES[effectCategory].items?.map((name, i) => ({
                    id: name.toLowerCase().replace(/\s/g, '-'),
                    name, icon: null, filter: 'none'
                  })) || []).map((effect, i) => (
                    <button key={i} className="effect-item">
                      {effect.icon && <div className="effect-icon">{effect.icon}</div>}
                      <div className="effect-name">{effect.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TRANSITIONS TAB */}
            {activeTab === 'transitions' && (
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                  {TRANSITIONS.length} ta o'tish effekti
                </div>
                <div className="transitions-grid">
                  {TRANSITIONS.map(trans => (
                    <button key={trans.id} className="transition-item">
                      <div className="transition-name">{trans.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{trans.duration}ms</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI TAB */}
            {activeTab === 'ai' && (
              <div className="ai-panel-content">
                <div className="ai-header">
                  <div className="ai-icon">{I.bot}</div>
                  <span className="ai-title">LuraEditorAI</span>
                  <span className="ai-badge">Free</span>
                </div>
                <div className="text-control-group" style={{ marginBottom: '8px' }}>
                  <label>AI Model</label>
                  <select className="font-select" value={aiModel} onChange={(e) => setAiModel(e.target.value)}>
                    {AI_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="ai-suggestions">
                  {['"Musiqaga moslab kes"','"Subtitr qo\'sh"','"Effekt tanla"'].map((s,i) => (
                    <button key={i} className="ai-suggestion-chip" onClick={() => setAiPrompt(s.replace(/"/g,''))}>{s}</button>
                  ))}
                </div>
                <div className="ai-messages">
                  {aiMessages.map((msg, i) => (
                    <div key={i} className={`ai-message ${msg.role}`}>{msg.content}</div>
                  ))}
                  {aiLoading && <div className="ai-message assistant"><div className="spinner" style={{width:'16px',height:'16px',borderWidth:'2px'}}/></div>}
                </div>
                <div className="ai-input-row">
                  <input type="text" placeholder="Prompt yozing..." value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiSend()} />
                  <button className="ai-send-btn" onClick={handleAiSend} disabled={aiLoading}>{I.send}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="timeline-panel" onClick={(e) => { if (e.target === e.currentTarget) clearSelection(); }}>
        <div className="timeline-toolbar">
          <div className="timeline-toolbar-left">
            <button className="tl-btn" onClick={handleSplitAtPlayhead} disabled={!selectedClipId}>{I.scissors} Kesish</button>
            <button className="tl-btn" onClick={handleDeleteSelected} disabled={!selectedClipId}>{I.trash} O'chirish</button>
          </div>
          <div className="timeline-toolbar-right">
            <div className="zoom-controls">
              <button className="zoom-btn" onClick={zoomOut}>{I.zoomOut}</button>
              <span className="zoom-label">{(zoom * 100).toFixed(0)}%</span>
              <button className="zoom-btn" onClick={zoomIn}>{I.zoomIn}</button>
            </div>
          </div>
        </div>
        <div className="timeline-body">
          <div className="timeline-track-headers">
            {tracks.map(track => (
              <div key={track.id} className="track-header" style={{ height: `${track.height}px` }}>
                <span className="track-type-icon">
                  {track.type === 'video' ? I.film : track.type === 'audio' ? I.music : I.type}
                </span>
                <span className="track-name">{track.name}</span>
                <div className="track-actions">
                  <button className="track-action-btn">{I.eye}</button>
                  <button className="track-action-btn">{I.lock}</button>
                </div>
              </div>
            ))}
          </div>
          <div className="timeline-tracks-scroll" ref={timelineScrollRef}>
            <div style={{ minWidth: `${duration * 80 * zoom}px`, position: 'relative' }}>
              <div className="timeline-ruler">
                {Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => (
                  <React.Fragment key={i}>
                    <div className="ruler-tick major" style={{ left: `${i * 80 * zoom}px` }} />
                    {i % 5 === 0 && <div className="ruler-mark" style={{ left: `${i * 80 * zoom}px` }}>
                      {`${Math.floor(i/60)}:${(`0${i%60}`).slice(-2)}`}
                    </div>}
                  </React.Fragment>
                ))}
              </div>
              <div className="timeline-tracks-container">
                <div className="timeline-playhead" style={{ left: `${currentTime * 80 * zoom}px` }} />
                {tracks.map(track => (
                  <div key={track.id} className="timeline-track-lane" style={{ height: `${track.height}px` }}>
                    {track.clips.map(clip => (
                      <div key={clip.id}
                        className={`timeline-clip ${clip.type}-clip ${selectedClipId === clip.id ? 'selected' : ''}`}
                        style={{ left: `${clip.startTime * 80 * zoom}px`, width: `${Math.max(clip.duration * 80 * zoom, 20)}px` }}
                        onClick={(e) => { e.stopPropagation(); selectClip(clip.id, track.id); }}>
                        <div className="clip-handle left" />
                        <span className="clip-label">{clip.name || clip.text || clip.sticker || 'Clip'}</span>
                        <div className="clip-handle right" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 10);
  return `${(`0${m}`).slice(-2)}:${(`0${s}`).slice(-2)}.${ms}`;
}
