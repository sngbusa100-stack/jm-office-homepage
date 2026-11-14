import type { DeadlineReport } from '../data/deadlineReport';

/** 진단 결과에서 상담으로 이동할 때 함께 전달되는 셀프 진단 상세. */
export interface ConsultDiagnosis {
  domain: string;
  /** questionId → optionId */
  answers: Record<string, string>;
  counts: Record<string, number>;
}

/** 비자 사이트에서 명시적 동의 후 일회성 토큰으로 가져온 진단 답변. */
export interface VisaConsultDiagnosis {
  schemaVersion: 1;
  visaSlug: string;
  language: string;
  answers: Record<string, string>;
  level: 'checked' | 'needs-documents' | 'official-check' | 'urgent';
  questionCount: number;
  consent: true;
  consentedAt?: string;
}

export interface ConsultPayload {
  name: string;
  phone: string;
  /** 선택 — 서면 답변 희망 시 */
  email?: string;
  topic: string;
  message: string;
  consent: boolean;
  /** 허니팟 — 사람은 비워 두고, 스팸 봇이 채우면 서버가 폐기한다. */
  company: string;
  diagnosis?: ConsultDiagnosis;
  visaDiagnosis?: VisaConsultDiagnosis;
  /** 처분서·통지서 기한 자가 응답(출입국·비자 외 분야, 답한 경우만). */
  deadlineReport?: DeadlineReport;
  sourcePath?: string;
  utmSource?: string;
  attribution?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
  };
  /** 응답 유실 후 같은 제출을 하나의 접수로 식별하는 브라우저 생성 키. */
  submissionId?: string;
}

/**
 * 전송 실패 종류(10-17 검토 CV-12, 2026-11-14). 503이라도 원인이 여럿이라 서버 error 코드로 나눈다.
 * closed: 접수 닫힘(503 not_accepting) / retry: 잠시 뒤 다시(429·409) / invalid: 입력값 거절(400) / outage: 일시 장애(그 밖의 5xx·네트워크)
 */
export type SubmitErrorKind = 'closed' | 'retry' | 'invalid' | 'outage';
export type SubmitResult = { status: 'sent'; id?: string } | { status: 'error'; kind: SubmitErrorKind };

async function errorKind(response: Response): Promise<SubmitErrorKind> {
  if (response.status === 400) return 'invalid';
  if (response.status === 429 || response.status === 409) return 'retry';
  if (response.status === 503) {
    try {
      const data: unknown = typeof response.json === 'function' ? await response.json() : null;
      if (data && typeof data === 'object' && (data as { error?: unknown }).error === 'not_accepting') return 'closed';
    } catch {
      // 본문을 읽지 못하면 일시 장애로 본다.
    }
  }
  return 'outage';
}

export async function submitConsult(endpoint: string, payload: ConsultPayload): Promise<SubmitResult> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return { status: 'error', kind: await errorKind(response) };
    let id: string | undefined;
    try {
      const data: unknown = typeof response.json === 'function' ? await response.json() : null;
      if (data && typeof data === 'object' && typeof (data as { id?: unknown }).id === 'string') {
        id = (data as { id: string }).id;
      }
    } catch {
      // 본문 없는 성공 응답도 접수 성공으로 취급한다.
    }
    return { status: 'sent', id };
  } catch {
    return { status: 'error', kind: 'outage' };
  }
}
