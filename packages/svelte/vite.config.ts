import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, normalizePath } from 'vite';

const ICON_MARKER = '/src/lib/icons/';
const ICON_FILE_PATTERN = /^FluentIcon([A-Za-z])([A-Za-z]?)/;

function resolveIconChunkName(id: string): string | null {
  const normalized = normalizePath(id);
  const markerIndex = normalized.indexOf(ICON_MARKER);
  if (markerIndex === -1) return null;

  const filename = normalized.slice(markerIndex + ICON_MARKER.length);
  const match = filename.match(ICON_FILE_PATTERN);
  if (!match) return null;

  const first = match[1].toLowerCase();
  const second = (match[2] ?? '').toLowerCase();
  return `icons-${first}${second || '_'}`;
}

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => resolveIconChunkName(id) ?? undefined,
      },
    },
  },
});
