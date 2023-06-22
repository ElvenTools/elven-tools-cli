import esbuild from 'esbuild';

import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

esbuild
  .build({
    entryPoints: ['./src/index.ts'],
    target: 'ES2015',
    bundle: true,
    minify: true,
    format: 'esm',
    outdir: 'build',
    platform: 'node',
    external: [...Object.keys(pkg.dependencies)],
  })
  .catch(() => process.exit(1));
