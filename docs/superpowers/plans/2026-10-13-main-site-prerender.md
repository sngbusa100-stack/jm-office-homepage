# 메인 홈페이지 경로별 사전 렌더링 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 메인 홈페이지(`https://jungmyungoffice.com`)의 색인 대상 17개 경로가, JavaScript를 실행하지 않는 검색로봇에게도 경로마다 고유한 title·description·canonical·og와 실제 본문을 담은 HTML로 전달되게 한다.

**Architecture:** 빌드 마지막에 Vite SSR 빌드로 `AppRouter`를 Node에서 렌더링하는 진입점을 만들고, `scripts/prerender.mjs`가 이를 불러 경로별 `dist/<경로>/index.html`과 `dist/sitemap.xml`을 생성한다. 사전 렌더링되지 않는 경로(관리·진단 결과·없는 주소)는 `noindex` 빈 셸 `dist/spa-fallback.html`로 보낸다. 색인 경로 목록은 `getIndexablePaths()` 한 곳에서만 정의하고 사전 렌더링·sitemap·vercel.json 검사가 모두 이를 쓴다.

**Tech Stack:** React 19.2.7(`react-dom/server`의 `renderToString`), react-router-dom 7.18.1(`StaticRouter`), Vite 8.1.2(`vite build --ssr`), Vitest 4.1.9, Vercel 정적 배포.

**Spec:** 별도 스펙 문서 없음. 아래 "배경과 결정"이 스펙 역할을 한다(2026-10-13 주인님과 합의).

## 배경과 결정

- **문제(운영 실측 2026-10-13):** `curl https://jungmyungoffice.com/services/dui`의 원본 HTML이 홈과 같은 `<title>정명 행정사사무소 | 정확함으로 길을 밝히다</title>`와 `<link rel="canonical" href="https://jungmyungoffice.com" />`, 빈 `<div id="root"></div>`를 돌려준다. 경로별 메타는 `src/components/Layout.tsx`의 `useEffect`가 브라우저에서만 바꾼다. JS를 실행하지 않는 로봇에게는 모든 하위 페이지가 "홈의 중복"으로 보인다.
- **비자 사이트 선례:** `D:\홈페이지\행정사 비자진단 홈페이지\scripts\prerender.mjs`는 비자 6개 경로에 head 교체와 요약 본문을 쓴다. 다만 경로 데이터를 스크립트에 따로 적어 두어 앱 데이터와 어긋날 수 있다. 메인은 **앱 컴포넌트를 그대로 렌더링**해 단일 출처를 유지한다.
- **결정 1. 실제 컴포넌트를 렌더링한다.** 요약 본문 대신 `renderToString`으로 화면과 같은 본문(업무 설명·기한·FAQ)을 넣는다. 검색 노출에는 본문 텍스트가 중요하다.
- **결정 2. 클라이언트는 `createRoot` 그대로 둔다(hydrate하지 않음).** 첫 렌더에서 URL 유입정보(`utm_*`)를 쓰는 컴포넌트가 있어 서버 HTML과 달라질 수 있다. `createRoot`는 기존 내용을 지우고 다시 그리므로 불일치 오류가 없다. 사전 렌더링 HTML은 같은 CSS를 쓰므로 화면 차이는 없다.
- **결정 3. 홈 사전 렌더링은 `dist/index.html`에 쓰고, 빈 셸은 `dist/spa-fallback.html`로 분리한다.** Vercel은 정적 파일을 rewrite보다 먼저 제공하므로 `/`는 `index.html`을 받는다. 기존 catch-all rewrite의 목적지를 셸로 바꾼다.
- **결정 4. 셸은 `noindex, nofollow`이고 canonical이 없다.** 셸을 받는 경로는 관리·진단 결과·없는 주소뿐이라 색인되면 안 된다. 없는 주소가 "홈 canonical + index"로 색인되던 문제(soft 404)도 같이 해결된다.
- **결정 5. vercel.json에 사전 렌더링 경로별 rewrite를 명시한다.** 비자 사이트와 같은 방식이다(`/visa/e7 → /visa/e7/index.html`). 업무분야를 추가하고 규칙을 빠뜨리면 테스트와 `verify:dist`가 실패한다.
- **결정 6. sitemap은 빌드 때 생성한다.** 정적 `public/sitemap.xml`을 지운다. 지금 sitemap에 없는 `/check/dui`·`/check/suspension`·`/check/veterans`·`/check/permit`도 들어간다.

