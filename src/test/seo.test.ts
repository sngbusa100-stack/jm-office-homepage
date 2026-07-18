import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getPageMeta } from '../lib/pageMeta';

describe('검색 노출 기반', () => {
  it('업무 상세 경로에 고유 제목·설명·canonical을 제공한다', () => {
    const meta = getPageMeta('/services/dui');
    expect(meta.title).toContain('음주운전 면허 구제');
    expect(meta.description).toContain('면허 정지·취소');
    expect(meta.canonical).toBe('https://jm-office-homepage.vercel.app/services/dui');
    expect(meta.robots).toBe('index, follow');
  });

  it('진단 결과와 없는 경로는 검색 색인에서 제외한다', () => {
    expect(getPageMeta('/check/dui/result').robots).toBe('noindex, nofollow');
    expect(getPageMeta('/no-such-page').robots).toBe('noindex, nofollow');
  });

  it('robots와 sitemap이 실제 공개 경로를 안내한다', () => {
    const robots = readFileSync(join(__dirname, '../../public/robots.txt'), 'utf8');
    const sitemap = readFileSync(join(__dirname, '../../public/sitemap.xml'), 'utf8');
    expect(robots).toContain('Sitemap: https://jm-office-homepage.vercel.app/sitemap.xml');
    expect(robots).not.toContain('Disallow: /check');
    expect(sitemap).toContain('<loc>https://jm-office-homepage.vercel.app/services</loc>');
    expect(sitemap).toContain('<loc>https://jm-office-homepage.vercel.app/services/immigration</loc>');
    expect(sitemap).not.toContain('/result</loc>');
  });

  it('알 수 없는 진단 도메인은 색인하지 않고 안전한 설명을 반환한다', () => {
    const meta = getPageMeta('/check/toString');
    expect(meta.robots).toBe('noindex, nofollow');
    expect(meta.title).toContain('페이지를 찾을 수 없습니다');
    expect(meta.description).toBeTruthy();
    expect(getPageMeta('/check/toString/result').title).toContain('페이지를 찾을 수 없습니다');
  });

  it('초기 HTML에 canonical·Open Graph·구조화 데이터가 있다', () => {
    const html = readFileSync(join(__dirname, '../../index.html'), 'utf8');
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('property="og:title"');
    expect(html).toContain('property="og:description"');
    expect(html).toContain('application/ld+json');
  });
});
