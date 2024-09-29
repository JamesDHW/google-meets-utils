import esbuild from 'esbuild';
import { existsSync, mkdirSync } from 'fs';

// Ensure the dist directory exists
if (!existsSync('./dist')) {
  mkdirSync('./dist');
}

const config = {
  entryPoints: ['./src/content.ts'],
  bundle: true,
  outfile: './dist/content.js',
  minify: true,
  sourcemap: true,
  target: ['chrome58'],
  format: 'esm', // Changed from 'iife' to 'esm' for ES modules
  platform: 'browser',
};

const context = await esbuild.context(config);

if (process.argv.includes('--watch')) {
  await context.watch();
  console.log('Watching for changes...');
} else {
  await context.rebuild();
  await context.dispose();
}
