import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const dist = resolve(root, 'dist');
const ssrDir = resolve(root, 'dist-ssr');
const entry = ['entry.js', 'entry.mjs'].map((name) => resolve(ssrDir, name)).find(existsSync);
if (!entry) throw new Error('[prerender] dist-ssr에 SSR 진입점 빌드 결과가 없습니다.');

const {
  applyPage, assertIndexableBody, buildSitemapXml, getIndexablePaths, getPageMeta, renderPage, toSpaFallback,
} = await import(pathToFileURL(entry).href);

const template = await readFile(resolve(dist, 'index.html'), 'utf8');
// 홈을 덮어쓰기 전에 셸부터 만든다. 셸은 vercel.json catch-all이 가리킨다.
await writeFile(resolve(dist, 'spa-fallback.html'), toSpaFallback(template), 'utf8');

const paths = getIndexablePaths();
for (const path of paths) {
  const target = path === '/' ? resolve(dist, 'index.html') : resolve(dist, `.${path}`, 'index.html');
  await mkdir(dirname(target), { recursive: true });
  const body = renderPage(path);
  assertIndexableBody(path, body);
  await writeFile(target, applyPage(template, getPageMeta(path), body), 'utf8');
}
await writeFile(resolve(dist, 'sitemap.xml'), buildSitemapXml(paths), 'utf8');
await rm(ssrDir, { recursive: true, force: true });
console.log(`[prerender] ${paths.length}개 경로 사전 렌더링·sitemap 생성 완료`);
