import { useState } from 'react';
import { office, isAcceptingRequests } from '../data/office';
import { safeSessionGet } from '../lib/browserStorage';
import { submitConsult } from '../lib/consultSubmit';
import type { ConsultDiagnosis } from '../lib/consultSubmit';
import type { ResultLevel } from '../types/content';

const LEVEL_LABEL: Record<ResultLevel, string> = {
  urgent: '긴급 확인', documents: '서류 보완', official: '공식 확인', ready: '확인됨',
};

const LEVEL_KEYS: ResultLevel[] = ['urgent', 'documents', 'official', 'ready'];

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
  const [message, setMessage] = useState(buildPrefill);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [inquiryId, setInquiryId] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accepting || !office.formEndpoint || status === 'sending') return;
    const form = new FormData(event.currentTarget);
    setStatus('sending');
    const diagnosis = readDiagnosis();
    const utmSource = safeSessionGet('consult:utm') ?? undefined;
    const result = await submitConsult(office.formEndpoint, {
      name: String(form.get('name') ?? ''),
      phone: String(form.get('phone') ?? ''),
      email: String(form.get('email') ?? ''),
      topic: String(form.get('topic') ?? ''),
      message,
      consent: form.get('consent') === 'on',
      company: String(form.get('company') ?? ''),
      ...(diagnosis ? { diagnosis, sourcePath: `/check/${diagnosis.domain}/result` } : {}),
      ...(utmSource ? { utmSource } : {}),
    });
    setStatus(result.status);
    setInquiryId(result.status === 'sent' ? (result.id ?? null) : null);
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
        <input type="text" name="company" className="sr-only" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <label>성함<input type="text" name="name" required disabled={!accepting} /></label>
        <label>연락처<input type="tel" name="phone" required disabled={!accepting} /></label>
        <label>이메일 (선택 — 서면 답변을 원하시면 입력해 주세요)
          <input type="email" name="email" disabled={!accepting} />
        </label>
        <label>분야
          <select name="topic" disabled={!accepting}>
            <option>음주운전 면허 구제</option>
            <option>영업정지 · 행정심판</option>
            <option>인허가</option>
            <option>출입국 · 비자</option>
            <option>국가보훈</option>
            <option>토지보상 · 내용증명 · 계약서</option>
          </select>
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
        <button className="button button--accent" type="submit" disabled={!accepting || status === 'sending'}>
          {status === 'sending' ? '전송 중...' : '상담 신청하기'}
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
