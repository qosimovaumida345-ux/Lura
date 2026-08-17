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

/* ---- 1. Filtrlar Generator ---- */
const generateFiltrlar = () => {
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
          if (count > 500) break;
          if (h === 0 && s === 1 && c === 1 && b === 1) continue;
          effects.push({
            id: `filter-${count}`,
            name: `Filtr #${count}`,
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

/* ---- 2. Color Grading Generator ---- */
const generateColorGrading = () => {
  const presets = [
    { name: 'Teal & Orange', filter: 'contrast(1.2) saturate(1.4) hue-rotate(-15deg) sepia(0.2)' },
    { name: 'Cinematic Warm', filter: 'sepia(0.3) saturate(1.3) contrast(1.1) brightness(1.05)' },
    { name: 'Bleach Bypass', filter: 'contrast(1.6) saturate(0.5) brightness(1.1)' },
    { name: 'Cross Process', filter: 'contrast(1.3) saturate(1.5) hue-rotate(40deg)' },
    { name: 'Film Noir', filter: 'grayscale(100%) contrast(1.5) brightness(0.9)' },
    { name: 'Golden Hour', filter: 'sepia(0.4) saturate(1.6) contrast(1.1) hue-rotate(-20deg)' },
    { name: 'Moonlight Cool', filter: 'hue-rotate(180deg) saturate(0.7) contrast(1.2) brightness(0.85)' },
    { name: 'Sunset Glow', filter: 'saturate(1.8) contrast(1.2) hue-rotate(-10deg) brightness(1.1)' },
    { name: 'Arctic Blue', filter: 'hue-rotate(160deg) saturate(1.2) contrast(1.1) brightness(1.05)' },
    { name: 'Desert Sand', filter: 'sepia(0.5) contrast(1.1) saturate(1.1) brightness(1.15)' },
    { name: 'Forest Green', filter: 'hue-rotate(70deg) saturate(1.3) contrast(1.1)' },
    { name: 'Urban Moody', filter: 'contrast(1.4) saturate(0.7) brightness(0.9)' },
    { name: 'Cyberpunk Neon', filter: 'contrast(1.5) saturate(2) hue-rotate(280deg)' },
    { name: 'Vintage 1970', filter: 'sepia(0.6) contrast(0.9) brightness(1.1) saturate(1.2)' },
    { name: 'Kodak Gold', filter: 'sepia(0.25) saturate(1.4) contrast(1.15) brightness(1.05)' },
    { name: 'Fuji Velvia', filter: 'saturate(1.7) contrast(1.3) brightness(1.02)' },
    { name: 'Soft Pastel', filter: 'contrast(0.85) brightness(1.2) saturate(0.9)' },
    { name: 'Matte Shadow', filter: 'contrast(0.8) brightness(1.1) saturate(0.85)' },
    { name: 'Rich Velvet', filter: 'contrast(1.35) saturate(1.3) brightness(0.95)' },
    { name: 'High Key Pure', filter: 'brightness(1.35) contrast(0.9) saturate(1.1)' },
  ];
  return presets.map((p, i) => ({
    id: `cg-${i + 1}`,
    name: p.name,
    icon: '🎨',
    filter: p.filter
  }));
};

/* ---- 3. Glitch Generator ---- */
const generateGlitch = () => {
  const glitches = [];
  const intensities = [0.8, 1.1, 1.4, 1.8, 2.2];
  const hues = [60, 120, 180, 240, 300];
  let id = 1;
  for (let inten of intensities) {
    for (let h of hues) {
      glitches.push({
        id: `glitch-${id}`,
        name: `Glitch FX #${id}`,
        icon: '⚡',
        filter: `invert(${Math.round(inten * 20)}%) contrast(${inten}) hue-rotate(${h}deg) saturate(${inten * 1.5})`
      });
      id++;
    }
  }
  glitches.push(
    { id: `glitch-rgb`, name: 'RGB Split Mode', icon: '⚡', filter: 'contrast(1.6) hue-rotate(90deg) saturate(2)' },
    { id: `glitch-vhs`, name: 'VHS Static Tone', icon: '📺', filter: 'contrast(1.3) sepia(0.3) saturate(1.4) brightness(1.1)' },
    { id: `glitch-datamosh`, name: 'Data Inversion', icon: '👾', filter: 'invert(80%) hue-rotate(180deg)' }
  );
  return glitches;
};

/* ---- 4. Blur Generator ---- */
const generateBlur = () => {
  const blurs = [];
  for (let r = 1; r <= 20; r++) {
    blurs.push({
      id: `blur-${r}px`,
      name: `Soft Blur ${r}px`,
      icon: '🌫️',
      filter: `blur(${r}px)`
    });
  }
  blurs.push(
    { id: 'blur-glow', name: 'Dream Glow', icon: '💫', filter: 'blur(2px) brightness(1.2) contrast(1.1)' },
    { id: 'blur-fog', name: 'Dense Fog', icon: '🌁', filter: 'blur(5px) brightness(1.1) contrast(0.8)' },
    { id: 'blur-tilt', name: 'Tilt Shift Aura', icon: '🔍', filter: 'blur(1.5px) saturate(1.4) contrast(1.2)' }
  );
  return blurs;
};

/* ---- 5. Light Leaks Generator ---- */
const generateLightLeaks = () => {
  const leaks = [
    { name: 'Warm Flare', filter: 'sepia(0.5) brightness(1.25) saturate(1.5)' },
    { name: 'Amber Sunrise', filter: 'sepia(0.4) brightness(1.3) hue-rotate(-25deg) saturate(1.8)' },
    { name: 'Cool Prism', filter: 'brightness(1.2) hue-rotate(190deg) saturate(1.3)' },
    { name: 'Rose Quartz', filter: 'brightness(1.18) hue-rotate(320deg) saturate(1.4)' },
    { name: 'Golden Beam', filter: 'brightness(1.35) contrast(1.1) saturate(1.6) sepia(0.3)' },
    { name: 'Sunburst Flash', filter: 'brightness(1.4) contrast(0.95) saturate(1.3)' },
    { name: 'Anamorphic Blue', filter: 'hue-rotate(175deg) brightness(1.15) contrast(1.25)' },
    { name: 'Soft Haze Glow', filter: 'brightness(1.2) contrast(0.85) saturate(1.1) blur(0.5px)' },
    { name: 'Violet Halo', filter: 'hue-rotate(260deg) brightness(1.2) saturate(1.5)' },
    { name: 'Emerald Flare', filter: 'hue-rotate(85deg) brightness(1.2) saturate(1.4)' },
    { name: 'Fire Orange Glow', filter: 'hue-rotate(-40deg) saturate(2.2) brightness(1.25)' },
    { name: 'Sunset Spill', filter: 'sepia(0.6) hue-rotate(-15deg) brightness(1.2) saturate(1.5)' },
    { name: 'Rainbow Leak', filter: 'hue-rotate(110deg) saturate(1.8) brightness(1.15)' },
    { name: 'Studio Spotlight', filter: 'brightness(1.3) contrast(1.2) saturate(1.1)' },
    { name: 'Daylight Beam', filter: 'brightness(1.22) contrast(1.05) saturate(1.2)' },
  ];
  return leaks.map((l, i) => ({
    id: `leak-${i + 1}`,
    name: l.name,
    icon: '☀️',
    filter: l.filter
  }));
};

/* ---- 6. Particles Generator ---- */
const generateParticles = () => {
  const particles = [
    { name: 'Snow Frosting', filter: 'brightness(1.15) contrast(1.1) saturate(0.8) hue-rotate(180deg)' },
    { name: 'Star Dust Glow', filter: 'brightness(1.25) contrast(1.2) saturate(1.3)' },
    { name: 'Vintage Grain', filter: 'contrast(1.3) sepia(0.35) brightness(0.95)' },
    { name: 'Firefly Sparkle', filter: 'brightness(1.3) saturate(1.7) hue-rotate(45deg)' },
    { name: 'Deep Nebula', filter: 'contrast(1.4) hue-rotate(270deg) saturate(1.8)' },
    { name: 'Cinematic Smoke', filter: 'contrast(0.9) brightness(1.1) saturate(0.6)' },
    { name: 'Midnight Ash', filter: 'grayscale(60%) contrast(1.2) brightness(0.85)' },
    { name: 'Golden Confetti', filter: 'sepia(0.5) saturate(2) brightness(1.2) contrast(1.15)' },
    { name: 'Glitter Shimmer', filter: 'brightness(1.35) saturate(1.5) contrast(1.1)' },
    { name: 'Rainstorm Grey', filter: 'contrast(1.15) saturate(0.5) brightness(0.9) hue-rotate(190deg)' },
  ];
  return particles.map((p, i) => ({
    id: `particle-${i + 1}`,
    name: p.name,
    icon: '✨',
    filter: p.filter
  }));
};

/* ---- 7. Overlay Generator ---- */
const generateOverlay = () => {
  const overlays = [
    { name: 'Vignette Cinematic', filter: 'contrast(1.25) brightness(0.92) saturate(1.1)' },
    { name: 'Duotone Cyan/Red', filter: 'contrast(1.5) hue-rotate(180deg) saturate(2.5)' },
    { name: 'Duotone Purple/Yellow', filter: 'contrast(1.4) hue-rotate(290deg) saturate(2)' },
    { name: 'Retro 8mm Film', filter: 'sepia(0.7) contrast(1.3) brightness(0.95) saturate(0.9)' },
    { name: 'Polaroid Frame Tone', filter: 'sepia(0.2) contrast(1.05) brightness(1.15) saturate(1.2)' },
    { name: 'Monochrome High-Key', filter: 'grayscale(100%) contrast(1.8) brightness(1.1)' },
    { name: 'Sepia Vintage Print', filter: 'sepia(100%) contrast(1.1) brightness(0.95)' },
    { name: 'Washed Out Film', filter: 'contrast(0.75) brightness(1.25) saturate(0.7)' },
    { name: 'Midnight Blue Overlay', filter: 'hue-rotate(210deg) saturate(1.5) contrast(1.2) brightness(0.8)' },
    { name: 'Amber Warm Overlay', filter: 'hue-rotate(-20deg) sepia(0.4) saturate(1.5) brightness(1.05)' },
  ];
  return overlays.map((o, i) => ({
    id: `overlay-${i + 1}`,
    name: o.name,
    icon: '🎞️',
    filter: o.filter
  }));
};

/* ---- 8. Distortion Generator ---- */
const generateDistortion = () => {
  const distortions = [
    { name: 'Solarize Invert', filter: 'invert(75%) hue-rotate(180deg) contrast(1.5)' },
    { name: 'Thermal Heat Vision', filter: 'contrast(2) saturate(3) hue-rotate(90deg)' },
    { name: 'X-Ray Scanner', filter: 'invert(100%) grayscale(100%) contrast(2)' },
    { name: 'Psychedelic Acid', filter: 'hue-rotate(140deg) saturate(4) contrast(1.4)' },
    { name: 'Edge Posterize', filter: 'contrast(3) saturate(1.5)' },
    { name: 'High Pass Edge', filter: 'contrast(2.5) grayscale(80%) brightness(1.1)' },
    { name: 'Negative Spectrum', filter: 'invert(100%) hue-rotate(270deg)' },
    { name: 'Radioactive Glow', filter: 'hue-rotate(80deg) saturate(3) contrast(1.3) brightness(1.2)' },
    { name: 'Ultra High Contrast', filter: 'contrast(3.5) brightness(0.9)' },
    { name: 'Deep Color Burn', filter: 'contrast(2) brightness(0.7) saturate(2)' },
  ];
  return distortions.map((d, i) => ({
    id: `distort-${i + 1}`,
    name: d.name,
    icon: '🌀',
    filter: d.filter
  }));
};

export const VIDEO_EFFECTS = generateFiltrlar();
export const COLOR_GRADING_EFFECTS = generateColorGrading();
export const GLITCH_EFFECTS = generateGlitch();
export const BLUR_EFFECTS = generateBlur();
export const LIGHT_LEAKS_EFFECTS = generateLightLeaks();
export const PARTICLES_EFFECTS = generateParticles();
export const OVERLAY_EFFECTS = generateOverlay();
export const DISTORTION_EFFECTS = generateDistortion();

/* ---- Effect Categories (Strictly matches real count) ---- */
export const EFFECT_CATEGORIES = [
  { name: 'Filtrlar', effects: VIDEO_EFFECTS, count: VIDEO_EFFECTS.length },
  { name: 'Color Grading', effects: COLOR_GRADING_EFFECTS, count: COLOR_GRADING_EFFECTS.length },
  { name: 'Glitch', effects: GLITCH_EFFECTS, count: GLITCH_EFFECTS.length },
  { name: 'Blur', effects: BLUR_EFFECTS, count: BLUR_EFFECTS.length },
  { name: 'Light Leaks', effects: LIGHT_LEAKS_EFFECTS, count: LIGHT_LEAKS_EFFECTS.length },
  { name: 'Particles', effects: PARTICLES_EFFECTS, count: PARTICLES_EFFECTS.length },
  { name: 'Overlay', effects: OVERLAY_EFFECTS, count: OVERLAY_EFFECTS.length },
  { name: 'Distortion', effects: DISTORTION_EFFECTS, count: DISTORTION_EFFECTS.length },
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
