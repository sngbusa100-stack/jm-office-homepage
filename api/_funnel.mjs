export const FUNNEL_EVENTS = [
  'landing_view',
  'landing_cta_click',
  'diagnosis_start',
  'diagnosis_complete',
  'consult_view',
  'consult_submit',
  // 연락 버튼 누름(2026-11-14 D13) — src/lib/funnel.ts와 같은 목록
  'contact_phone_click',
  'contact_email_click',
];

export const FUNNEL_DOMAINS = [
  'home',
  'dui',
  'suspension',
  'permit',
  'visa',
  'veterans',
  'documents',
  'landdev',
  'procurement',
  'd2',
  'd10',
  'e7',
  'f27',
  'f5',
  'f6',
];

const PREFIX = 'funnel:daily:';
const RETENTION_SECONDS = 400 * 24 * 60 * 60;
export const FUNNEL_SOURCES = [
  'direct',
  'naver',
  'google',
  'kakao',
  // 지도 장소 화면의 홈페이지 링크(utm_medium=place). 화면 쪽 src/lib/funnel.ts funnelSourceOf가 정한다.
  'naver_place',
  'google_place',
  'kakao_place',
  'instagram',
  'facebook',
  'youtube',
  'blog',
  'jm_main',
  'jm_visa_precheck',
  'referral',
  'newsletter',
  'other',
];

function cleanSegment(value, max = 80) {
  return typeof value === 'string'
    ? value.trim().replace(/[|\r\n]/g, '').slice(0, max)
    : '';
}

export function normalizeFunnelSource(value) {
  const source = cleanSegment(value, 40).toLowerCase();
  if (!source) return 'direct';
  return FUNNEL_SOURCES.includes(source) ? source : 'other';
}

/**
 * 공개 측정 요청에서 허용된 비식별 필드만 추린다.
 * 경로·익명 식별자는 받지 않으며 집계 키에 이벤트·분야·정규화 source만 쓴다.
 */
export function sanitizeFunnelEvent(input) {
  if (typeof input !== 'object' || input === null) return null;
  const event = cleanSegment(input.event, 40);
  const domain = cleanSegment(input.domain, 40);
  const source = normalizeFunnelSource(input.attribution?.source);
  if (!FUNNEL_EVENTS.includes(event) || !FUNNEL_DOMAINS.includes(domain)) return null;
  return { event, domain, source };
}

function kstDate(now) {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function recentKstDates(days, now) {
  const result = [];
  for (let offset = 0; offset < days; offset += 1) {
    result.push(kstDate(new Date(now.getTime() - offset * 24 * 60 * 60 * 1000)));
  }
  return result;
}

async function redisBatch(cfg, suffix, commands, fetchImpl) {
  const response = await fetchImpl(`${cfg.url}/${suffix}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  });
  if (!response.ok) throw new Error(`redis_http_${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('redis_bad_response');
  for (const item of data) {
    if (item?.error) throw new Error(`redis_${item.error}`);
  }
  return data.map((item) => item?.result);
}

/**
 * 관리 화면용 요약: 날짜(KST)·이벤트·분야·출처별 건수를 그대로 내보낸다.
 * 기간 선택·합계·분야별 내역은 화면(src/lib/funnelStats.ts)이 이 행들로 계산한다.
 */
export function emptyFunnelSummary(days, now = new Date()) {
  return { days, until: kstDate(now), rows: [] };
}

export function createFunnelStore(cfg, fetchImpl = fetch) {
  return {
    async increment(event, now = new Date()) {
      const key = `${PREFIX}${kstDate(now)}`;
      const field = `${event.event}|${event.domain}|${event.source}`;
      await redisBatch(
        cfg,
        'multi-exec',
        [
          ['HINCRBY', key, field, '1'],
          ['EXPIRE', key, String(RETENTION_SECONDS), 'NX'],
        ],
        fetchImpl,
      );
    },

    async summary(requestedDays = 30, now = new Date()) {
      const days = Math.max(1, Math.min(Math.floor(requestedDays) || 30, 180));
      const dates = recentKstDates(days, now);
      const rows = await redisBatch(
        cfg,
        'pipeline',
        dates.map((date) => ['HGETALL', `${PREFIX}${date}`]),
        fetchImpl,
      );
      const summary = emptyFunnelSummary(days, now);
      rows.forEach((row, dayIndex) => {
        if (!Array.isArray(row)) return;
        for (let index = 0; index < row.length; index += 2) {
          const [event, domain, source] = String(row[index] ?? '').split('|');
          const count = Number(row[index + 1]);
          if (!FUNNEL_EVENTS.includes(event) || !FUNNEL_DOMAINS.includes(domain) || !Number.isFinite(count)) continue;
          summary.rows.push({ date: dates[dayIndex], event, domain, source: source || 'direct', count });
        }
      });
      return summary;
    },
  };
}