## Global Constraints

- 새 npm 의존성 추가 금지 — `react-dom/server`, `StaticRouter`는 이미 설치된 `react-dom`·`react-router-dom`에 있다.
- 화면에 보이는 문구·디자인·라우트 동작은 바꾸지 않는다.
- Node `>=20.19.0`(package.json `engines`).
- 색인 경로 목록은 `src/lib/pageMeta.ts`의 `getIndexablePaths()` 한 곳에서만 정의한다.
- 운영 설정(`office.json`의 `isOpen`, Vercel 환경변수 `CONSULT_OPEN`)은 건드리지 않는다.
- `master` push = Vercel Production 자동 배포. **push는 주인님 승인 후에만 한다.**
- 커밋 메시지는 한국어 `feat:`/`fix:`/`docs:` 형식이고, 끝에 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` 줄을 넣는다.
- 각 Task 끝에 `npm run check`가 전부 통과해야 한다.

## Review Focus

1. **운영 Vercel 라우팅:** `/services/dui`가 사전 렌더링 파일(그 경로 canonical)을 받고, `/services/nope`는 셸(`noindex`)을 받아야 한다. 로컬 테스트로는 확인할 수 없어 Task 4에서 운영 curl로 확인한다.
2. **쿼리와 끝 슬래시:** `/services/dui?utm_source=naver`는 사전 렌더링 파일을 받아야 한다. `/services/dui/`는 사전 렌더링 파일 또는 셸 중 무엇을 받는지 Task 4에서 실측하고 기록한다.
3. **클라이언트 교체:** 브라우저에서 본문이 두 번 보이거나 깜빡이지 않아야 한다. 관리 화면 `/admin`은 셸에서 정상으로 떠야 한다. Task 4에서 브라우저로 실측한다.
4. **본문의 `$` 문자:** 렌더링 본문에 `$&`·`$1` 같은 문자열 치환 패턴이 있어도 HTML이 깨지지 않아야 한다. Task 2 테스트에서 고정한다.
5. **경로 추가 시 누락:** 업무분야나 진단을 추가했는데 vercel.json 규칙이 빠지면 테스트가 실패해야 한다. Task 3 테스트에서 고정한다.

---

## 파일 구조

| 파일 | 역할 | Task |
|---|---|---|
| `src/lib/pageMeta.ts` (수정) | `getIndexablePaths()`·`buildSitemapXml()` 추가 — 색인 경로의 단일 출처 | 1 |
| `src/test/seo.test.ts` (수정) | 경로 목록·sitemap 생성 검증 | 1 |
| `src/prerender/html.ts` (신규) | 템플릿에 head·본문을 채우는 순수 함수, 셸 생성 | 2 |
| `src/prerender/entry.tsx` (신규) | SSR 진입점: `renderPage(path)`와 위 함수 재수출 | 2 |
| `src/pages/ServicePage.tsx` (수정) | 렌더 중 `window` 직접 접근 제거 | 2 |
| `src/test/setup.ts` (수정) | node 환경 테스트에서도 동작하도록 `window` 가드 | 2 |
| `src/test/prerender.test.tsx` (신규) | node 환경에서 17개 경로 렌더링·head 교체 검증 | 2 |
| `scripts/prerender.mjs` (신규) | 빌드 후 경로별 HTML·셸·sitemap 생성 | 3 |
| `package.json` (수정) | build 스크립트에 SSR 빌드·사전 렌더링 연결 | 3 |
| `vercel.json` (수정) | 경로별 rewrite + catch-all → 셸 | 3 |
| `scripts/verify-dist.mjs` (수정) | 산출물에서 경로별 파일·canonical·본문·rewrite 검증 | 3 |
| `src/test/vercelConfig.test.ts` (신규) | vercel.json 규칙과 색인 경로 일치 검증 | 3 |
| `public/sitemap.xml` (삭제) | 빌드 생성으로 대체 | 3 |
| `.gitignore` (수정) | `dist-ssr` 추가 | 3 |
| `checklist.md`, `memory.md` (수정) | 경과 기록 | 4 |

---

### Task 1: 색인 경로 단일 출처와 sitemap 생성 함수

**Files:**
- Modify: `src/lib/pageMeta.ts` (import 줄 1-2, 파일 끝에 함수 추가)
- Test: `src/test/seo.test.ts` (기존 `robots와 sitemap이 실제 공개 경로를 안내한다` 테스트 교체)

**Interfaces:**
- Consumes: 기존 `STATIC_META`(모듈 내부), `services: Service[]`(`src/data/services.ts`), `checks: Record<CheckDomain, CheckDefinition>`(`src/data/checks/index.ts`), `getPageMeta(pathname: string): PageMeta`
- Produces: `getIndexablePaths(): string[]`, `buildSitemapXml(paths?: string[]): string`

- [ ] **Step 1: 실패하는 테스트 작성** — `src/test/seo.test.ts`의 import를 바꾸고, 기존 sitemap 테스트를 아래 두 개로 교체한다.

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildSitemapXml, getIndexablePaths, getPageMeta } from '../lib/pageMeta';
```

