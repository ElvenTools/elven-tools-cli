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
