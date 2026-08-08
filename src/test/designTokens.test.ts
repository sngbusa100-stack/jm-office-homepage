import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function luminance(hex: string): number {
  const channels = hex.match(/[0-9a-f]{2}/gi)!.map((channel) => parseInt(channel, 16) / 255);
  const [r, g, b] = channels.map((value) => (
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  ));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(first: string, second: string): number {
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

describe('디자인 토큰 접근성', () => {
  it('강조색은 흰색 글자와 일반 텍스트 AA 대비를 충족한다', () => {
    const css = readFileSync(join(__dirname, '../styles/tokens.css'), 'utf8');
    const accent = css.match(/--accent:\s*(#[0-9a-f]{6})/i)?.[1];
    expect(accent).toBeDefined();
    expect(contrast(accent!, '#ffffff')).toBeGreaterThanOrEqual(4.5);
    expect(contrast(accent!, '#fafaf8')).toBeGreaterThanOrEqual(4.5);
  });

  it('타이포 토큰이 정의되어 있다', () => {
    const tokens = readFileSync(join(__dirname, '../styles/tokens.css'), 'utf8');
    for (const name of ['--fs-xs', '--fs-sm', '--fs-base', '--fs-lg', '--fs-xl', '--lh-tight', '--lh-snug', '--lh-body']) {
      expect(tokens, `${name} 없음`).toContain(`${name}:`);
    }
  });

  it('app.css에 하드코딩된 폰트 크기가 없다', () => {
    const css = readFileSync(join(__dirname, '../styles/app.css'), 'utf8');
    // clamp()는 뷰포트 연동 제목용이라 토큰화 대상이 아니다.
    const raw = css
      .split('\n')
      .map((line, i) => ({ line: line.trim(), no: i + 1 }))
      .filter(({ line }) => /font-size:\s*[0-9.]+rem/.test(line) && !line.includes('clamp('));
    expect(raw.map((r) => `${r.no}: ${r.line}`)).toEqual([]);
  });

  it('본문 기본 크기와 줄간격이 토큰을 쓴다', () => {
    const css = readFileSync(join(__dirname, '../styles/app.css'), 'utf8');
    expect(css).toMatch(/body\s*\{[^}]*font-size:\s*var\(--fs-base\)/);
    expect(css).toMatch(/body\s*\{[^}]*line-height:\s*var\(--lh-body\)/);
  });
});
