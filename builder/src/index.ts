#!/usr/bin/env node

import { syncSource } from './sync.js';
import { generate } from './generate.js';

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
