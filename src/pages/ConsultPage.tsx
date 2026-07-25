import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { office, isAcceptingRequests } from '../data/office';
import { removeStorage, safeSessionGet, safeSessionSet } from '../lib/browserStorage';
import { submitConsult } from '../lib/consultSubmit';
import type { ConsultDiagnosis, VisaConsultDiagnosis } from '../lib/consultSubmit';
import type { ResultLevel } from '../types/content';
import { readAttribution, trackFunnelEvent } from '../lib/funnel';

const LEVEL_LABEL: Record<ResultLevel, string> = {
  urgent: '긴급 확인', documents: '서류 보완', official: '공식 확인', ready: '확인됨',
};

const LEVEL_KEYS: ResultLevel[] = ['urgent', 'documents', 'official', 'ready'];

/** 외부 사이트(비자 진단 등)에서 ?topic=슬러그로 분야를 미리 선택해 진입할 수 있다. */
const TOPIC_SLUGS: Record<string, string> = {
  dui: '음주운전 면허 구제',
  suspension: '영업정지 · 행정심판',
  permit: '인허가',
  visa: '출입국 · 비자',
  veterans: '국가보훈',
  land: '토지보상 · 내용증명 · 계약서',
};

const TOPIC_FUNNEL = {
  dui: 'dui',
  suspension: 'suspension',
  permit: 'permit',
  visa: 'visa',
  veterans: 'veterans',
  land: 'documents',
} as const;

const VISA_CODES = {
  d2: 'D-2',
  d10: 'D-10',
  e7: 'E-7',
  f27: 'F-2-7',
  f5: 'F-5',
  f6: 'F-6',
} as const;
type VisaSlug = keyof typeof VISA_CODES;

function isVisaSlug(value: string): value is VisaSlug {
  return Object.hasOwn(VISA_CODES, value);
}

function visaCode(value: string): string {
  return isVisaSlug(value) ? VISA_CODES[value] : value.toUpperCase();
}

type VisaHandoffStatus = 'idle' | 'loading' | 'loaded' | 'expired' | 'error';
interface VisaHandoffState {
  token: string;
  status: VisaHandoffStatus;
  value?: VisaConsultDiagnosis;
}
type VisaHandoffFetchResult =
  | { status: 'loaded'; value: VisaConsultDiagnosis }
  | { status: 'expired' | 'error' };

// React StrictMode가 effect를 개발 중 두 번 실행해도 GETDEL 토큰을 두 번
// 소비하지 않도록 같은 토큰의 진행·완료 요청을 하나로 공유한다.
const visaHandoffRequests = new Map<string, Promise<VisaHandoffFetchResult>>();

function fetchVisaHandoff(token: string): Promise<VisaHandoffFetchResult> {
  const existing = visaHandoffRequests.get(token);
  if (existing) return existing;
  const request = fetch('/api/visa-handoff', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'consume', token }),
  })
    .then(async (response): Promise<VisaHandoffFetchResult> => {
      if (!response.ok) {
        return { status: response.status === 404 ? 'expired' : 'error' };
      }
      const data = await response.json() as { visaDiagnosis?: VisaConsultDiagnosis };
      const value = data.visaDiagnosis;
      if (
        !value
        || value.schemaVersion !== 1
        || value.consent !== true
        || typeof value.visaSlug !== 'string'
        || typeof value.answers !== 'object'
      ) return { status: 'error' };
      return { status: 'loaded', value };
    })
    .catch((): VisaHandoffFetchResult => ({ status: 'error' }));
  visaHandoffRequests.set(token, request);
  void request.finally(() => {
    if (visaHandoffRequests.get(token) === request) {
      visaHandoffRequests.delete(token);
    }
  });
  return request;
}

function readStoredVisaDiagnosis(token: string): VisaConsultDiagnosis | undefined {
  const raw = safeSessionGet('consult:visaDiagnosis');
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as { token?: unknown; value?: VisaConsultDiagnosis };
    if (
      parsed.token === token
      && parsed.value?.schemaVersion === 1
      && parsed.value.consent === true
      && typeof parsed.value.visaSlug === 'string'
      && parsed.value.answers
      && typeof parsed.value.answers === 'object'
    ) return parsed.value;
  } catch {
    // 손상되거나 다른 토큰의 임시값은 무시한다.
  }
  return undefined;
}

