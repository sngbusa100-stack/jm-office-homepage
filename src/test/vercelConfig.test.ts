import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getIndexablePaths } from '../lib/pageMeta';

interface Rewrite { source: string; destination: string }

const vercel = JSON.parse(readFileSync(join(__dirname, '../../vercel.json'), 'utf8')) as {
  rewrites: Rewrite[];
};
const FALLBACK_SOURCE = '/((?!api/).*)';

describe('Vercel 연결 규칙', () => {
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
});
