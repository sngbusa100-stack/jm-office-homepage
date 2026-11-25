import { buildFunnelView, conversionRate, periodDates } from '../lib/funnelStats';

describe('관리 화면 퍼널 계산', () => {
  it('기준일을 포함해 거슬러 오른 날짜를 오래된 순으로 낸다(월 경계 포함)', () => {
    expect(periodDates('2026-03-02', 4)).toEqual(['2026-02-27', '2026-02-28', '2026-03-01', '2026-03-02']);
    expect(periodDates('엉뚱함', 3)).toEqual([]);
  });

  it('기간 안의 행만 합치고 분야·출처는 많은 순, 날짜별은 날짜 순으로 낸다', () => {
    const view = buildFunnelView(
      {
        days: 90,
        until: '2026-07-20',
        rows: [
          { date: '2026-07-20', event: 'diagnosis_start', domain: 'dui', source: 'naver', count: 2 },
          { date: '2026-07-18', event: 'diagnosis_start', domain: 'permit', source: 'naver', count: 5 },
          { date: '2026-07-18', event: 'diagnosis_start', domain: 'dui', source: 'direct', count: 1 },
          { date: '2026-07-10', event: 'diagnosis_start', domain: 'dui', source: 'naver', count: 100 },
        ],
      },
      7,
    );
    expect(view.dates).toHaveLength(7);
    expect(view.totals.diagnosis_start).toBe(8);
    expect(view.byDomain.diagnosis_start).toEqual([['permit', 5], ['dui', 3]]);
    expect(view.bySource.diagnosis_start).toEqual([['naver', 7], ['direct', 1]]);
    expect(view.daily.diagnosis_start).toEqual([0, 0, 0, 0, 6, 0, 2]);
  });

  it('비율은 소수 첫째 자리까지, 앞 단계가 0이면 없음', () => {
    expect(conversionRate(66, 5)).toBe(7.6);
    expect(conversionRate(0, 3)).toBeNull();
  });
});
