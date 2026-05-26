'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ComponentProps } from 'react';

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

/**
 * TwinSpire ships with a single, polished light theme. We keep next-themes
 * mounted (so internal libs and any future revamps stay compatible) but force
 * `light` everywhere and disable system tracking — there is no `.dark` class
 * applied to the document.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      enableColorScheme={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
