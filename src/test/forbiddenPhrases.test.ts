import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const FORBIDDEN = ['100%', '１００％', '보장합니다', '보장해', '확실히 구제', '무조건', '성공률', '반드시 구제', '전액 환불'];

function collectFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return collectFiles(full);
    return /\.(ts|tsx|json)$/.test(name) && !/\.test\./.test(name) ? [full] : [];
  });
}

describe('금지 표현 검사 (행정사법 §21의2, 표시광고법)', () => {
  const targets = [join(__dirname, '../data'), join(__dirname, '../pages')]
    .filter((dir) => existsSync(dir))
    .flatMap((dir) => collectFiles(dir));

  it('검사 대상 파일이 존재한다', () => {
    expect(targets.length).toBeGreaterThan(0);
  });

  it.each(FORBIDDEN)('콘텐츠에 "%s" 표현이 없다', (phrase) => {
    for (const file of targets) {
      const content = readFileSync(file, 'utf8');
      expect(content.includes(phrase), `${file}에 금지 표현 "${phrase}" 발견`).toBe(false);
    }
  });

  it('가상 후기 형식(별점·"OO님")을 사용하지 않는다', () => {
    for (const file of targets) {
      const content = readFileSync(file, 'utf8');
      expect(/OO\s*님|★{3,}/.test(content), `${file}에 후기 오인 형식 발견`).toBe(false);
    }
  });
});
