import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getIndexablePaths } from '../lib/pageMeta';

interface Rewrite { source: string; destination: string }

const vercel = JSON.parse(readFileSync(join(__dirname, '../../vercel.json'), 'utf8')) as {
  rewrites: Rewrite[];
  headers: { source: string; headers: { key: string; value: string }[] }[];
  framework?: string;
  buildCommand?: string;
  outputDirectory?: string;
  crons?: { path: string; schedule: string }[];
};
const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf8')) as {
  scripts: Record<string, string>;
};
const FALLBACK_SOURCE = '/((?!api/|assets/|images/|.*\\.[A-Za-z0-9]+$).*)';

describe('Vercel 연결 규칙', () => {
  it('파기·운영 요약 cron은 매일 한국 08시대(UTC 23시)에 하나만 돈다', () => {
    expect(vercel.crons).toEqual([{ path: '/api/cron-purge', schedule: '0 23 * * *' }]);
  });

  it('사전 렌더링하지 않는 경로는 색인 제외 셸로 보낸다', () => {
    const last = vercel.rewrites.at(-1);
    expect(last).toEqual({ source: FALLBACK_SOURCE, destination: '/spa-fallback.html' });
  });

  it('셸 규칙은 페이지 주소만 받고 없는 파일·API·정적 폴더는 받지 않는다', () => {
    const shell = new RegExp(`^${FALLBACK_SOURCE}$`);
    for (const path of ['/no-such-page', '/admin', '/check/dui/result', '/services/unknown']) {
      expect(shell.test(path), `${path}은 셸로 가야 함`).toBe(true);
    }
    for (const path of [
      '/nofile.png', '/assets/index-abc123.js', '/images/x.jpg', '/favicon.ico',
      '/api/consult', '/sitemap.xml', '/robots.txt',
    ]) {
      expect(shell.test(path), `${path}은 셸로 가면 안 됨`).toBe(false);
    }
  });

  it('색인 경로마다 사전 렌더링 파일 규칙이 셸 규칙보다 앞에 있다', () => {
    const fallbackIndex = vercel.rewrites.findIndex((rule) => rule.source === FALLBACK_SOURCE);
    for (const path of getIndexablePaths().filter((p) => p !== '/')) {
      const index = vercel.rewrites.findIndex(
        (rule) => rule.source === path && rule.destination === `${path}/index.html`,
      );
      expect(index, `${path} 규칙 누락`).toBeGreaterThanOrEqual(0);
      expect(index, `${path} 규칙 순서`).toBeLessThan(fallbackIndex);
    }
  });

  it('색인 경로가 아닌 주소에는 사전 렌더링 규칙을 두지 않는다', () => {
    const indexable = new Set(getIndexablePaths());
    const extra = vercel.rewrites
      .filter((rule) => rule.source !== FALLBACK_SOURCE)
      .filter((rule) => !indexable.has(rule.source));
    expect(extra).toEqual([]);
  });

  it('Vercel이 사전 렌더링을 포함한 npm 빌드를 실행하고 dist를 배포하도록 고정한다', () => {
    expect(vercel.framework).toBe('vite');
    expect(vercel.buildCommand).toBe('npm run build');
    expect(vercel.outputDirectory).toBe('dist');
    expect(pkg.scripts.build).toContain('node scripts/prerender.mjs');
  });

  it('빌드 직후 배포 산출물 검사를 실행해 잘못된 결과물은 배포되지 않게 한다', () => {
    expect(pkg.scripts.postbuild).toBe('node scripts/verify-dist.mjs');
  });

  it('GitHub Pages용 옛 _redirects 파일을 배포물에 넣지 않는다', () => {
    expect(existsSync(join(__dirname, '../../public/_redirects'))).toBe(false);
  });

  describe('보안 헤더와 캐시', () => {
    const headerMap = (source: string) =>
      Object.fromEntries((vercel.headers.find((h) => h.source === source)?.headers ?? []).map((h) => [h.key, h.value]));

    it('모든 경로에 기본 보안 헤더와 강제 CSP가 있다', () => {
      const all = headerMap('/(.*)');
      expect(all['X-Content-Type-Options']).toBe('nosniff');
      expect(all['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
      expect(all['X-Frame-Options']).toBe('DENY');
      expect(all['Permissions-Policy']).toBe('camera=(), microphone=(), geolocation=()');
      expect(all['Content-Security-Policy-Report-Only']).toBeUndefined();
      const csp = all['Content-Security-Policy'];
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).not.toContain("'unsafe-eval'");
      const scriptSrc = csp.split(';').map((d) => d.trim()).find((d) => d.startsWith('script-src')) ?? '';
      expect(scriptSrc).not.toContain("'unsafe-inline'");
      const styleSrc = csp.split(';').map((d) => d.trim()).find((d) => d.startsWith('style-src')) ?? '';
      expect(styleSrc).toContain("'unsafe-inline'");
    });

    it('직접 지정한 HSTS는 넣지 않는다', () => {
      const keys = vercel.headers.flatMap((h) => h.headers.map((x) => x.key.toLowerCase()));
      expect(keys).not.toContain('strict-transport-security');
    });

    it('해시 파일은 오래, 이미지는 하루 캐시한다', () => {
      expect(headerMap('/assets/(.*)')['Cache-Control']).toBe('public, max-age=31536000, immutable');
      expect(headerMap('/images/(.*)')['Cache-Control']).toBe('public, max-age=86400, stale-while-revalidate=604800');
    });

    it('기존 색인 제외 헤더 3개를 유지한다', () => {
      for (const source of ['/admin', '/admin/:path*', '/check/:domain/result']) {
        expect(headerMap(source)['X-Robots-Tag']).toBe('noindex, nofollow');
      }
    });
  });
});