```ts
  it('색인 경로 목록이 정적 페이지·업무분야·진단을 모두 포함한다', () => {
    const paths = getIndexablePaths();
    expect(paths).toEqual([
      '/', '/why', '/services', '/check', '/consult', '/privacy', '/disclaimer',
      '/services/dui', '/services/suspension', '/services/license',
      '/services/immigration', '/services/veterans', '/services/documents',
      '/check/dui', '/check/suspension', '/check/veterans', '/check/permit',
    ]);
    for (const path of paths) expect(getPageMeta(path).robots).toBe('index, follow');
    expect(new Set(paths.map((path) => getPageMeta(path).canonical)).size).toBe(paths.length);
  });

  it('robots와 생성 sitemap이 실제 공개 경로를 안내한다', () => {
    const robots = readFileSync(join(__dirname, '../../public/robots.txt'), 'utf8');
    const sitemap = buildSitemapXml();
    expect(robots).toContain('Sitemap: https://jungmyungoffice.com/sitemap.xml');
    expect(robots).not.toContain('Disallow: /check');
    expect(sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(sitemap).toContain('<loc>https://jungmyungoffice.com</loc>');
    expect(sitemap).toContain('<loc>https://jungmyungoffice.com/services/immigration</loc>');
    expect(sitemap).toContain('<loc>https://jungmyungoffice.com/check/permit</loc>');
    expect(sitemap).not.toContain('/result</loc>');
    expect(sitemap.match(/<loc>/g)).toHaveLength(17);
  });
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/test/seo.test.ts`
Expected: FAIL — `getIndexablePaths is not a function`(또는 export 없음 오류)

- [ ] **Step 3: 구현** — `src/lib/pageMeta.ts` 상단 import 2줄을 교체한다.

```ts
import { checks, findCheck } from '../data/checks';
import { findService, services } from '../data/services';
```

파일 끝에 추가한다.

```ts
/** 검색엔진에 색인시킬 경로. 사전 렌더링·sitemap·vercel.json 검사가 모두 이 목록을 쓴다. */
export function getIndexablePaths(): string[] {
  return [
    ...Object.keys(STATIC_META),
    ...services.map((service) => `/services/${service.slug}`),
    ...Object.keys(checks).map((domain) => `/check/${domain}`),
  ];
}

export function buildSitemapXml(paths: string[] = getIndexablePaths()): string {
  const urls = paths
    .map((path) => `  <url><loc>${getPageMeta(path).canonical}</loc></url>`)
    .join('\n');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/test/seo.test.ts`
Expected: PASS (seo.test.ts 전체)

- [ ] **Step 5: 전체 검사와 커밋**

Run: `npm run check` → Expected: 타입·테스트·빌드·verify:dist 모두 통과

