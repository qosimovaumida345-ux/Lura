export const API_URL = import.meta.env.VITE_API_URL || 'https://lura-mv3z.onrender.com/api';

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

/* ---- Effects Generator ---- */
const generateEffects = () => {
  const effects = [{ id: 'none', name: 'Original', icon: '🎬', filter: 'none' }];
  const hues = [0, 45, 90, 135, 180, 225, 270, 315];
  const saturations = [0, 0.5, 1, 1.5, 2, 3];
  const contrasts = [0.5, 0.8, 1, 1.2, 1.5, 2];
  const brightnesses = [0.5, 0.8, 1, 1.2, 1.5];
  
  let count = 1;
  for (let h of hues) {
    for (let s of saturations) {
      for (let c of contrasts) {
        for (let b of brightnesses) {
          if (count > 500) break; // Limit to 500 so UI doesn't crash
          if (h===0 && s===1 && c===1 && b===1) continue;
          effects.push({
            id: `effect-${count}`,
            name: `Filter #${count}`,
            icon: '✨',
            filter: `hue-rotate(${h}deg) saturate(${s}) contrast(${c}) brightness(${b})`
          });
          count++;
        }
      }
    }
  }
  return effects;
};

export const VIDEO_EFFECTS = generateEffects();

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
