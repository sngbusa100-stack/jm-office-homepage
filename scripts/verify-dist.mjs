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
function fail(message) {
  console.error(`[verify-dist] ${message}`);
  process.exit(1);
}

const sitemap = readFileSync(resolve(dist, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (locs.length === 0) fail('sitemap.xml에 주소가 없습니다.');

const vercel = JSON.parse(readFileSync(resolve(here, '../vercel.json'), 'utf8'));
const rewrites = vercel.rewrites ?? [];
const fallbackIndex = rewrites.findIndex((rule) => rule.source === '/((?!api/).*)');
if (fallbackIndex === -1 || rewrites[fallbackIndex].destination !== '/spa-fallback.html') {
  fail('vercel.json catch-all이 /spa-fallback.html을 가리키지 않습니다.');
}

for (const loc of locs) {
  const path = new URL(loc).pathname;
  const file = path === '/' ? resolve(dist, 'index.html') : resolve(dist, `.${path}`, 'index.html');
  if (!existsSync(file)) fail(`${path} 사전 렌더링 파일이 없습니다.`);
  const html = readFileSync(file, 'utf8');
  if (!html.includes(`<link rel="canonical" href="${loc}" />`)) fail(`${path} canonical이 ${loc}가 아닙니다.`);
  if (!/<main id="main"[^>]*>[\s\S]*?<h1[\s>]/.test(html)) fail(`${path} 본문(h1)이 사전 렌더링되지 않았습니다.`);
  if (path !== '/') {
    const ruleIndex = rewrites.findIndex((rule) => rule.source === path && rule.destination === `${path}/index.html`);
    if (ruleIndex === -1 || ruleIndex > fallbackIndex) fail(`vercel.json에 ${path} 규칙이 없거나 catch-all 뒤에 있습니다.`);
  }
}

const shell = readFileSync(resolve(dist, 'spa-fallback.html'), 'utf8');
if (!shell.includes('content="noindex, nofollow"') || shell.includes('rel="canonical"') || !shell.includes('<div id="root"></div>')) {
  fail('spa-fallback.html이 색인 제외 빈 셸이 아닙니다.');
}

console.log(`[verify-dist] 배포 산출물 검증 통과 (사전 렌더링 ${locs.length}개 경로)`);
