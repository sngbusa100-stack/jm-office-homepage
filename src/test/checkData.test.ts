import { checks } from '../data/checks';

const LEVELS = ['ready', 'documents', 'official', 'urgent'];

describe('진단 데이터 무결성', () => {
  const domains = Object.keys(checks);

  it('4개 도메인이 모두 존재한다', () => {
    expect(domains.sort()).toEqual(['dui', 'permit', 'suspension', 'veterans']);
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

  it('인허가: 유형 선택지에 업종별 근거 조문이 붙는다', () => {
    const typeQuestion = checks.permit.questions.find((q) => q.id === 'permit-type');
    expect(typeQuestion, 'permit-type 문항 없음').toBeDefined();
    // '어떤 인허가인지 모르겠다'는 업종이 특정되지 않아 조문을 붙일 수 없다.
    const citable = typeQuestion!.options.filter((o) => o.id !== 'unknown');
    expect(citable.length).toBeGreaterThan(0);
    for (const option of citable) {
      expect(option.lawRef, `${option.id}에 근거 조문 없음`).toMatch(/제\d+조/);
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
