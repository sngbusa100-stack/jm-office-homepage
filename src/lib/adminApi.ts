// 접수 관리 API 클라이언트 + 통계 집계 (관리자 페이지 전용)

import { office } from '../data/office';

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

export interface InquiryRecord {
  id: string;
  schemaVersion?: number;
  receivedAt: string;
  topic: string;
  status: 'new' | 'in_progress' | 'done' | 'on_hold';
  origin?: string;
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
  pulledAt?: string;
  localCaseId?: string;
  diagnosis?: InquiryDiagnosis;
  sourcePath?: string;
  utmSource?: string;
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
  return office.formEndpoint.replace(/\/consult$/, '/admin');
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

export async function patchInquiry(
  token: string,
  id: string,
  patch: { status?: InquiryRecord['status']; memo?: string },
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
}

/** 상태·분야·월별 접수 건수를 집계한다 (파기된 건도 통계에는 포함). */
export function summarizeInquiries(items: InquiryRecord[]): InquiryStats {
  const stats: InquiryStats = { total: items.length, byStatus: {}, byTopic: {}, byMonth: {} };
  for (const item of items) {
    stats.byStatus[item.status] = (stats.byStatus[item.status] ?? 0) + 1;
    stats.byTopic[item.topic] = (stats.byTopic[item.topic] ?? 0) + 1;
    const month = item.receivedAt?.slice(0, 7) ?? '알 수 없음';
    stats.byMonth[month] = (stats.byMonth[month] ?? 0) + 1;
  }
  return stats;
}
