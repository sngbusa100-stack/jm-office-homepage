import { checks } from '../data/checks';

const LEVELS = ['ready', 'documents', 'official', 'urgent'];

describe('진단 데이터 무결성', () => {
  const domains = Object.keys(checks);

  it('3개 도메인이 모두 존재한다', () => {
    expect(domains.sort()).toEqual(['dui', 'suspension', 'veterans']);
  });

  it.each(domains)('%s: 문항 8~12개, ID 중복 없음, 모든 선택지에 분류·안내가 있다', (domain) => {
    const def = checks[domain as keyof typeof checks];
    expect(def.questions.length).toBeGreaterThanOrEqual(8);
    expect(def.questions.length).toBeLessThanOrEqual(12);
    const ids = def.questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const q of def.questions) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      const optionIds = q.options.map((o) => o.id);
      expect(new Set(optionIds).size).toBe(optionIds.length);
      for (const o of q.options) {
        expect(LEVELS).toContain(o.level);
        expect(o.note.length).toBeGreaterThan(5);
      }
    }
  });

  it.each(domains)('%s: 기한 관련 긴급 선택지에는 근거 법령이 있다', (domain) => {
    const def = checks[domain as keyof typeof checks];
    const urgentOptions = def.questions.flatMap((q) => q.options).filter((o) => o.level === 'urgent');
    expect(urgentOptions.length).toBeGreaterThan(0);
    for (const o of urgentOptions) {
      expect(o.lawRef, `${o.id}에 lawRef 없음`).toBeTruthy();
    }
  });
});
