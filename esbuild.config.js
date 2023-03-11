// eslint-disable-next-line @typescript-eslint/no-var-requires
import esbuild from 'esbuild';

esbuild
  .build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    minify: true,
    format: 'esm',
    outdir: 'build',
    platform: 'node',
    external: [
      'cosmiconfig',
      'prompts',
      'ora',
      '@multiversx/sdk-core',
      '@multiversx/sdk-network-providers',
      '@multiversx/sdk-wallet',
      'bignumber.js',
      'cross-fetch',
      'p-throttle',
      'cross-spawn',
      'axios',
      'p-event',
      'decompress',
      'get-stream',
      'got',
    ],
  })
  .catch(() => process.exit(1));
