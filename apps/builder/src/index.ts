#!/usr/bin/env node

import { generate } from './generate.js';
import { avaloniaGenerator } from './generators/avalonia.js';
import { reactGenerator } from './generators/react.js';
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
      const generatorName =
        process.argv[3] === '--'
          ? process.argv[4] || 'all'
          : process.argv[3] || 'all';
      const icons = scanIcons();
      switch (generatorName) {
        case 'all':
          generate(svelteGenerator, icons);
          generate(reactGenerator, icons);
          generate(avaloniaGenerator, icons);
          break;
        case 'avalonia':
          generate(avaloniaGenerator, icons);
          break;
        case 'react':
          generate(reactGenerator, icons);
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
      if (process.argv[3]) {
        console.error('Usage: builder pack');
        process.exit(1);
      }
      pack();
      break;
    }
    default:
      console.error(
        'Usage: builder <sync|generate [all|svelte|react|avalonia]|pack>',
      );
      process.exit(1);
  }
}

main();
