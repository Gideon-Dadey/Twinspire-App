/**
 * TwinSpire design tokens — single source of truth for the design system.
 *
 * Tokens are exported in TS for runtime usage, mirrored as CSS variables in
 * `styles/globals.css`, and exposed to Tailwind via `tailwind.preset.cjs`.
 *
 * Brand palette:
 *   primary  → #F97316 (Voltage Orange)
 *   secondary→ #111827 (Onyx)
 *   accent   → #F59E0B (Amber)
 */

export const palette = {
  primary: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
    950: '#431407',
  },
  secondary: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#111827',
    950: '#020617',
  },
  accent: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
    950: '#09090B',
    1000: '#000000',
  },
  success: { 50: '#ECFDF5', 500: '#10B981', 600: '#059669', 700: '#047857' },
  warning: { 50: '#FFFBEB', 500: '#F59E0B', 600: '#D97706', 700: '#B45309' },
  danger: { 50: '#FEF2F2', 500: '#EF4444', 600: '#DC2626', 700: '#B91C1C' },
  info: { 50: '#EFF6FF', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8' },
} as const;

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    display: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
    mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
  },
  fontSize: {
    '2xs': ['0.6875rem', { lineHeight: '1rem' }],
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1.1' }],
    '6xl': ['3.75rem', { lineHeight: '1.05' }],
    '7xl': ['4.5rem', { lineHeight: '1.05' }],
    '8xl': ['6rem', { lineHeight: '1' }],
    '9xl': ['8rem', { lineHeight: '1' }],
  },
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
} as const;

export const radii = {
  none: '0px',
  xs: '2px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  '4xl': '32px',
  full: '9999px',
} as const;

export const shadows = {
  xs: '0 1px 2px 0 rgba(17, 24, 39, 0.05)',
  sm: '0 1px 3px 0 rgba(17, 24, 39, 0.08), 0 1px 2px -1px rgba(17, 24, 39, 0.08)',
  md: '0 4px 8px -2px rgba(17, 24, 39, 0.08), 0 2px 4px -2px rgba(17, 24, 39, 0.06)',
  lg: '0 10px 20px -4px rgba(17, 24, 39, 0.10), 0 4px 8px -4px rgba(17, 24, 39, 0.06)',
  xl: '0 20px 40px -8px rgba(17, 24, 39, 0.14), 0 8px 16px -8px rgba(17, 24, 39, 0.08)',
  '2xl': '0 32px 64px -16px rgba(17, 24, 39, 0.20)',
  inner: 'inset 0 2px 4px 0 rgba(17, 24, 39, 0.06)',
  glow: '0 0 0 4px rgba(249, 115, 22, 0.20)',
} as const;

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  56: '14rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
} as const;

export const screens = {
  xs: '320px',
  sm: '375px',
  ms: '425px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1440px',
  '3xl': '1920px',
} as const;

export const zIndex = {
  hide: -1,
  base: 0,
  raised: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

export const motion = {
  duration: {
    fastest: '75ms',
    fast: '150ms',
    base: '200ms',
    moderate: '300ms',
    slow: '500ms',
    slower: '750ms',
    slowest: '1000ms',
  },
  easing: {
    linear: 'linear',
    'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
    'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
    'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
} as const;

export const tokens = {
  palette,
  typography,
  radii,
  shadows,
  spacing,
  screens,
  zIndex,
  motion,
} as const;

export type TwinSpireTokens = typeof tokens;
