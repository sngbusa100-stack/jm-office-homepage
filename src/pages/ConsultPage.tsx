import { useState } from 'react';
import { office, isAcceptingRequests } from '../data/office';
import { safeSessionGet } from '../lib/browserStorage';
import type { ResultLevel } from '../types/content';

const LEVEL_LABEL: Record<ResultLevel, string> = {
  urgent: '긴급 확인', documents: '서류 보완', official: '공식 확인', ready: '확인됨',
};

const LEVEL_KEYS: ResultLevel[] = ['urgent', 'documents', 'official', 'ready'];

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

      <form
        className="card consult-form"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <h2>상담 신청</h2>
        <label>성함<input type="text" name="name" required disabled={!accepting} /></label>
        <label>연락처<input type="tel" name="phone" required disabled={!accepting} /></label>
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
          <input type="checkbox" required disabled={!accepting} />
          개인정보 수집·이용에 동의합니다 (상담 회신 목적, 회신 후 파기)
        </label>
        <button className="button button--accent" type="submit" disabled={!accepting}>
          상담 신청하기
        </button>
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
