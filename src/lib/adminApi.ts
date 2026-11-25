// 접수 관리 API 클라이언트 + 통계 집계 (관리자 페이지 전용)

import { office } from '../data/office';
import { SITE_URL } from './pageMeta';
import type { DeadlineReport, UrgentReason } from '../data/deadlineReport';

export interface InquiryMemo {
  at: string;
  text: string;
}

export interface InquiryDiagnosis {
  domain: string;
  /** questionId → optionId */
  answers: Record<string, string>;
  counts: Record<string, number>;
}

export interface InquiryVisaDiagnosis {
  schemaVersion: 1;
  visaSlug: string;
  language: string;
  answers: Record<string, string>;
  level: 'checked' | 'needs-documents' | 'official-check' | 'urgent';
  questionCount: number;
  consent: true;
  consentedAt?: string;
}

export interface InquiryRecord {
  id: string;
  schemaVersion?: number;
  receivedAt: string;
  followUpDate?: string;
  topic: string;
  status: 'new' | 'in_progress' | 'done' | 'on_hold';
  pipelineStage?: 'inquiry' | 'qualified' | 'retained' | 'work_completed';
  pipelineStageAt?: string;
  origin?: string;
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
  pulledAt?: string;
  localCaseId?: string;
  /** 로컬 행정심판 시스템에서 돌려준 처리 상태(docs/2026-10-19-pipeline-link-plan.md). */
  localStatus?: 'closed' | 'case_created' | 'engaged' | 'replied';
  localStatusAt?: string;
  localCloseReason?: 'manual' | 'not_engaged' | 'auto_stale' | 'no_reply';
  diagnosis?: InquiryDiagnosis;
  visaDiagnosis?: InquiryVisaDiagnosis;
  /** 출입국·비자 접수 질문(고객 자가 응답, 증빙 미확인). 설계: docs/2026-10-18-visa-intake-questions.md */
  visaIntake?: Record<string, string | boolean> & { deadlineFirst?: boolean };
  /** 처분서·통지서 기한 자가 응답(출입국·비자 외 분야, 선택, 증빙 미확인). */
  deadlineReport?: DeadlineReport;
  /** 서버가 목록 응답에서만 계산하는 긴급 근거(api/_urgency.mjs). 저장되지 않는다. */
  urgentReasons?: UrgentReason[];
  sourcePath?: string;
  utmSource?: string;
  attribution?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
  };
  consent?: { version: string; at: string };
  memos?: InquiryMemo[];
  updatedAt?: string;
  purged?: boolean;
  purgedAt?: string;
  memoCount?: number;
}

export type AdminResult<T> = { ok: true; value: T } | { ok: false; error: string };

/** 접수 엔드포인트(/api/consult)와 같은 서버의 관리 엔드포인트(/api/admin)를 쓴다. */
export function adminEndpoint(): string | null {
  if (!office.formEndpoint) return null;
  // 같은 사이트의 API를 사용해 별칭 도메인과 로컬 개발 서버에서도 현재 출처를 유지한다.
  if (office.formEndpoint === `${SITE_URL}/api/consult`) return '/api/admin';
  return office.formEndpoint.replace(/\/consult$/, '/admin');
}

export async function loginAdmin(password: string): Promise<AdminResult<string>> {
  const endpoint = adminEndpoint();
  if (!endpoint) return { ok: false, error: 'no_endpoint' };
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
      redirect: 'error',
      cache: 'no-store',
    });
    if (response.status === 401) return { ok: false, error: 'unauthorized' };
    if (response.status === 429) return { ok: false, error: 'rate_limited' };
    if (response.status === 503) return { ok: false, error: 'unavailable' };
    if (!response.ok) return { ok: false, error: 'server' };
    const data = await response.json();
    if (data?.ok !== true || typeof data.sessionToken !== 'string' || !data.sessionToken) {
      return { ok: false, error: 'server' };
    }
    return { ok: true, value: data.sessionToken };
  } catch {
    return { ok: false, error: 'network' };
  }
}

