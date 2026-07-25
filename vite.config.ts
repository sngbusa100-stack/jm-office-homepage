import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    // 로컬 시험: `npx vercel dev --listen 3300`으로 API 함수를 띄우면
    // vite(5173) 화면에서 /api 호출이 그쪽으로 전달된다.
    // (vercel dev 단독은 SPA rewrite가 vite 모듈 경로를 가로채 화면이 뜨지 않음)
    // `--mode e2e`는 외부 저장소 대신 scripts/e2e-mock-server.mjs(:3301)를 쓴다.
    proxy: {
      '/api': mode === 'e2e'
        ? `http://127.0.0.1:${process.env.E2E_MOCK_PORT ?? '3301'}`
        : process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3300',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
}));
