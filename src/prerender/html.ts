import type { PageMeta } from '../lib/pageMeta';

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

// 치환 문자열을 함수로 넘겨 본문의 `$&`·`$1` 같은 패턴이 해석되지 않게 한다.
function replaceOrThrow(html: string, pattern: RegExp, replacement: string, label: string): string {
  if (!pattern.test(html)) throw new Error(`사전 렌더링 템플릿에 ${label} 태그가 없습니다.`);
  return html.replace(pattern, () => replacement);
}

/** 빌드된 index.html 템플릿에 경로별 head와 본문을 채운다. */
export function applyPage(template: string, meta: PageMeta, bodyHtml: string): string {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  let html = template;
  html = replaceOrThrow(html, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`, 'title');
  html = replaceOrThrow(html, /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${description}" />`, 'description');
  html = replaceOrThrow(html, /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/, `<meta name="robots" content="${meta.robots}" />`, 'robots');
  html = replaceOrThrow(html, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${meta.canonical}" />`, 'canonical');
  html = replaceOrThrow(html, /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${title}" />`, 'og:title');
  html = replaceOrThrow(html, /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${description}" />`, 'og:description');
  html = replaceOrThrow(html, /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${meta.canonical}" />`, 'og:url');
  html = replaceOrThrow(html, /<div id="root"><\/div>/, `<div id="root">${bodyHtml}</div>`, 'root');
  return html;
}

/** 사전 렌더링하지 않는 경로(관리·진단 결과·없는 주소)용 빈 셸. 검색 색인에서 제외한다. */
export function toSpaFallback(template: string): string {
  let html = replaceOrThrow(template, /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/, '<meta name="robots" content="noindex, nofollow" />', 'robots');
  html = replaceOrThrow(html, /\s*<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, '', 'canonical');
  return html;
}
