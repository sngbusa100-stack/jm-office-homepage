import { describe, expect, it } from 'vitest';
import CHECK_LEVELS from '../../api/_check-levels.mjs';
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
});
