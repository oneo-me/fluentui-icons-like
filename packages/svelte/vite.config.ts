import { normalizePath } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalized = normalizePath(id);
          const marker = '/src/lib/icons/';
          const markerIndex = normalized.indexOf(marker);

          if (markerIndex === -1) return undefined;

          const filename = normalized
            .slice(markerIndex + marker.length)
            .replace(/\.svelte.*$/, '');
          const group = filename[0]?.toLowerCase();

          return group ? `icons-${group}` : 'icons';
        },
      },
    },
  },
});
