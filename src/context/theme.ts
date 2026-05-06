/**
 * OpenCourse — Theme (Warm Amber)
 * Centralized color tokens — warm yellow/gold palette.
 */

export const THEME = {
  // Primary — warm gold/amber
  accent: '#e0af68',
  accentDim: '#4d3a1a',

  // Text — warm tones
  text: '#d5c4a1',
  textMuted: '#7c6f50',
  textHint: '#5a5039',

  // Borders — warm dark
  border: '#5a5039',
  borderFocused: '#e0af68',

  // Ghost — warm lavender/cream
  ghostBody: '#c8b88a',
  ghostEyes: '#1a1b26',
  ghostBodyHi: '#e0d0a0',

  // Status
  success: '#a9b665',
  error: '#ea6962',
  warning: '#d8a657',
  info: '#d4be98',

  // Background
  bg: '#1d2021',
  bgPanel: '#282828',
} as const;

export type ThemeKey = keyof typeof THEME;
