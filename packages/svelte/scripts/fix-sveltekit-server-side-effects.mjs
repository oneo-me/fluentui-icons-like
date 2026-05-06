import { mkdirSync, writeFileSync } from 'node:fs';

mkdirSync('.svelte-kit/output/server', { recursive: true });
writeFileSync(
  '.svelte-kit/output/server/package.json',
  `${JSON.stringify({ sideEffects: true }, null, 2)}\n`,
);
