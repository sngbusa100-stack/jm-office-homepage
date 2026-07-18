/** 진단 결과에서 상담으로 이동할 때 함께 전달되는 셀프 진단 상세. */
export interface ConsultDiagnosis {
  domain: string;
  /** questionId → optionId */
  answers: Record<string, string>;
  counts: Record<string, number>;
}

export interface ConsultPayload {
  name: string;
  phone: string;
  topic: string;
  message: string;
  consent: boolean;
  /** 허니팟 — 사람은 비워 두고, 스팸 봇이 채우면 서버가 폐기한다. */
  company: string;
  diagnosis?: ConsultDiagnosis;
  sourcePath?: string;
  utmSource?: string;
}

export type SubmitResult = { status: 'sent'; id?: string } | { status: 'error' };

export async function submitConsult(endpoint: string, payload: ConsultPayload): Promise<SubmitResult> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return { status: 'error' };
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
    return { status: 'error' };
  }
}
