import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/env.ts'],
  outDir: 'dist',
  format: ['esm'],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: false,
  tsconfig: 'tsconfig.json',
});
