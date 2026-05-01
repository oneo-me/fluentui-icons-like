#!/usr/bin/env node

import { generate } from './generate.js';
import { syncSource } from './sync.js';

function main() {
  const command = process.argv[2];

  switch (command) {
    case 'sync':
      syncSource();
      break;
    case 'generate':
      generate();
      break;
    default:
      console.log('Usage: builder <sync|generate>');
      process.exit(1);
  }
}

main();
