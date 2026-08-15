export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/* ---- Color Palette ---- */
export const COLORS = {
  primary: '#8b5cf6',
  secondary: '#d946ef',
  bg: '#08080d',
  surface: '#13131a',
  surfaceElevated: '#1a1a25',
  text: '#f1f1f4',
  textSecondary: '#8888a0',
  border: '#2a2a3a',
  danger: '#ef4444',
  success: '#22c55e',
};

/* ---- Aspect Ratios ---- */
export const ASPECT_RATIOS = {
  '16:9': { width: 1920, height: 1080 },
  '9:16': { width: 1080, height: 1920 },
  '1:1': { width: 1080, height: 1080 },
  '4:3': { width: 1440, height: 1080 },
  '4:5': { width: 1080, height: 1350 },
};

/* ---- Effects List ---- */
export const VIDEO_EFFECTS = [
  { id: 'none', name: 'Original', icon: '🎬', filter: 'none' },
  { id: 'grayscale', name: 'Grayscale', icon: '⬛', filter: 'grayscale(100%)' },
  { id: 'sepia', name: 'Sepia', icon: '🟤', filter: 'sepia(80%)' },
  { id: 'vintage', name: 'Vintage', icon: '📷', filter: 'sepia(40%) contrast(1.1) brightness(0.9) saturate(0.8)' },
  { id: 'warm', name: 'Warm', icon: '🔥', filter: 'saturate(1.4) brightness(1.05) hue-rotate(-10deg)' },
  { id: 'cool', name: 'Cool', icon: '❄️', filter: 'saturate(0.9) brightness(1.05) hue-rotate(15deg)' },
  { id: 'vibrant', name: 'Vibrant', icon: '🌈', filter: 'saturate(1.8) contrast(1.1)' },
  { id: 'dramatic', name: 'Dramatic', icon: '🎭', filter: 'contrast(1.4) brightness(0.85) saturate(1.2)' },
  { id: 'noir', name: 'Noir', icon: '🖤', filter: 'grayscale(100%) contrast(1.3) brightness(0.9)' },
  { id: 'bright', name: 'Bright', icon: '☀️', filter: 'brightness(1.3) saturate(1.1)' },
  { id: 'fade', name: 'Fade', icon: '🌫️', filter: 'contrast(0.8) brightness(1.15) saturate(0.7)' },
  { id: 'blur-light', name: 'Soft Blur', icon: '💫', filter: 'blur(1px) brightness(1.05)' },
  { id: 'invert', name: 'Invert', icon: '🔄', filter: 'invert(100%)' },
  { id: 'hue-shift', name: 'Hue Shift', icon: '🎨', filter: 'hue-rotate(90deg)' },
  { id: 'contrast-high', name: 'High Contrast', icon: '⚡', filter: 'contrast(1.6) saturate(1.2)' },
  { id: 'dreamy', name: 'Dreamy', icon: '✨', filter: 'blur(0.5px) brightness(1.15) saturate(1.3) contrast(0.9)' },
];

/* ---- Transitions ---- */
export const TRANSITIONS = [
  { id: 'none', name: 'None', icon: '➖', duration: 0 },
  { id: 'fade', name: 'Fade', icon: '🌅', duration: 500 },
  { id: 'slide-left', name: 'Slide Left', icon: '⬅️', duration: 500 },
  { id: 'slide-right', name: 'Slide Right', icon: '➡️', duration: 500 },
  { id: 'slide-up', name: 'Slide Up', icon: '⬆️', duration: 500 },
  { id: 'slide-down', name: 'Slide Down', icon: '⬇️', duration: 500 },
  { id: 'zoom-in', name: 'Zoom In', icon: '🔍', duration: 500 },
  { id: 'zoom-out', name: 'Zoom Out', icon: '🔎', duration: 500 },
  { id: 'dissolve', name: 'Dissolve', icon: '💨', duration: 700 },
  { id: 'wipe-left', name: 'Wipe Left', icon: '🧹', duration: 600 },
  { id: 'spin', name: 'Spin', icon: '🔄', duration: 600 },
  { id: 'blur', name: 'Blur', icon: '🌀', duration: 500 },
];

/* ---- Demo Fonts ---- */
export const DEMO_FONTS = [
  { family: 'Inter', category: 'sans-serif' },
  { family: 'Roboto', category: 'sans-serif' },
  { family: 'Poppins', category: 'sans-serif' },
  { family: 'Montserrat', category: 'sans-serif' },
  { family: 'Playfair Display', category: 'serif' },
  { family: 'Merriweather', category: 'serif' },
  { family: 'Fira Code', category: 'monospace' },
  { family: 'Dancing Script', category: 'handwriting' },
  { family: 'Pacifico', category: 'handwriting' },
  { family: 'Oswald', category: 'sans-serif' },
  { family: 'Raleway', category: 'sans-serif' },
  { family: 'Lato', category: 'sans-serif' },
  { family: 'Bebas Neue', category: 'sans-serif' },
  { family: 'Permanent Marker', category: 'handwriting' },
  { family: 'Orbitron', category: 'sans-serif' },
  { family: 'Lobster', category: 'handwriting' },
];

/* ---- Demo Stickers ---- */
export const DEMO_STICKERS = [
  '😀','😂','🥰','😎','🤩','😱','🥺','🤔','🤯','😈',
  '👍','👏','🙌','💪','✌️','🤞','👋','🫶','🤝','💅',
  '❤️','🔥','⭐','✨','💥','🎉','🎊','💎','🌟','💫',
  '🎬','🎥','📽️','🎞️','📹','🎤','🎧','🎵','🎶','🔊',
  '👑','🏆','🥇','💯','🎯','🚀','⚡','💡','🔔','📌',
  '🌈','🌸','🍀','🦋','🌺','🌻','🍂','❄️','☀️','🌙',
];

/* ---- Track Types ---- */
export const TRACK_TYPES = {
  VIDEO: 'video',
  AUDIO: 'audio',
  TEXT: 'text',
  STICKER: 'sticker',
  EFFECT: 'effect',
};