```bash
git add src/lib/pageMeta.ts src/test/seo.test.ts
git commit -m "feat: 색인 경로 단일 출처와 sitemap 생성 함수

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Node에서 렌더링하는 SSR 진입점과 head 교체 함수

**Files:**
- Create: `src/prerender/html.ts`
- Create: `src/prerender/entry.tsx`
- Modify: `src/pages/ServicePage.tsx:67`
- Modify: `src/test/setup.ts`
- Test: `src/test/prerender.test.tsx`

**Interfaces:**
- Consumes: `getIndexablePaths()`, `getPageMeta()`, `buildSitemapXml()`, `SITE_URL`(Task 1·기존), `AppRouter`(`src/app/AppRouter.tsx`), `PageMeta` 타입
- Produces:
  - `escapeHtml(value: string): string`
  - `applyPage(template: string, meta: PageMeta, bodyHtml: string): string` — 템플릿의 title·description·robots·canonical·og:title·og:description·og:url을 교체하고 `<div id="root"></div>`에 본문을 넣는다. 대상 태그가 없으면 `Error`를 던진다.
  - `toSpaFallback(template: string): string` — robots를 `noindex, nofollow`로 바꾸고 canonical 링크를 제거한다.
  - `renderPage(path: string): string` — `StaticRouter`+`AppRouter`를 `renderToString`한 결과
  - `src/prerender/entry.tsx`가 위 함수들과 `getIndexablePaths`·`getPageMeta`·`buildSitemapXml`·`SITE_URL`을 함께 export한다(Task 3 스크립트가 이 하나의 번들만 import).

- [ ] **Step 1: setup.ts를 node 환경에서도 안전하게** — `src/test/setup.ts` 전체를 아래로 교체한다(동작은 jsdom에서 기존과 같음).

```ts
import '@testing-library/jest-dom/vitest';

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
    writable: true,
  });
}
```

- [ ] **Step 2: 실패하는 테스트 작성** — `src/test/prerender.test.tsx` 신규. 첫 줄의 환경 지정 주석이 핵심이다(브라우저 객체가 없는 실제 빌드 환경을 재현).

```tsx
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  applyPage,
  getIndexablePaths,
  getPageMeta,
  renderPage,
  toSpaFallback,
} from '../prerender/entry';
import { findService } from '../data/services';

const TEMPLATE = `<!doctype html>
<html lang="ko">
  <head>
    <meta name="description" content="기본 설명" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://jungmyungoffice.com" />
    <meta property="og:title" content="기본 제목" />
    <meta property="og:description" content="기본 설명" />
    <meta property="og:url" content="https://jungmyungoffice.com" />
    <title>기본 제목</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

describe('사전 렌더링', () => {
  it('브라우저 객체 없이 색인 경로 17개를 모두 렌더링한다', () => {
    expect(typeof window).toBe('undefined');
    for (const path of getIndexablePaths()) {
      const html = renderPage(path);
      expect(html, path).toContain('id="main"');
      expect(html, path).toMatch(/<h1[\s>]/);
    }
  });

  it('업무 상세 본문에 그 분야의 제목과 FAQ 질문이 들어간다', () => {
    const service = findService('dui')!;
    const html = renderPage('/services/dui');
    expect(html).toContain(service.headline);
    expect(html).toContain(service.faqs[0].q);
  });

  it('경로별 head와 본문을 템플릿에 채운다', () => {
    const meta = getPageMeta('/services/dui');
    const page = applyPage(TEMPLATE, meta, '<main id="main"><h1>본문</h1></main>');
    expect(page).toContain(`<title>${meta.title}</title>`);
    expect(page).toContain(`<meta name="description" content="${meta.description}" />`);
    expect(page).toContain('<meta name="robots" content="index, follow" />');
    expect(page).toContain('<link rel="canonical" href="https://jungmyungoffice.com/services/dui" />');
    expect(page).toContain('<meta property="og:url" content="https://jungmyungoffice.com/services/dui" />');
    expect(page).toContain(`<meta property="og:title" content="${meta.title}" />`);
    expect(page).toContain('<div id="root"><main id="main"><h1>본문</h1></main></div>');
    expect(page).not.toContain('기본 제목');
  });

  it('제목의 특수문자를 이스케이프하고 본문의 $ 치환 패턴을 그대로 둔다', () => {
    const page = applyPage(
      TEMPLATE,
      { title: 'A & "B" <C>', description: 'd', canonical: 'https://jungmyungoffice.com/x', robots: 'index, follow' },
      '<p>$& $1 $$</p>',
    );
    expect(page).toContain('<title>A &amp; &quot;B&quot; &lt;C&gt;</title>');
    expect(page).toContain('<div id="root"><p>$& $1 $$</p></div>');
  });

  it('교체할 태그가 없는 템플릿이면 조용히 넘어가지 않고 실패한다', () => {
    expect(() => applyPage('<html><head></head><body></body></html>', getPageMeta('/'), '')).toThrow(/title/);
  });

  it('셸은 색인 제외이고 canonical이 없으며 빈 root를 유지한다', () => {
    const shell = toSpaFallback(TEMPLATE);
    expect(shell).toContain('<meta name="robots" content="noindex, nofollow" />');
    expect(shell).not.toContain('rel="canonical"');
    expect(shell).toContain('<div id="root"></div>');
  });
});
```

