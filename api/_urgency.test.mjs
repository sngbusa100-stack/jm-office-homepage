import { describe, expect, it } from 'vitest';
import { DEADLINE_REPORTS, URGENT_REASONS, isUrgent, urgentReasons } from './_urgency.mjs';

const base = { id: 'JM-1', topic: '음주운전 면허 구제', name: '홍길동' };

describe('기한 우선(긴급) 판정', () => {
  it('근거 네 가지를 각각 판정한다', () => {
    expect(urgentReasons({ ...base, diagnosis: { counts: { urgent: 1 } } })).toEqual(['diagnosis']);
    expect(urgentReasons({ ...base, visaIntake: { deadlineFirst: true } })).toEqual(['visaIntake']);
    expect(urgentReasons({ ...base, visaDiagnosis: { level: 'urgent' } })).toEqual(['visaDiagnosis']);
    expect(urgentReasons({ ...base, deadlineReport: 'soon' })).toEqual(['selfReported']);
    expect(urgentReasons({ ...base, deadlineReport: 'unknown' })).toEqual(['selfReported']);
  });

  it('여러 근거는 URGENT_REASONS 순서로 낸다', () => {
    expect(URGENT_REASONS).toEqual(['diagnosis', 'visaIntake', 'visaDiagnosis', 'selfReported']);
    expect(urgentReasons({
      ...base,
      deadlineReport: 'soon',
      visaDiagnosis: { level: 'urgent' },
      visaIntake: { deadlineFirst: true },
      diagnosis: { counts: { urgent: 2 } },
    })).toEqual(URGENT_REASONS);
  });

  it("'여유 있음'·'통지서 없음'과 긴급이 아닌 등급은 긴급이 아니다", () => {
    expect(DEADLINE_REPORTS).toEqual(['soon', 'later', 'unknown', 'none']);
    for (const record of [
      { ...base, deadlineReport: 'later' },
      { ...base, deadlineReport: 'none' },
      { ...base, deadlineReport: 'bogus' },
      { ...base, visaDiagnosis: { level: 'official-check' } },
      { ...base, visaIntake: { deadlineFirst: false } },
      { ...base, diagnosis: { counts: { urgent: 0, documents: 3 } } },
    ]) {
      expect(urgentReasons(record)).toEqual([]);
      expect(isUrgent(record)).toBe(false);
    }
  });

  it('파기된 접수는 긴급으로 보지 않는다', () => {
    expect(urgentReasons({ id: 'JM-1', purged: true, diagnosis: { counts: { urgent: 1 } } })).toEqual([]);
  });

  it('새 필드가 없는 예전 접수는 예전 판정식과 같은 결과를 낸다', () => {
    const legacy = (r) => Boolean(r.diagnosis?.counts?.urgent) || Boolean(r.visaIntake?.deadlineFirst);
    const records = [
      base,
      { ...base, diagnosis: { counts: { urgent: 1 } } },
      { ...base, diagnosis: { counts: { documents: 1 } } },
      { ...base, visaIntake: { deadlineFirst: true } },
      { ...base, visaIntake: { deadlineFirst: false } },
      { ...base, diagnosis: null, visaIntake: null },
    ];
    for (const record of records) expect(isUrgent(record)).toBe(legacy(record));
  });

  it('비정상 입력에도 예외 없이 빈 목록을 낸다', () => {
    expect(urgentReasons(null)).toEqual([]);
    expect(urgentReasons(undefined)).toEqual([]);
    expect(urgentReasons({ diagnosis: { counts: null } })).toEqual([]);
  });
});
