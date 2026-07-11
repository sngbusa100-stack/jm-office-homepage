export interface ConsultPayload {
  name: string;
  phone: string;
  topic: string;
  message: string;
  consent: boolean;
  /** 허니팟 — 사람은 비워 두고, 스팸 봇이 채우면 서버가 폐기한다. */
  company: string;
}

export type SubmitResult = 'sent' | 'error';

export async function submitConsult(endpoint: string, payload: ConsultPayload): Promise<SubmitResult> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response.ok ? 'sent' : 'error';
  } catch {
    return 'error';
  }
}
