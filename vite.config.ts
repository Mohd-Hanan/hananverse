import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-app-html-to-index',
      closeBundle() {
        const distApp = resolve(__dirname, 'dist', 'app.html');
        const distIndex = resolve(__dirname, 'dist', 'index.html');
        if (fs.existsSync(distApp)) {
          fs.copyFileSync(distApp, distIndex);
        }
      },
    },
  ],
  base: '/hananverse/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'app.html'),
      },
    },
  },
});
