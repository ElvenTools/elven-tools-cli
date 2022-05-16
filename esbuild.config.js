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
      'prompts',
      'ora',
      '@elrondnetwork/erdjs',
      '@elrondnetwork/erdjs-walletcore',
      '@elrondnetwork/erdjs-network-providers',
      'bignumber.js',
      'cross-fetch',
      'p-throttle',
      'download',
      'cross-spawn',
      'axios',
    ],
  })
  .catch(() => process.exit(1));