- [ ] **Step 3: 실패 확인**

Run: `npx vitest run src/test/prerender.test.tsx`
Expected: FAIL — `Failed to resolve import "../prerender/entry"`

- [ ] **Step 4: `src/prerender/html.ts` 작성**

```ts
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
```

- [ ] **Step 5: `src/prerender/entry.tsx` 작성**

```tsx
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { AppRouter } from '../app/AppRouter';

export { buildSitemapXml, getIndexablePaths, getPageMeta, SITE_URL } from '../lib/pageMeta';
export { applyPage, escapeHtml, toSpaFallback } from './html';

/** 경로 하나를 브라우저 없이 HTML로 렌더링한다. 빌드 때 사전 렌더링에만 쓴다. */
export function renderPage(path: string): string {
  return renderToString(
    <StaticRouter location={path}>
      <AppRouter />
    </StaticRouter>,
  );
}
```

- [ ] **Step 6: 실패 원인 확인** — `npx vitest run src/test/prerender.test.tsx`
Expected: 첫 테스트가 `/services/...` 경로에서 `ReferenceError: window is not defined`로 FAIL(`src/pages/ServicePage.tsx:67`). 다른 경로에서 다른 브라우저 객체 오류가 나면 같은 방식(렌더 중 접근에 `typeof window === 'undefined'` 가드)으로 고치고 이 계획의 Task 2 기록에 추가한다.

- [ ] **Step 7: ServicePage 수정** — `src/pages/ServicePage.tsx:66-67`을 교체한다.

```tsx
  // 첫 렌더의 외부 링크에도 현재 URL의 유입정보가 바로 반영되도록 초기화한다.
  // 빌드 때 사전 렌더링(Node)에는 window가 없으므로 빈 검색어로 대신한다.
  const [attribution] = useState(() => captureAttribution(
    typeof window === 'undefined' ? '' : window.location.search,
  ));
```

- [ ] **Step 8: 통과 확인**

Run: `npx vitest run src/test/prerender.test.tsx src/test/infoPages.test.tsx`
Expected: PASS (infoPages는 jsdom에서 ServicePage의 기존 동작이 그대로인지 확인용)

- [ ] **Step 9: 전체 검사와 커밋**

Run: `npm run check` → Expected: 전부 통과

