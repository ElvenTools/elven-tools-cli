// eslint-disable-next-line @typescript-eslint/no-var-requires
const esbuild = require('esbuild');

esbuild
  .build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    minify: true,
    outdir: 'build',
    platform: 'node',
    external: [
      'cosmiconfig',
      'prompt',
      'ora',
      '@elrondnetwork/erdjs',
      'bignumber.js',
    ],
  })
  .catch(() => process.exit(1));
