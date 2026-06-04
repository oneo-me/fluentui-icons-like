import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, normalizePath } from 'vite';

const rootDir = resolve(import.meta.dirname, '..', '..');
const reactIconsMarker = '/packages/react/src/icons/';
const iconFilePattern = /^FluentIcon([A-Za-z0-9]{1,3})/;

function resolveIconChunkName(id: string): string | null {
  const normalized = normalizePath(id);
  const markerIndex = normalized.indexOf(reactIconsMarker);
  if (markerIndex === -1) return null;

  const filename = normalized.slice(markerIndex + reactIconsMarker.length);
  const match = filename.match(iconFilePattern);
  if (!match) return null;

  return `icons-${match[1].toLowerCase().padEnd(3, '_')}`;
}

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [rootDir],
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: (id) => resolveIconChunkName(id) ?? undefined,
      },
    },
  },
});
