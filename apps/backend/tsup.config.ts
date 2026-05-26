import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['esm'],
  target: 'node20',
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  dts: false,
  shims: true,
  skipNodeModulesBundle: true,
  treeshake: true,
  banner: { js: '#!/usr/bin/env node' },
});
