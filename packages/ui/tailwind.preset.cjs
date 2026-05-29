/**
 * TwinSpire shared Tailwind preset.
 *
 * Apps consume this via:
 *   const preset = require('@twinspire/ui/tailwind-preset');
 *   module.exports = { presets: [preset], content: [...] };
 */
const animate = require('tailwindcss-animate');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [],
  theme: {
    container: {
      center: true,
      /**
       * Container side padding scale.
       *
       * Mobile-first sizing tuned for Ghana e-commerce traffic patterns
       * (~90% mobile). Tighter than the Tailwind default so product cards,
       * cart line items, and form fields get more horizontal real estate
       * on phones in the 360–414 px width band. Matches the visual density
       * of Jumia / Konga / Apple Shop on small screens (12 px / 16 px).
       */
      padding: {
        DEFAULT: '0.75rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
      },
      /**
       * Container max-widths.
       *
       * Previously listed every breakpoint, which made Tailwind cap the
       * container at each one — so a 750 px tablet viewport hit the `sm`
       * cap of 375 px and the layout collapsed into a 375 px column with
       * ~190 px of dead space on each side. The hero, product grid, and
       * checkout flow all suffered.
       *
       * Modern e-commerce (Amazon, Apple, Jumia, Konga, Stripe) uses a
       * fully fluid container until a single hard cap at the design
       * width. We do the same: fluid below 1440 px, capped at 1440 px on
       * ultra-wide monitors so the layout doesn't stretch unreasonably.
       */
      screens: {
        '2xl': '1440px',
      },
    },
    screens: {
      xs: '320px',
      sm: '375px',
      ms: '425px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
      '3xl': '1920px',
    },
    extend: {
      colors: {
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
          // Twinspire Brand Red scale (brand 500 = #E91B25 / hsl(357, 82%, 51%)).
          // Pulled the exact red from the official logo (47k pixels sampled),
          // then derived 50–950 by sweeping lightness while holding hue ~357°.
          // 50–200 stay as pale rose tints (great for soft-fill backgrounds);
          // 700–950 deepen into burgundy/oxblood for serious surfaces.
          50: '#FEF1F2',
          100: '#FEE0E2',
          200: '#FDC1C5',
          300: '#FB97A0',
          400: '#F65F6C',
          500: '#E91B25',
          600: '#C81118',
          700: '#A60C14',
          800: '#861014',
          900: '#6F1014',
          950: '#3A0608',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
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
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
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
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
          foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
        },
        success: { DEFAULT: '#10B981', foreground: '#FFFFFF' },
        warning: { DEFAULT: '#F59E0B', foreground: '#111827' },
        info: { DEFAULT: '#3B82F6', foreground: '#FFFFFF' },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Geist Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        // Consistency rule: every "card-sized" radius is locked to the brand
        // `--radius` token (currently 0.2rem). `sm`/`md` floor at 0 so tight
        // controls render with near-square corners; everything `lg` and above
        // resolves to exactly `var(--radius)` so cards, dialogs, popovers,
        // sheets, hero panels, and product cards all match.
        xs: '1px',
        sm: 'max(0px, calc(var(--radius) - 2px))',
        md: 'max(0px, calc(var(--radius) - 1px))',
        lg: 'var(--radius)',
        xl: 'var(--radius)',
        '2xl': 'var(--radius)',
        '3xl': 'var(--radius)',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(17, 24, 39, 0.05)',
        sm: '0 1px 3px 0 rgba(17, 24, 39, 0.08), 0 1px 2px -1px rgba(17, 24, 39, 0.08)',
        md: '0 4px 8px -2px rgba(17, 24, 39, 0.08), 0 2px 4px -2px rgba(17, 24, 39, 0.06)',
        lg: '0 10px 20px -4px rgba(17, 24, 39, 0.10), 0 4px 8px -4px rgba(17, 24, 39, 0.06)',
        xl: '0 20px 40px -8px rgba(17, 24, 39, 0.14), 0 8px 16px -8px rgba(17, 24, 39, 0.08)',
        '2xl': '0 32px 64px -16px rgba(17, 24, 39, 0.20)',
        glow: '0 0 0 4px rgba(233, 27, 37, 0.20)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-out': { from: { opacity: '1' }, to: { opacity: '0' } },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 200ms ease-out',
        'accordion-up': 'accordion-up 200ms ease-out',
        'fade-in': 'fade-in 200ms ease-out',
        'fade-out': 'fade-out 200ms ease-out',
        'slide-up': 'slide-up 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slide-down 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        shimmer: 'shimmer 1.8s linear infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        fastest: '75ms',
        fast: '150ms',
        moderate: '300ms',
        slow: '500ms',
        slower: '750ms',
        slowest: '1000ms',
      },
      backgroundImage: {
        'gradient-hero':
          'radial-gradient(at 80% 0%, hsl(var(--primary) / 0.18), transparent 50%), radial-gradient(at 0% 100%, hsl(var(--accent) / 0.15), transparent 50%)',
        'gradient-card': 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
        'shimmer-bg':
          'linear-gradient(90deg, transparent 0%, hsl(var(--muted-foreground) / 0.08) 50%, transparent 100%)',
      },
      backgroundSize: {
        shimmer: '200% 100%',
      },
      aspectRatio: {
        product: '4 / 5',
        banner: '21 / 9',
      },
      /**
       * z-index scale — mirrors `tokens.ts > zIndex` so semantic class names
       * like `z-sticky`, `z-toast`, `z-modal` actually compile.
       *
       * Without this extension, `z-sticky` is silently dropped by Tailwind's
       * JIT compiler and the affected element ends up with `z-index: auto`,
       * which lets any descendant stacking context (e.g. a product-card badge
       * with `z-10`) render *over* the sticky header.
       */
      zIndex: {
        hide: '-1',
        base: '0',
        raised: '10',
        dropdown: '1000',
        sticky: '1100',
        banner: '1200',
        overlay: '1300',
        modal: '1400',
        popover: '1500',
        skipLink: '1600',
        toast: '1700',
        tooltip: '1800',
      },
    },
  },
  plugins: [animate],
};
