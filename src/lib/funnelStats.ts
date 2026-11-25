// 관리 화면 전환 퍼널 계산 — 서버(api/_funnel.mjs)가 보낸 날짜별 행으로 기간 합계·내역·추이를 만든다.
import type { FunnelRow, FunnelSummary } from './adminApi';

export const FUNNEL_PERIODS = [7, 30, 90] as const;
export type FunnelPeriod = typeof FUNNEL_PERIODS[number];

/** 퍼널 칸 순서. 연락 버튼 누름은 단계가 아니라 창구별 횟수라 칸에 넣지 않는다. */
export const FUNNEL_STEPS = [
  { key: 'landing_view', label: '설명 조회' },
  { key: 'landing_cta_click', label: '다음 단계 클릭' },
  { key: 'diagnosis_start', label: '진단 시작' },
  { key: 'diagnosis_complete', label: '진단 완료' },
  { key: 'consult_view', label: '상담 화면' },
  { key: 'consult_submit', label: '상담 접수' },
] as const;

/**
 * 넘어간 비율을 볼 짝. 칸이 한 줄로 이어진 흐름이 아니므로(진단은 업무 설명을 거치지 않고도 시작한다)
 * 같은 화면 안의 앞뒤 단계끼리만 비율을 낸다.
 */
export const FUNNEL_PAIRS = [
  { from: 'landing_view', to: 'landing_cta_click', label: '설명 조회 → 다음 단계 클릭' },
  { from: 'diagnosis_start', to: 'diagnosis_complete', label: '진단 시작 → 진단 완료' },
  { from: 'consult_view', to: 'consult_submit', label: '상담 화면 → 상담 접수' },
] as const;

/** 비율을 믿기 어려운 표본 크기(앞 단계 건수가 이보다 적으면 표시). */
export const SMALL_SAMPLE = 30;

export const DOMAIN_LABEL: Record<string, string> = {
  home: '홈·공통 화면',
  dui: '음주운전 면허 구제',
  suspension: '영업정지·행정심판',
  permit: '인허가 대리',
  visa: '출입국·비자',
  veterans: '국가보훈 등록',
  documents: '토지보상·내용증명·계약서',
  d2: '비자 D-2',
  d10: '비자 D-10',
  e7: '비자 E-7',
  f27: '비자 F-2-7',
  f5: '비자 F-5',
  f6: '비자 F-6',
};

export const SOURCE_LABEL: Record<string, string> = {
  direct: '직접 방문·출처 모름',
  naver: '네이버',
  google: '구글',
  kakao: '카카오·다음',
  instagram: '인스타그램',
  facebook: '페이스북',
  youtube: '유튜브',
  blog: '블로그',
  jm_main: '정명 홈페이지',
  jm_visa_precheck: '비자 진단 사이트',
  referral: '다른 사이트 링크',
  newsletter: '소식지',
  other: '기타',
};

export interface FunnelView {
  days: number;
  /** 오래된 날부터 기준일까지(KST, YYYY-MM-DD). */
  dates: string[];
  totals: Record<string, number>;
  /** 이벤트별 [분야, 건수] — 많은 순. */
  byDomain: Record<string, Array<[string, number]>>;
  /** 이벤트별 [출처, 건수] — 많은 순. */
  bySource: Record<string, Array<[string, number]>>;
  /** 이벤트별 날짜 순 건수(dates와 같은 순서). */
  daily: Record<string, number[]>;
}

/** 기준일(포함)에서 거슬러 days일, 오래된 날부터. */
export function periodDates(until: string, days: number): string[] {
  const end = Date.parse(`${until}T00:00:00Z`);
  if (!Number.isFinite(end)) return [];
  return Array.from({ length: days }, (_, index) =>
    new Date(end - (days - 1 - index) * 86_400_000).toISOString().slice(0, 10),
  );
}

function sortedEntries(counts: Map<string, number>): Array<[string, number]> {
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export function buildFunnelView(summary: FunnelSummary, days: number): FunnelView {
  const dates = periodDates(summary.until, days);
  const dateIndex = new Map(dates.map((date, index) => [date, index]));
  const totals: Record<string, number> = {};
  const domains = new Map<string, Map<string, number>>();
  const sources = new Map<string, Map<string, number>>();
  const daily: Record<string, number[]> = {};

  const add = (table: Map<string, Map<string, number>>, event: string, key: string, count: number) => {
    const inner = table.get(event) ?? new Map<string, number>();
    inner.set(key, (inner.get(key) ?? 0) + count);
    table.set(event, inner);
  };

  for (const row of summary.rows as FunnelRow[]) {
    const index = dateIndex.get(row.date);
    if (index === undefined) continue;
    totals[row.event] = (totals[row.event] ?? 0) + row.count;
    add(domains, row.event, row.domain, row.count);
    add(sources, row.event, row.source, row.count);
    daily[row.event] ??= new Array<number>(dates.length).fill(0);
    daily[row.event][index] += row.count;
  }

  const toRecord = (table: Map<string, Map<string, number>>) =>
    Object.fromEntries([...table.entries()].map(([event, counts]) => [event, sortedEntries(counts)]));

  return { days, dates, totals, byDomain: toRecord(domains), bySource: toRecord(sources), daily };
}

/** 앞 단계 대비 넘어간 비율(%). 앞 단계가 0이면 null. */
export function conversionRate(from: number, to: number): number | null {
  if (from <= 0) return null;
  return Math.round((to / from) * 1000) / 10;
}