function visaSummary(diagnosis: VisaConsultDiagnosis): string {
  const code = visaCode(diagnosis.visaSlug);
  const level = {
    checked: '현재 답변상 추가 표시 없음',
    'needs-documents': '서류 보완 항목 있음',
    'official-check': '공식 확인 항목 있음',
    urgent: '긴급 확인 항목 있음',
  }[diagnosis.level];
  return `[비자 사전진단 요약] ${code} · ${level}\n\n추가로 궁금한 내용: `;
}

/** 진단 결과 페이지에서 저장해 둔 진단 상세를 읽는다. 없거나 손상되면 무시한다. */
function readDiagnosis(): ConsultDiagnosis | undefined {
  const raw = safeSessionGet('consult:diagnosis');
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as ConsultDiagnosis;
    if (typeof parsed.domain === 'string' && parsed.answers && typeof parsed.answers === 'object') {
      return parsed;
    }
  } catch {
    // 손상된 저장값은 진단 없이 접수한다.
  }
  return undefined;
}

function buildPrefill(): string {
  const raw = safeSessionGet('consult:summary');
  if (!raw) return '';
  try {
    const summary = JSON.parse(raw) as { title: string; counts: Record<ResultLevel, number> };
    const parts = LEVEL_KEYS
      .filter((level) => summary.counts[level] > 0)
      .map((level) => `${LEVEL_LABEL[level]} ${summary.counts[level]}`);
    return `[셀프 진단 요약] ${summary.title} — ${parts.join(', ')}\n\n추가로 궁금한 내용: `;
  } catch {
    return '';
  }
}