```bash
git add src/prerender/html.ts src/prerender/entry.tsx src/pages/ServicePage.tsx src/test/setup.ts src/test/prerender.test.tsx
git commit -m "feat: 브라우저 없이 경로를 렌더링하는 사전 렌더링 진입점

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: 빌드 파이프라인·Vercel 연결 규칙·산출물 검증

**Files:**
- Create: `scripts/prerender.mjs`
- Create: `src/test/vercelConfig.test.ts`
- Modify: `package.json` (`scripts.build`)
- Modify: `vercel.json` (`rewrites`)
- Modify: `scripts/verify-dist.mjs`
- Modify: `.gitignore`
- Delete: `public/sitemap.xml`

**Interfaces:**
- Consumes: `dist-ssr/entry.js`(Task 2 진입점의 SSR 빌드 결과)가 export하는 `renderPage`, `getIndexablePaths`, `getPageMeta`, `buildSitemapXml`, `applyPage`, `toSpaFallback`
- Produces: 빌드 산출물 `dist/index.html`(홈 사전 렌더링), `dist/<경로>/index.html` 16개, `dist/spa-fallback.html`, `dist/sitemap.xml`

- [ ] **Step 1: 실패하는 테스트 작성** — `src/test/vercelConfig.test.ts` 신규

```ts
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
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/test/vercelConfig.test.ts`
Expected: FAIL — 마지막 규칙 목적지가 `/index.html`이고 경로별 규칙이 없음

- [ ] **Step 3: `vercel.json`의 `rewrites` 교체** (`headers`·`crons`는 그대로)

```json
  "rewrites": [
    { "source": "/why", "destination": "/why/index.html" },
    { "source": "/services", "destination": "/services/index.html" },
    { "source": "/check", "destination": "/check/index.html" },
    { "source": "/consult", "destination": "/consult/index.html" },
    { "source": "/privacy", "destination": "/privacy/index.html" },
    { "source": "/disclaimer", "destination": "/disclaimer/index.html" },
    { "source": "/services/dui", "destination": "/services/dui/index.html" },
    { "source": "/services/suspension", "destination": "/services/suspension/index.html" },
    { "source": "/services/license", "destination": "/services/license/index.html" },
    { "source": "/services/immigration", "destination": "/services/immigration/index.html" },
    { "source": "/services/veterans", "destination": "/services/veterans/index.html" },
    { "source": "/services/documents", "destination": "/services/documents/index.html" },
    { "source": "/check/dui", "destination": "/check/dui/index.html" },
    { "source": "/check/suspension", "destination": "/check/suspension/index.html" },
    { "source": "/check/veterans", "destination": "/check/veterans/index.html" },
    { "source": "/check/permit", "destination": "/check/permit/index.html" },
    { "source": "/((?!api/).*)", "destination": "/spa-fallback.html" }
  ],
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/test/vercelConfig.test.ts`
Expected: PASS

- [ ] **Step 5: `scripts/prerender.mjs` 작성**

```js
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
  applyPage, buildSitemapXml, getIndexablePaths, getPageMeta, renderPage, toSpaFallback,
} = await import(pathToFileURL(entry).href);

const template = await readFile(resolve(dist, 'index.html'), 'utf8');
// 홈을 덮어쓰기 전에 셸부터 만든다. 셸은 vercel.json catch-all이 가리킨다.
await writeFile(resolve(dist, 'spa-fallback.html'), toSpaFallback(template), 'utf8');

const paths = getIndexablePaths();
for (const path of paths) {
  const target = path === '/' ? resolve(dist, 'index.html') : resolve(dist, `.${path}`, 'index.html');
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, applyPage(template, getPageMeta(path), renderPage(path)), 'utf8');
}
await writeFile(resolve(dist, 'sitemap.xml'), buildSitemapXml(paths), 'utf8');
await rm(ssrDir, { recursive: true, force: true });
console.log(`[prerender] ${paths.length}개 경로 사전 렌더링·sitemap 생성 완료`);
```

- [ ] **Step 6: build 스크립트 연결** — `package.json`의 `scripts.build`를 교체

```json
    "build": "tsc --noEmit && vite build && vite build --ssr src/prerender/entry.tsx --outDir dist-ssr && node scripts/prerender.mjs",
```

`.gitignore` 끝에 한 줄 추가: `dist-ssr`

`public/sitemap.xml` 삭제: `git rm public/sitemap.xml`

- [ ] **Step 7: 빌드 결과 확인**

Run: `npm run build`
Expected: 마지막 줄 `[prerender] 17개 경로 사전 렌더링·sitemap 생성 완료`

Run: `grep -o '<title>[^<]*' dist/services/dui/index.html; grep -o '<link rel="canonical"[^>]*' dist/services/dui/index.html; grep -c 'noindex' dist/spa-fallback.html; ls dist-ssr 2>&1`
Expected: `<title>음주운전 면허 구제 | 정명 행정사사무소`, canonical `https://jungmyungoffice.com/services/dui`, noindex 1 이상, `dist-ssr` 없음

- [ ] **Step 8: `scripts/verify-dist.mjs` 보강** — 파일 끝의 `console.log('[verify-dist] 배포 산출물 검증 통과');` 바로 앞에 추가한다(기존 import의 `existsSync`·`readFileSync`·`resolve`·`here`·`dist`를 그대로 쓴다).

```js
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
```

또 기존 `index.html` SEO 표식 검사 목록(`for (const marker of [...])`)은 그대로 둔다(홈 사전 렌더링에도 canonical·og:title·ld+json이 있다).

- [ ] **Step 9: 전체 검사**

Run: `npm run check`
Expected: 타입·테스트(신규 vercelConfig·prerender 포함)·빌드·`[verify-dist] 배포 산출물 검증 통과`

