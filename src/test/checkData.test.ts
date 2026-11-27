import { checks } from '../data/checks';

const LEVELS = ['ready', 'documents', 'official', 'urgent'];

describe('진단 데이터 무결성', () => {
  const domains = Object.keys(checks) as (keyof typeof checks)[];

  it('7개 진단 분야가 모두 존재한다', () => {
    expect([...domains].sort()).toEqual(['appeal', 'dui', 'land', 'permit', 'procurement', 'suspension', 'veterans']);
  });

  it.each(domains)('%s: 문항 8~12개, ID 중복 없음, 모든 선택지에 분류·안내가 있다', (domain) => {
    const def = checks[domain];
    expect(def.questions.length).toBeGreaterThanOrEqual(8);
    expect(def.questions.length).toBeLessThanOrEqual(12);
    const previous = new Map<string, string[]>();
    for (const q of def.questions) {
      expect(previous.has(q.id)).toBe(false);
      for (const [dependsOn, allowed] of Object.entries(q.showWhen ?? {})) {
        expect(allowed.length).toBeGreaterThan(0);
        expect(previous.get(dependsOn), q.id).toEqual(expect.arrayContaining(allowed));
      }
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      const ids = q.options.map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);
      previous.set(q.id, ids);
      for (const option of q.options) {
        expect(LEVELS).toContain(option.level);
        expect(option.note.length).toBeGreaterThan(5);
      }
    }
    for (const override of def.overrides ?? []) {
      expect(previous.has(override.questionId)).toBe(true);
      for (const [id, allowed] of Object.entries(override.when)) {
        expect(previous.get(id), id).toEqual(expect.arrayContaining(allowed));
      }
    }
  });

  it('인허가의 구체적인 네 가지 사업 유형은 참고 조문을 함께 제공한다', () => {
    const question = checks.permit.questions.find((q) => q.id === 'permit-type')!;
    for (const id of ['corporation', 'factory', 'warehouse', 'business']) {
      expect(question.options.find((option) => option.id === id)?.lawRef, id).toMatch(/제\d+조/);
    }
  });

  it.each(domains)('%s: 법정 기한이나 법적 효과를 안내하는 긴급 결과에는 근거가 있다', (domain) => {
    const urgent = checks[domain].questions.flatMap((q) => q.options).filter((o) => o.level === 'urgent');
    expect(urgent.length).toBeGreaterThan(0);
    for (const o of urgent) {
      // 개별 공고·통지서의 마감을 그대로 확인하는 문항은 법정 일수를 안내하지 않는다.
      if (['dui', 'permit', 'suspension', 'veterans'].includes(domain) || /\d+일 이내|효력은|법정 기한/.test(o.note)) {
        expect(o.lawRef, o.id).toBeTruthy();
      }
    }
  });
});
