import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  server: {
    // 로컬 시험: `npx vercel dev --listen 3300`으로 API 함수를 띄우면
    // vite(5173) 화면에서 /api 호출이 그쪽으로 전달된다.
    // (vercel dev 단독은 SPA rewrite가 vite 모듈 경로를 가로채 화면이 뜨지 않음)
    proxy: {
      '/api': 'http://localhost:3300',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
