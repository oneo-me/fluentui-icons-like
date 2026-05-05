#!/usr/bin/env node

import { generate } from './generate.js';
import { avaloniaGenerator } from './generators/avalonia.js';
import { svelteGenerator } from './generators/svelte.js';
import { pack } from './pack.js';
import { scanIcons } from './scan.js';
import { syncSource } from './sync.js';

function main() {
  const command = process.argv[2];

  switch (command) {
    case 'sync':
      syncSource();
      break;
    case 'generate': {
      const generatorName = process.argv[3] || 'svelte';
      const icons = scanIcons();
      switch (generatorName) {
        case 'avalonia':
          generate(avaloniaGenerator, icons);
          break;
        case 'svelte':
          generate(svelteGenerator, icons);
          break;
        default:
          console.error(`Unknown generator: ${generatorName}`);
          process.exit(1);
      }
      break;
    }
    case 'pack': {
      const version = process.argv[3];
      if (!version) {
        console.error('Usage: builder pack <version>');
        process.exit(1);
      }
      pack(version);
      break;
    }
    default:
      console.error('Usage: builder <sync|generate [generator]|pack <version>>');
      process.exit(1);
  }
}

main();
