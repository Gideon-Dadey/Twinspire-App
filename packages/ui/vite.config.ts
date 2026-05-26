import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Standalone Vite config powering Storybook's @storybook/react-vite builder.
 * The library itself is consumed as TypeScript by the apps; this only
 * exists to support Storybook's local dev server.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@twinspire/ui': path.resolve(__dirname, 'src'),
    },
  },
});
