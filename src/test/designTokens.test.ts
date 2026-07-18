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
});