async function callAdmin<T>(
  method: 'GET' | 'PATCH' | 'DELETE',
  token: string,
  body?: object,
): Promise<AdminResult<T>> {
  const endpoint = adminEndpoint();
  if (!endpoint) return { ok: false, error: 'no_endpoint' };
  try {
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (response.status === 401) return { ok: false, error: 'unauthorized' };
    if (response.status === 409) return { ok: false, error: 'conflict' };
    if (!response.ok) return { ok: false, error: 'server' };
    const data = await response.json();
    return { ok: true, value: data as T };
  } catch {
    return { ok: false, error: 'network' };
  }
}

export async function fetchInquiries(token: string): Promise<AdminResult<InquiryRecord[]>> {
  const result = await callAdmin<{ items: InquiryRecord[] }>('GET', token);
  if (!result.ok) return result;
  return { ok: true, value: result.value.items ?? [] };
}

/** 하루(KST)·이벤트·분야·유입 출처 한 칸의 건수 — api/_funnel.mjs summary()의 행. */
export interface FunnelRow {
  date: string;
  event: string;
  domain: string;
  source: string;
  count: number;
}

export interface FunnelSummary {
  /** 서버가 보낸 기간(일). */
  days: number;
  /** 마지막 날(KST, YYYY-MM-DD). */
  until: string;
  rows: FunnelRow[];
}

export interface AdminDashboard {
  items: InquiryRecord[];
  funnel: FunnelSummary;
}

function emptyFunnel(): FunnelSummary {
  const until = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return { days: 90, until, rows: [] };
}

export async function fetchAdminDashboard(token: string): Promise<AdminResult<AdminDashboard>> {
  const result = await callAdmin<{ items: InquiryRecord[]; funnel?: FunnelSummary }>('GET', token);
  if (!result.ok) return result;
  return {
    ok: true,
    value: {
      items: result.value.items ?? [],
      // 옛 서버 응답(rows 없음)이 와도 화면이 깨지지 않게 빈 퍼널로 본다.
      funnel: Array.isArray(result.value.funnel?.rows) ? result.value.funnel : emptyFunnel(),
    },
  };
}

export async function patchInquiry(
  token: string,
  id: string,
  patch: {
    status?: InquiryRecord['status'];
    memo?: string;
    followUpDate?: string | null;
    pipelineStage?: InquiryRecord['pipelineStage'];
  },
): Promise<AdminResult<InquiryRecord>> {
  const result = await callAdmin<{ item: InquiryRecord }>('PATCH', token, { id, ...patch });
  if (!result.ok) return result;
  return { ok: true, value: result.value.item };
}

export async function purgeInquiry(token: string, id: string): Promise<AdminResult<InquiryRecord>> {
  const result = await callAdmin<{ item: InquiryRecord }>('DELETE', token, { id });
  if (!result.ok) return result;
  return { ok: true, value: result.value.item };
}

export interface InquiryStats {
  total: number;
  byStatus: Record<string, number>;
  byTopic: Record<string, number>;
  byMonth: Record<string, number>;
  byPipelineStage: Record<string, number>;
}

/** 상태·분야·월별 접수 건수를 집계한다 (파기된 건도 통계에는 포함). */
export function summarizeInquiries(items: InquiryRecord[]): InquiryStats {
  const stats: InquiryStats = {
    total: items.length,
    byStatus: {},
    byTopic: {},
    byMonth: {},
    byPipelineStage: {},
  };
  for (const item of items) {
    stats.byStatus[item.status] = (stats.byStatus[item.status] ?? 0) + 1;
    stats.byTopic[item.topic] = (stats.byTopic[item.topic] ?? 0) + 1;
    const pipelineStage = item.pipelineStage ?? 'inquiry';
    stats.byPipelineStage[pipelineStage] = (stats.byPipelineStage[pipelineStage] ?? 0) + 1;
    const month = item.receivedAt?.slice(0, 7) ?? '알 수 없음';
    stats.byMonth[month] = (stats.byMonth[month] ?? 0) + 1;
  }
  return stats;
}
