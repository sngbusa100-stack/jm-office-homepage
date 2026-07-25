import { safeSessionGet, safeSessionSet } from './browserStorage';

export const FUNNEL_EVENTS = [
  'landing_view',
  'landing_cta_click',
  'diagnosis_start',
  'diagnosis_complete',
  'consult_view',
  'consult_submit',
] as const;

export const FUNNEL_DOMAINS = [
  'home',
  'dui',
  'suspension',
  'permit',
  'visa',
  'veterans',
  'documents',
  'd2',
  'd10',
  'e7',
  'f27',
  'f5',
  'f6',
] as const;

export type FunnelEventName = typeof FUNNEL_EVENTS[number];
export type FunnelDomain = typeof FUNNEL_DOMAINS[number];

export interface Attribution {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
}

const LINK_SOURCES = new Set([
  'naver',
  'google',
  'kakao',
  'instagram',
  'facebook',
  'youtube',
  'blog',
  'referral',
  'newsletter',
  'jm_main',
  'jm_visa_precheck',
]);
const FUNNEL_SOURCE_BUCKETS = new Set([
  'direct',
  ...LINK_SOURCES,
  'other',
]);

function safeLinkValue(value: string | undefined): string | undefined {
  return value && /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(value) ? value : undefined;
}

export function normalizeFunnelSource(value: string | undefined): string {
  const source = value?.trim().toLowerCase();
  if (!source) return 'direct';
  return FUNNEL_SOURCE_BUCKETS.has(source) ? source : 'other';
}

/** 사이트 사이를 이동할 때 허용된 UTM과 내부 접점만 이어 붙인다. */
export function attributedExternalUrl(
  rawUrl: string,
  touchpoint: string,
  suppliedAttribution?: Attribution,
): string {
  const url = new URL(rawUrl);
  const attribution = suppliedAttribution ?? readAttribution();
  const source = safeLinkValue(attribution.source)?.toLowerCase();
  if (source && LINK_SOURCES.has(source)) url.searchParams.set('utm_source', source);
  for (const key of ['medium', 'campaign'] as const) {
    const value = safeLinkValue(attribution[key]);
    if (value) url.searchParams.set(`utm_${key}`, value);
  }
  const priorContent = safeLinkValue(attribution.content);
  const nextContent = safeLinkValue(touchpoint);
  if (nextContent) {
    url.searchParams.set(
      'utm_content',
      priorContent ? `${priorContent}--${nextContent}`.slice(0, 80) : nextContent,
    );
  }
  return url.toString();
}

export interface FunnelEventInput {
  event: FunnelEventName;
  domain: FunnelDomain;
  path: string;
}

const ATTRIBUTION_KEY = 'consult:attribution';

function cleanValue(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const cleaned = value.trim().slice(0, 80);
  return cleaned || undefined;
}

/** 허용된 유입 식별자만 남긴다. 이름·전화·상담내용 같은 임의 필드는 받을 수 없다. */
export function sanitizeAttribution(value: unknown): Attribution {
  const input = typeof value === 'object' && value !== null
    ? value as Record<string, unknown>
    : {};
  const result: Attribution = {};
  for (const key of ['source', 'medium', 'campaign', 'content'] as const) {
    const cleaned = cleanValue(input[key]);
    if (cleaned) result[key] = cleaned;
  }
  return result;
}

export function readAttribution(): Attribution {
  const raw = safeSessionGet(ATTRIBUTION_KEY);
  if (!raw) return {};
  try {
    return sanitizeAttribution(JSON.parse(raw));
  } catch {
    return {};
  }
}

/** 현재 URL의 UTM 값만 기존 세션 값 위에 합친다. */
export function captureAttribution(search = window.location.search): Attribution {
  const params = new URLSearchParams(search);
  const incoming = sanitizeAttribution({
    source: params.get('utm_source'),
    medium: params.get('utm_medium'),
    campaign: params.get('utm_campaign'),
    content: params.get('utm_content'),
  });
  const merged = { ...readAttribution(), ...incoming };
  if (Object.keys(merged).length > 0) {
    safeSessionSet(ATTRIBUTION_KEY, JSON.stringify(merged));
    if (merged.source) safeSessionSet('consult:utm', merged.source);
  }
  return merged;
}

/**
 * 전환 이벤트는 업무분야·단계·유입 출처만 전송한다.
 * 개별 이동 경로와 익명 식별자도 중앙 서버에는 전송하지 않는다.
 * 측정 실패가 고객 동선을 막지 않도록 항상 조용히 종료한다.
 */
export async function trackFunnelEvent(
  input: FunnelEventInput,
  endpoint = '/api/funnel',
): Promise<void> {
  if (!FUNNEL_EVENTS.includes(input.event) || !FUNNEL_DOMAINS.includes(input.domain)) return;
  const path = typeof input.path === 'string' ? input.path.slice(0, 160) : '';
  if (!path.startsWith('/')) return;
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        event: input.event,
        domain: input.domain,
        attribution: { source: normalizeFunnelSource(readAttribution().source) },
      }),
    });
  } catch {
    // 통계 전송 장애는 공개 기능과 상담 신청에 영향을 주지 않는다.
  }
}
