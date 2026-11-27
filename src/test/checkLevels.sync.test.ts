import { describe, expect, it } from 'vitest';
import CHECK_LEVELS, { forms, overrides } from '../../api/_check-levels.mjs';
import { diagnosisForm } from '../../api/_diagnosis-routing.mjs';
import { checks } from '../data/checks';

describe('서버 진단 검증 정의 동기화', () => {
  it('클라이언트 문항·선택지·등급과 정확히 일치한다', () => {
    const expected = Object.fromEntries(
      Object.entries(checks).map(([domain, definition]) => [
        domain,
        Object.fromEntries(
          definition.questions.map((question) => [
            question.id,
            Object.fromEntries(question.options.map((option) => [option.id, option.level])),
          ]),
        ),
      ]),
    );
    expect(CHECK_LEVELS).toEqual(expected);
  });

  it('문항 판 표시와 등급 덮어쓰기도 화면 정의와 같다', () => {
    for (const [domain, definition] of Object.entries(checks)) {
      expect(forms[domain], domain).toBe(diagnosisForm(definition));
      expect(overrides[domain], domain).toEqual(
        (definition.overrides ?? []).filter((o) => o.level).map((o) => ({ questionId: o.questionId, when: o.when, level: o.level })),
      );
    }
  });

  it('보기 문구 하나만 바뀌어도 판 표시가 바뀐다', () => {
    const changed = structuredClone(checks.dui);
    changed.questions[0].options[0].label += ' ';
    expect(diagnosisForm(changed)).not.toBe(diagnosisForm(checks.dui));
    expect(new Set(Object.values(forms)).size).toBe(Object.keys(forms).length);
  });
});
