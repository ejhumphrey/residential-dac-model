// astro.config.mjs
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';

// The output needs to be 'static' for GitHub Pages
export default defineConfig({
  output: 'static', 
  // IMPORTANT: Replace with your details
  site: 'https://ejhumphrey.github.io',
  base: '/residential-dac-model/', // Must start and end with a slash
  integrations: [react()]
});
