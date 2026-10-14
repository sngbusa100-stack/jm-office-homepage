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