- [ ] **Step 10: 로컬 정적 서빙으로 클라이언트 교체 확인** — `npx vite preview --port 4180`을 백그라운드로 띄우고 브라우저로 `http://localhost:4180/services/dui/`를 연다(vite preview는 vercel.json rewrite를 모르므로 끝 슬래시로 디렉터리 index를 직접 연다). 본문이 한 번만 보이고, 콘솔 오류가 없고, 상단 메뉴로 다른 업무분야로 이동하면 제목이 바뀌는지 확인한 뒤 서버를 끈다.

- [ ] **Step 11: 커밋**

```bash
git add scripts/prerender.mjs scripts/verify-dist.mjs src/test/vercelConfig.test.ts package.json vercel.json .gitignore public/sitemap.xml
git commit -m "feat: 메인 17개 경로 사전 렌더링과 sitemap 빌드 생성

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: 운영 배포 검증과 기록 (push는 주인님 승인 후)

**Files:**
- Modify: `checklist.md`, `memory.md`

**Interfaces:**
- Consumes: Task 1~3 커밋, 운영 주소 `https://jungmyungoffice.com`
- Produces: 운영 실측 기록

- [ ] **Step 1: 주인님께 push 승인 요청** — Task 1~3 결과(테스트 수, 빌드 로그 마지막 줄)를 보고하고 승인받는다.

- [ ] **Step 2: push와 배포 대기**

```bash
git push origin master
```

Run(배포 반영 대기): `for i in $(seq 1 18); do t=$(curl -s https://jungmyungoffice.com/services/dui | grep -o '<link rel="canonical"[^>]*'); echo "$t"; case "$t" in *services/dui*) break;; esac; sleep 10; done`
Expected: `<link rel="canonical" href="https://jungmyungoffice.com/services/dui" /`

- [ ] **Step 3: 경로별 운영 실측 (Review Focus 1·2)**

```bash
for p in / /why /services /services/dui /services/immigration /check /check/permit /consult /privacy "/services/dui?utm_source=naver" /services/dui/ /services/nope /admin /check/dui/result; do
  printf "%-36s " "$p"
  curl -s -D /tmp/h -o /tmp/b "https://jungmyungoffice.com$p"
  printf "%s | robots=%s | canonical=%s | xrobots=%s\n" \
    "$(head -1 /tmp/h | tr -d '\r')" \
    "$(grep -o 'name="robots" content="[^"]*' /tmp/b | sed 's/.*content="//')" \
    "$(grep -o 'rel="canonical" href="[^"]*' /tmp/b | sed 's/.*href="//')" \
    "$(grep -i '^x-robots-tag' /tmp/h | tr -d '\r' | sed 's/.*: //')"
done
curl -s https://jungmyungoffice.com/sitemap.xml | grep -c '<loc>'
```

Expected:
- 색인 경로 9개와 `?utm_source=naver`: robots `index, follow`, canonical이 각자 경로
- `/services/nope`: robots `noindex, nofollow`, canonical 없음
- `/admin`, `/check/dui/result`: robots `noindex, nofollow`, X-Robots-Tag `noindex, nofollow`
- `/services/dui/`: 결과를 그대로 기록(사전 렌더링 파일이면 canonical `/services/dui`, 셸이면 noindex)
- sitemap `<loc>` 17

- [ ] **Step 4: 브라우저 실측 (Review Focus 3)** — 내장 브라우저로 `https://jungmyungoffice.com/services/dui`, `/admin`, `/consult`, `/check/dui`를 열어 본문 중복·깜빡임 없음, 콘솔 오류 없음, 관리 화면 로그인 폼 표시, 진단 첫 문항 선택 가능을 확인하고 스크린샷 1장을 남긴다.

- [ ] **Step 5: 기록과 커밋** — `checklist.md`에 "2026-10-13 메인 사전 렌더링(3.5단계)" 절을 추가해 Task 1~4 체크와 Step 3 실측표를 남긴다. `memory.md`에 결정 1~6과 실측 결과(특히 끝 슬래시 동작)를 기록한다.

```bash
git add checklist.md memory.md docs/superpowers/plans/2026-10-13-main-site-prerender.md
git commit -m "docs: 메인 사전 렌더링 운영 검증 기록

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push origin master
```
