import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const runtimeDir = '/tmp/figma-make-runtime';
const runtimeModules = path.join(runtimeDir, 'node_modules');
const { transformWithEsbuild } = await import(
  path.join(runtimeModules, 'vite/dist/node/index.js')
);

export default {
  root: runtimeDir,
  resolve: {
    alias: [
      { find: /^react$/, replacement: path.join(runtimeModules, 'react/index.js') },
      { find: /^react\/(.*)$/, replacement: path.join(runtimeModules, 'react/$1') },
      { find: /^react-dom$/, replacement: path.join(runtimeModules, 'react-dom/index.js') },
      { find: /^react-dom\/(.*)$/, replacement: path.join(runtimeModules, 'react-dom/$1') },
      {
        find: /^@heroicons\/react\/24\/solid$/,
        replacement: path.join(runtimeModules, '@heroicons/react/24/solid/esm/index.js'),
      },
      {
        find: /^@iconwrapper$/,
        replacement: path.join(repoRoot, 'Iconwrapper'),
      },
    ],
  },
  server: {
    fs: {
      allow: [repoRoot, runtimeDir],
    },
    allowedHosts: true,
  },
  plugins: [
    {
      name: 'iconwrapper-tsx-loader',
      async load(id) {
        const cleanId = id.split('?')[0];
        if (cleanId === path.join(repoRoot, 'Iconwrapper')) {
          const code = await fs.promises.readFile(cleanId, 'utf8');
          return transformWithEsbuild(code, 'IconWrapper.tsx', {
            loader: 'tsx',
            jsx: 'automatic',
          });
        }
        return null;
      },
    },
  ],
};
