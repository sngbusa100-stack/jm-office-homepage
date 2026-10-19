import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getIndexablePaths } from '../lib/pageMeta';

interface Rewrite { source: string; destination: string }

const vercel = JSON.parse(readFileSync(join(__dirname, '../../vercel.json'), 'utf8')) as {
  rewrites: Rewrite[];
  framework?: string;
  buildCommand?: string;
  outputDirectory?: string;
  crons?: { path: string; schedule: string }[];
};
const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf8')) as {
  scripts: Record<string, string>;
};
const FALLBACK_SOURCE = '/((?!api/).*)';

describe('Vercel 연결 규칙', () => {
  it('파기·운영 요약 cron은 매일 한국 08시대(UTC 23시)에 하나만 돈다', () => {
    expect(vercel.crons).toEqual([{ path: '/api/cron-purge', schedule: '0 23 * * *' }]);
  });

  it('사전 렌더링하지 않는 경로는 색인 제외 셸로 보낸다', () => {
    const last = vercel.rewrites.at(-1);
    expect(last).toEqual({ source: FALLBACK_SOURCE, destination: '/spa-fallback.html' });
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
});
