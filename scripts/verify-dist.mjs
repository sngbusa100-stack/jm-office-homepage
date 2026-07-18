import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, '../dist');

if (!existsSync(resolve(dist, 'index.html'))) {
  console.error('[verify-dist] dist/index.html이 없습니다.');
  process.exit(1);
}
for (const required of ['robots.txt', 'sitemap.xml']) {
  if (!existsSync(resolve(dist, required))) {
    console.error(`[verify-dist] dist/${required}이 없습니다.`);
    process.exit(1);
  }
}
const entries = readdirSync(dist);
if (entries.some((name) => name === 'legacy' || name === 'styles.css' || name === 'script.js')) {
  console.error('[verify-dist] 배포 산출물에 legacy 파일이 섞여 있습니다.');
  process.exit(1);
}
const index = readFileSync(resolve(dist, 'index.html'), 'utf8');
for (const marker of ['rel="canonical"', 'property="og:title"', 'application/ld+json']) {
  if (!index.includes(marker)) {
    console.error(`[verify-dist] index.html에 SEO 표식 ${marker}이 없습니다.`);
    process.exit(1);
  }
}
console.log('[verify-dist] 배포 산출물 검증 통과');
