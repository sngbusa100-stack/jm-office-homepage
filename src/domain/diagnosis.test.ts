import { classifyAnswers, summarize, LEVEL_ORDER } from './diagnosis';
import { checks } from '../data/checks';

describe('진단 분류', () => {
  it('답변한 선택지의 분류·안내·법령을 결과 항목으로 만든다', () => {
    const answers = { 'dui-elapsed': 'd60to90' };
    const result = classifyAnswers(checks.dui, answers);
    const urgent = result.items.filter((i) => i.level === 'urgent');
    expect(urgent).toHaveLength(1);
    expect(urgent[0].lawRef).toBe('행정심판법 제27조');
    expect(urgent[0].questionText).toContain('통지서');
  });

  it('결과는 urgent → documents → official → ready 순으로 정렬된다', () => {
    const answers = {
      'dui-disposition': 'suspend',   // ready
      'dui-elapsed': 'over90',        // urgent
      'dui-evidence': 'partial',      // documents
      'dui-refusal': 'yes',           // official
    };
    const result = classifyAnswers(checks.dui, answers);
    const levels = result.items.map((i) => i.level);
    const sorted = [...levels].sort((a, b) => LEVEL_ORDER.indexOf(a) - LEVEL_ORDER.indexOf(b));
    expect(levels).toEqual(sorted);
    expect(levels[0]).toBe('urgent');
  });

  it('존재하지 않는 질문·선택지 답변은 무시한다', () => {
    const result = classifyAnswers(checks.dui, { 'fake-question': 'x', 'dui-bac': 'not-an-option' });
    expect(result.items).toHaveLength(0);
  });

  it('요약은 분야와 분류별 개수를 담는다', () => {
    const answers = { 'dui-elapsed': 'over90', 'dui-evidence': 'none' };
    const summary = summarize(checks.dui, classifyAnswers(checks.dui, answers));
    expect(summary.domain).toBe('dui');
    expect(summary.counts.urgent).toBe(1);
    expect(summary.counts.documents).toBe(1);
  });
});