export function ConsultPage() {
  const accepting = isAcceptingRequests(office);
  const [searchParams] = useSearchParams();
  const topicSlug = searchParams.get('topic') ?? '';
  const presetTopic = TOPIC_SLUGS[topicSlug];
  const handoffToken = searchParams.get('handoff') ?? '';
  const visaSlug = searchParams.get('visa') ?? '';
  const validHandoffToken = /^[A-Za-z0-9_-]{20,80}$/.test(handoffToken);
  const visaFunnelDomain = isVisaSlug(visaSlug)
    ? visaSlug
    : undefined;
  const funnelDomain = visaFunnelDomain
    ?? TOPIC_FUNNEL[topicSlug as keyof typeof TOPIC_FUNNEL]
    ?? 'home';
  const [message, setMessage] = useState(() => (
    buildPrefill()
    || (visaSlug ? `[비자 선택] ${visaCode(visaSlug)}\n\n추가로 궁금한 내용: ` : '')
  ));
  const [handoffState, setHandoffState] = useState<VisaHandoffState>({
    token: handoffToken,
    status: validHandoffToken ? 'loading' : 'idle',
  });
  const autoVisaPrefill = useRef('');
  const handoffStatus = handoffState.token === handoffToken
    ? handoffState.status
    : validHandoffToken ? 'loading' : 'idle';
  const visaDiagnosis = handoffState.token === handoffToken
    && handoffState.status === 'loaded'
    ? handoffState.value
    : undefined;
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [inquiryId, setInquiryId] = useState<string | null>(null);
  // 새로고침 뒤에도 실패한 제출은 같은 키를 써서 중복 등록을 막는다.
  const [submissionId] = useState<string>(readOrCreateSubmissionId);

  useEffect(() => {
    void trackFunnelEvent({
      event: 'consult_view',
      domain: funnelDomain,
      path: '/consult',
    });
  }, [funnelDomain]);

  useEffect(() => {
    if (autoVisaPrefill.current) {
      const previousPrefill = autoVisaPrefill.current;
      autoVisaPrefill.current = '';
      setMessage((current) => (
        current === previousPrefill
          ? (visaSlug ? `[비자 선택] ${visaCode(visaSlug)}\n\n추가로 궁금한 내용: ` : buildPrefill())
          : current
      ));
    }
    if (!validHandoffToken) {
      removeStorage('sessionStorage', 'consult:visaDiagnosis');
      setHandoffState({ token: handoffToken, status: 'idle' });
      return;
    }
    const cached = readStoredVisaDiagnosis(handoffToken);
    if (cached) {
      const prefill = visaSummary(cached);
      autoVisaPrefill.current = prefill;
      setMessage((current) => current.startsWith('[비자 선택]') || !current ? prefill : current);
      setHandoffState({ token: handoffToken, status: 'loaded', value: cached });
      return;
    }
    removeStorage('sessionStorage', 'consult:visaDiagnosis');

    let active = true;
    setHandoffState({ token: handoffToken, status: 'loading' });
    void fetchVisaHandoff(handoffToken)
      .then((result) => {
        if (result.status !== 'loaded') {
          if (active) setHandoffState({ token: handoffToken, status: result.status });
          return;
        }
        const value = result.value;
        safeSessionSet('consult:visaDiagnosis', JSON.stringify({ token: handoffToken, value }));
        if (active) {
          const prefill = visaSummary(value);
          autoVisaPrefill.current = prefill;
          setMessage((current) => current.startsWith('[비자 선택]') || !current ? prefill : current);
          setHandoffState({ token: handoffToken, status: 'loaded', value });
        }
      });
    return () => { active = false; };
  }, [handoffToken, validHandoffToken, visaSlug]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !accepting
      || !office.formEndpoint
      || status === 'sending'
      || (validHandoffToken && (handoffStatus === 'idle' || handoffStatus === 'loading'))
    ) return;
    const form = new FormData(event.currentTarget);
    setStatus('sending');
    const diagnosis = readDiagnosis();
    const utmSource = safeSessionGet('consult:utm') ?? undefined;
    const attribution = readAttribution();
    const result = await submitConsult(office.formEndpoint, {
      name: String(form.get('name') ?? ''),
      phone: String(form.get('phone') ?? ''),
      email: String(form.get('email') ?? ''),
      topic: String(form.get('topic') ?? ''),
      message,
      consent: form.get('consent') === 'on',
      company: String(form.get('company') ?? ''),
      ...(diagnosis ? { diagnosis, sourcePath: `/check/${diagnosis.domain}/result` } : {}),
      ...(visaDiagnosis ? {
        visaDiagnosis,
        sourcePath: `/result?visa=${encodeURIComponent(visaDiagnosis.visaSlug)}`,
      } : {}),
      ...(utmSource ? { utmSource } : {}),
      ...(Object.keys(attribution).length > 0 ? { attribution } : {}),
      submissionId,
    });
    setStatus(result.status);
    setInquiryId(result.status === 'sent' ? (result.id ?? null) : null);
    if (result.status === 'sent') {
      void trackFunnelEvent({
        event: 'consult_submit',
        domain: funnelDomain,
        path: '/consult',
      });
      // 접수 완료된 개인 데이터와 제출 키를 브라우저 세션에서 즉시 정리한다.
      removeStorage('sessionStorage', 'consult:diagnosis');
      removeStorage('sessionStorage', 'consult:summary');
      removeStorage('sessionStorage', 'consult:utm');
      removeStorage('sessionStorage', 'consult:attribution');
      removeStorage('sessionStorage', 'consult:submission');
      removeStorage('sessionStorage', 'consult:visaDiagnosis');
    }
  }

  return (
    <div className="page-shell section narrow-page">
      <header className="page-header">
        <h1>상담 안내</h1>
      </header>

      {!accepting && (
        <section className="card">
          <h2>상담·수임 접수는 개업 후 시작됩니다</h2>
          <p>
            현재 개업 준비 중으로 접수 중인 상담·대행 서비스가 없습니다.
            개업과 필수 고지(등록번호·연락처 게시) 준비가 끝나면 이 페이지에서 바로 신청하실 수 있습니다.
          </p>
        </section>
      )}

      <section aria-labelledby="channels">
        <h2 id="channels">상담 채널</h2>
        <div className="grid-3">
          <article className="card">
            <h3>전화 상담</h3>
            {accepting && office.phone
              ? <a className="button button--primary" href={`tel:${office.phone}`}>{office.phone}</a>
              : <p className="note">개업 후 공개됩니다.</p>}
          </article>
          <article className="card">
            <h3>카카오톡 채널</h3>
            {accepting && office.kakaoChannelUrl
              ? <a className="button button--primary" href={office.kakaoChannelUrl}>카카오톡으로 문의</a>
              : <p className="note">개업 후 공개됩니다.</p>}
          </article>
          <article className="card">
            <h3>온라인 신청</h3>
            <p className="note">아래 폼으로 신청하시면 연락드립니다. {!accepting && '(개업 후 활성화)'}</p>
          </article>
        </div>
      </section>

      <form className="card consult-form" onSubmit={handleSubmit}>
        <h2>상담 신청</h2>
        {handoffStatus === 'loading' && <p className="note" role="status">비자 진단 결과를 안전하게 불러오는 중입니다.</p>}
        {handoffStatus === 'loaded' && (
          <p className="note" role="status">동의하신 비자 진단 결과가 상담 화면에 안전하게 연결되었습니다.</p>
        )}
        {handoffStatus === 'expired' && (
          <p className="note" role="alert">진단 결과 연결이 만료되었거나 이미 사용되었습니다. 아래에 내용을 직접 적어 일반 상담을 신청할 수 있습니다.</p>
        )}
        {handoffStatus === 'error' && (
          <p className="note" role="alert">진단 결과를 불러오지 못했습니다. 아래에 내용을 직접 적어 일반 상담을 신청할 수 있습니다.</p>
        )}
        <input type="text" name="company" className="sr-only" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <label>성함<input type="text" name="name" required disabled={!accepting} /></label>
        <label>연락처<input type="tel" name="phone" required disabled={!accepting} /></label>
        <label>이메일 (선택 — 서면 답변을 원하시면 입력해 주세요)
          <input type="email" name="email" disabled={!accepting} />
        </label>
        <label>분야
          <select
            key={presetTopic ?? 'default'}
            name="topic"
            defaultValue={presetTopic}
            disabled={!accepting || Boolean(visaDiagnosis)}
          >
            <option>음주운전 면허 구제</option>
            <option>영업정지 · 행정심판</option>
            <option>인허가</option>
            <option>출입국 · 비자</option>
            <option>국가보훈</option>
            <option>토지보상 · 내용증명 · 계약서</option>
          </select>
          {visaDiagnosis && <input type="hidden" name="topic" value="출입국 · 비자" />}
        </label>
        <label>상담 내용
          <textarea
            name="message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!accepting}
          />
        </label>
        <label className="agree">
          <input type="checkbox" name="consent" required disabled={!accepting} />
          개인정보 수집·이용에 동의합니다 (상담 회신 목적, 처리 완료 후 120일 보관 뒤 파기)
        </label>
        <button
          className="button button--accent"
          type="submit"
          disabled={
            !accepting
            || status === 'sending'
            || status === 'sent'
            || (validHandoffToken && (handoffStatus === 'idle' || handoffStatus === 'loading'))
          }
        >
          {handoffStatus === 'loading' ? '진단 결과 불러오는 중...' : status === 'sending' ? '전송 중...' : '상담 신청하기'}
        </button>
        {status === 'sent' && (
          <p className="note" role="status">
            상담 신청이 접수되었습니다.{inquiryId ? ` 접수번호는 ${inquiryId}입니다.` : ''} 확인 후
            남겨주신 연락처로 연락드리겠습니다.
          </p>
        )}
        {status === 'error' && (
          <p className="note" role="alert">전송에 실패했습니다. 잠시 후 다시 시도하시거나 전화·카카오톡으로 문의해 주세요.</p>
        )}
        {!accepting && <p className="note">개업 전에는 신청이 접수되지 않습니다. 상담·수임 접수는 개업 후 시작됩니다.</p>}
      </form>

      <section className="card level-urgent">
        <h2>기한이 임박했다면 기다리지 마세요</h2>
        <p>
          행정심판 기한 등 긴급한 사안은 국민권익위원회 상담전화(국번 없이 110) 또는
          해당 처분을 한 기관에 바로 확인하실 수 있습니다.
        </p>
      </section>
    </div>
  );
}

function createSubmissionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
}

function readOrCreateSubmissionId(): string {
  const existing = safeSessionGet('consult:submission');
  if (existing && /^[A-Za-z0-9-]{8,64}$/.test(existing)) return existing;
  const created = createSubmissionId();
  safeSessionSet('consult:submission', created);
  return created;
}
