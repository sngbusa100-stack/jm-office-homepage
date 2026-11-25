import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { readStorage, removeStorage, safeSessionGet, safeSessionSet, writeStorage } from '../lib/browserStorage';
import {
  fetchAdminDashboard,
  loginAdmin,
  patchInquiry,
  purgeInquiry,
  summarizeInquiries,
} from '../lib/adminApi';
import type { FunnelSummary, InquiryDiagnosis, InquiryRecord } from '../lib/adminApi';
import { TOPIC_ROUTES, buildDirectReplyDraft, buildReplyDraft } from '../../api/_reply-draft.mjs';
import { buildConsultBrief, consultBriefText } from '../../api/_consult-brief.mjs';
import type { ConsultBriefSection } from '../../api/_consult-brief.mjs';
import { AdminFunnel } from '../components/AdminFunnel';
import { FollowUpEditor } from '../components/FollowUpEditor';
import { findCheck } from '../data/checks';
import { describeVisaDiagnosisAnswer } from '../data/visaDiagnosisLabels';
import { describeVisaIntake } from '../data/visaIntake';
import { DEADLINE_REPORT_OPTIONS, URGENT_REASON_LABELS } from '../data/deadlineReport';

const TOKEN_KEY = 'admin:token';
/** 접수 주소 끝의 #접수번호(텔레그램 알림 링크). 형식이 맞을 때만 쓴다. */
const INQUIRY_HASH = /^#(JM-\d{8}-[A-Z0-9]{4})$/;
const DIRECT_TOPICS = Object.keys(TOPIC_ROUTES);

function readSavedToken(): string | null {
  // 탭을 닫으면 지워지는 세션 저장이 기본이고, '이 기기에서 로그인 유지'를 고른 기기에만 오래 남긴다.
  return safeSessionGet(TOKEN_KEY) ?? readStorage('localStorage', TOKEN_KEY);
}

function forgetToken() {
  removeStorage('sessionStorage', TOKEN_KEY);
  removeStorage('localStorage', TOKEN_KEY);
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 클립보드 권한이 없으면 화면의 글을 직접 복사하면 된다.
    return false;
  }
}

/** 상담 준비 메모(행정사용, 고객에게 보내지 않음). api/_consult-brief.mjs가 만든 구역을 그대로 보여 준다. */
function ConsultBriefView({ sections, copyKey, copiedKey, onCopy }: {
  sections: ConsultBriefSection[];
  copyKey: string;
  copiedKey: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  return (
    <div className="admin-brief">
      {sections.map((section) => (
        <section key={section.title}>
          <h4>{section.title}</h4>
          <ul className="admin-stat-list">
            {section.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ))}
      <button className="button" type="button" onClick={() => onCopy(copyKey, consultBriefText(sections))}>
        {copiedKey === copyKey ? '메모 복사됨' : '메모 복사'}
      </button>
    </div>
  );
}

const STATUS_KEYS = ['new', 'in_progress', 'done', 'on_hold'] as const;

const STATUS_LABEL: Record<InquiryRecord['status'], string> = {
  new: '신규',
  in_progress: '진행 중',
  done: '완료',
  on_hold: '보류',
};

const PIPELINE_LABEL: Record<NonNullable<InquiryRecord['pipelineStage']>, string> = {
  inquiry: '상담 접수',
  qualified: '수임 적합',
  retained: '수임 확정',
  work_completed: '업무 완료',
};

/** 진단 답변(questionId→optionId)을 진단 정의와 대조해 사람이 읽을 문항·답변으로 변환한다. */
function describeDiagnosis(diagnosis: InquiryDiagnosis): { key: string; question: string; answer: string }[] {
  const definition = findCheck(diagnosis.domain);
  return Object.entries(diagnosis.answers ?? {}).map(([questionId, optionId]) => {
    const question = definition?.questions.find((q) => q.id === questionId);
    const option = question?.options.find((o) => o.id === optionId);
    return {
      key: questionId,
      question: question?.text ?? questionId,
      answer: option?.label ?? optionId,
    };
  });
}

/** 로컬 처리 상태 표시(연동기가 PATCH action=status로 돌려준 값). */
const LOCAL_STATUS_LABEL: Record<NonNullable<InquiryRecord['localStatus']>, string> = {
  closed: '종결',
  case_created: '사건 전환',
  engaged: '수임',
  replied: '회신함',
};
const LOCAL_CLOSE_REASON_LABEL: Record<NonNullable<InquiryRecord['localCloseReason']>, string> = {
  manual: '행정사 종결',
  not_engaged: '수임 안 됨',
  auto_stale: '90일 무처리 자동 종결',
  no_reply: '회신 후 무응답 자동 종결',
};

/** 긴급 근거는 서버(api/_urgency.mjs)가 목록·PATCH 응답에 붙인 값만 쓴다. 화면에서 다시 판정하지 않는다. */
function isUrgentItem(item: InquiryRecord): boolean {
  return (item.urgentReasons?.length ?? 0) > 0;
}

function urgentTitle(item: InquiryRecord): string {
  return `근거: ${(item.urgentReasons ?? []).map((reason) => URGENT_REASON_LABELS[reason] ?? reason).join(' · ')}`;
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  } catch {
    return iso;
  }
}

export function AdminPage() {
  const koreaDate = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
  const [today, setToday] = useState(koreaDate);
  useEffect(() => {
    const refreshDay = () => setToday(koreaDate());
    const timer = window.setInterval(refreshDay, 60000);
    window.addEventListener('focus', refreshDay);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refreshDay); };
  }, []);
  const [token, setToken] = useState<string | null>(readSavedToken);
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [focusId] = useState<string | null>(() => INQUIRY_HASH.exec(window.location.hash)?.[1] ?? null);
  const linkOpened = useRef(false);
  const [directTopic, setDirectTopic] = useState(DIRECT_TOPICS[0] ?? '');
  const [directName, setDirectName] = useState('');
  const [directResult, setDirectResult] = useState<{ brief: ConsultBriefSection[]; draft: string; notes: string[] } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [items, setItems] = useState<InquiryRecord[] | null>(null);
  const [funnel, setFunnel] = useState<FunnelSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'urgent' | InquiryRecord['status']>('all');
  const [memoDrafts, setMemoDrafts] = useState<Record<string, string>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyNotes, setReplyNotes] = useState<Record<string, string[]>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(async (activeToken: string) => {
    setError(null);
    const result = await fetchAdminDashboard(activeToken);
    if (!result.ok) {
      if (result.error === 'unauthorized') {
        forgetToken();
        setToken(null);
        setError('다시 로그인해 주세요.');
      } else {
        setError('접수 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
      }
      setItems(null);
      setFunnel(null);
      return;
    }
    setItems(result.value.items);
    setFunnel(result.value.funnel);
  }, []);

  useEffect(() => {
    if (token) void load(token);
  }, [token, load]);

  // 텔레그램 알림 링크(#접수번호)로 들어오면 목록을 불러온 뒤 그 접수로 내려간다.
  useEffect(() => {
    if (!focusId || !items || linkOpened.current) return;
    const target = document.getElementById(`inquiry-${focusId}`);
    if (target) {
      target.scrollIntoView?.({ block: 'start' });
      linkOpened.current = true;
    }
  }, [focusId, items]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password || loggingIn) return;
    setLoggingIn(true);
    setError(null);
    const result = await loginAdmin(password);
    setLoggingIn(false);
    if (!result.ok) {
      switch (result.error) {
        case 'unauthorized': setError('비밀번호가 올바르지 않습니다.'); break;
        case 'rate_limited': setError('시도가 많습니다. 잠시 후 다시 로그인해 주세요.'); break;
        case 'unavailable': setError('지금은 비밀번호 로그인을 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.'); break;
        default: setError('로그인할 수 없습니다. 연결을 확인하고 다시 시도해 주세요.');
      }
      return;
    }
    setPassword('');
    safeSessionSet(TOKEN_KEY, result.value);
    if (rememberDevice) writeStorage('localStorage', TOKEN_KEY, result.value);
    setToken(result.value);
  }

  function handleLogout() {
    forgetToken();
    setToken(null);
    setItems(null);
    setFunnel(null);
  }

  async function handleCopy(key: string, text: string) {
    if (await copyText(text)) setCopiedKey(key);
  }

  function handleDirectBuild(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const brief = buildConsultBrief({ topic: directTopic }) ?? [];
    const draft = buildDirectReplyDraft({ topic: directTopic, name: directName });
    setDirectResult({ brief, draft: draft?.text ?? '', notes: draft?.notes ?? [] });
    setCopiedKey(null);
  }

  function replaceItem(updated: InquiryRecord) {
    setItems((prev) => prev?.map((item) => (item.id === updated.id ? updated : item)) ?? prev);
  }

  async function handleStatus(id: string, status: InquiryRecord['status']) {
    if (!token) return;
    const result = await patchInquiry(token, id, { status });
    if (result.ok) replaceItem(result.value);
    else setError('상태 변경에 실패했습니다.');
  }

  function renderStatusActions(item: InquiryRecord) {
    return (
      <div className="admin-actions" role="group" aria-label={`${item.id} 상태 변경`}>
        {STATUS_KEYS.filter((key) => key !== item.status).map((key) => (
          <button
            key={key}
            className="button"
            type="button"
            onClick={() => void handleStatus(item.id, key)}
          >
            {STATUS_LABEL[key]}(으)로 변경
          </button>
        ))}
      </div>
    );
  }

  async function handlePipelineStage(
    id: string,
    pipelineStage: NonNullable<InquiryRecord['pipelineStage']>,
  ) {
    if (!token) return;
    const result = await patchInquiry(token, id, { pipelineStage });
    if (result.ok) replaceItem(result.value);
    else setError('수임 단계 변경에 실패했습니다.');
  }

  async function handleMemoAdd(id: string) {
    if (!token) return;
    const memo = (memoDrafts[id] ?? '').trim();
    if (!memo) return;
    const result = await patchInquiry(token, id, { memo });
    if (result.ok) {
      replaceItem(result.value);
      setMemoDrafts((prev) => ({ ...prev, [id]: '' }));
    } else {
      setError('메모 저장에 실패했습니다.');
    }
  }

  async function handlePurge(id: string) {
    if (!token) return;
    const confirmed = window.confirm(
      `${id} 접수의 개인정보(성함·연락처·상담 내용·메모)를 파기합니다. 분야·접수일 등 통계 정보만 남으며 되돌릴 수 없습니다. 진행할까요?`,
    );
    if (!confirmed) return;
    const result = await purgeInquiry(token, id);
    if (result.ok) replaceItem(result.value);
    else setError('파기에 실패했습니다.');
  }

  function handleBuildReply(item: InquiryRecord) {
    // 접수 답변을 채운 초안(api/_reply-draft.mjs — 로컬 대기함과 같은 초안). 자동 발송하지 않는다.
    const draft = buildReplyDraft(item);
    if (!draft) return;
    setReplyDrafts((prev) => ({ ...prev, [item.id]: draft.text }));
    setReplyNotes((prev) => ({ ...prev, [item.id]: draft.notes }));
  }

  async function handleCopyReply(id: string) {
    const text = replyDrafts[id];
    if (!text) return;
    if (await copyText(text)) setCopiedId(id);
  }

  const stats = useMemo(() => summarizeInquiries(items ?? []), [items]);
  const due = (items ?? []).filter(item =>
    !item.purged && item.status !== 'done' && item.followUpDate && item.followUpDate <= today
  ).sort((a, b) => a.followUpDate!.localeCompare(b.followUpDate!));

  function showInquiry(id: string) {
    setFilter('all');
    window.requestAnimationFrame(() => {
      const card = document.getElementById(`inquiry-${id}`) as HTMLDetailsElement | null;
      if (!card) return;
      card.open = true;
      card.querySelector('summary')?.focus();
      card.scrollIntoView?.({ block: 'start' });
    });
  }
  const urgentCount = useMemo(() => (items ?? []).filter(isUrgentItem).length, [items]);
  // 미처리(신규) 긴급 건을 맨 위로 올리고, 나머지는 서버가 준 순서를 그대로 둔다(안정 정렬).
  const visible = useMemo(
    () => (items ?? [])
      .filter((item) => filter === 'all'
        || (filter === 'urgent' ? isUrgentItem(item) : item.status === filter))
      .map((item, order) => ({ item, order, top: item.status === 'new' && isUrgentItem(item) }))
      .sort((a, b) => Number(b.top) - Number(a.top) || a.order - b.order)
      .map(({ item }) => item),
    [items, filter],
  );

  if (!token) {
    return (
      <div className="page-shell section narrow-page">
        <header className="page-header">
          <h1>접수 관리</h1>
        </header>
        <form className="card consult-form" onSubmit={handleLogin}>
          <label>
            관리자 비밀번호
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <label className="agree">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
            />
            이 기기에서 로그인 유지(대표님 개인 휴대폰·PC에서만 선택)
          </label>
          <button className="button button--primary" type="submit" disabled={loggingIn}>
            {loggingIn ? '로그인 중…' : '로그인'}
          </button>
          {error && (
            <p className="note" role="alert">
              {error}
            </p>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="page-shell section">
      <header className="page-header">
        <h1>접수 관리</h1>
        <p className="note">상담 접수 현황을 확인하고 상태·메모·회신문을 관리합니다.</p>
        <button className="button" type="button" onClick={handleLogout}>
          로그아웃
        </button>
      </header>

      {error && (
        <p className="note" role="alert">
          {error}
        </p>
      )}

      {items && <section aria-labelledby="follow-ups">
        <h2 id="follow-ups">오늘 연락할 고객</h2>
        {due.length ? <ul>{due.map(item => <li key={item.id}>
          <button className="button" type="button" onClick={() => showInquiry(item.id)}>
            {item.followUpDate === today ? '오늘' : '기한 지남'} · {item.followUpDate} · {item.name} · {item.topic} · {item.id}
          </button>
        </li>)}</ul> : <p className="note">오늘까지 예정된 재연락이 없습니다.</p>}
      </section>}

      <section aria-labelledby="stats">
        <h2 id="stats">접수 통계</h2>
        <div className="grid-3">
          <article className="card">
            <h3>전체</h3>
            <p className="admin-stat">{stats.total}건</p>
          </article>
          <article className="card">
            <h3>상태별</h3>
            <ul className="admin-stat-list">
              {STATUS_KEYS.map((key) => (
                <li key={key}>
                  {STATUS_LABEL[key]}: {stats.byStatus[key] ?? 0}건
                </li>
              ))}
            </ul>
          </article>
          <article className="card">
            <h3>분야별</h3>
            <ul className="admin-stat-list">
              {Object.entries(stats.byTopic).map(([topic, count]) => (
                <li key={topic}>
                  {topic}: {count}건
                </li>
              ))}
              {stats.total === 0 && <li>아직 접수가 없습니다.</li>}
            </ul>
          </article>
          <article className="card">
            <h3>수임 단계별</h3>
            <ul className="admin-stat-list">
              {Object.entries(PIPELINE_LABEL).map(([key, label]) => (
                <li key={key}>{label}: {stats.byPipelineStage[key] ?? 0}건</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <AdminFunnel funnel={funnel} />

      <section aria-labelledby="direct-inquiry">
        <h2 id="direct-inquiry">전화·카카오톡·이메일 문의 응대 메모</h2>
        <details className="card admin-item">
          <summary>분야를 고르면 상담 준비 메모와 첫 회신 초안을 만듭니다</summary>
          <p className="note">
            사이트 상담 신청 밖으로 들어온 문의용입니다. 이 화면에서만 만들고 어디에도 저장하지 않습니다.
            카카오톡 답장·문자·이메일에 복사해 고쳐 쓰세요. 회신 대기·종결·파기 관리는 사무실 PC 프로그램의
            &lsquo;카카오톡·이메일·전화·방문 문의 등록&rsquo;에 남기면 됩니다(맡기지 않으면 마지막 연락일부터 3개월에 자동 파기).
          </p>
          <form className="consult-form" onSubmit={handleDirectBuild}>
            <label>
              분야
              <select value={directTopic} onChange={(e) => setDirectTopic(e.target.value)}>
                {DIRECT_TOPICS.map((topic) => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </label>
            <label>
              성함(선택 — 회신 첫 줄에만 씀)
              <input type="text" value={directName} onChange={(e) => setDirectName(e.target.value)} autoComplete="off" />
            </label>
            <button className="button button--primary" type="submit">메모·회신 초안 만들기</button>
          </form>
          {directResult && (
            <>
              <h3>상담 준비 메모</h3>
              <ConsultBriefView
                sections={directResult.brief}
                copyKey="direct-brief"
                copiedKey={copiedKey}
                onCopy={(key, text) => void handleCopy(key, text)}
              />
              {directResult.draft && (
                <div className="admin-reply">
                  {directResult.notes.map((note) => (
                    <p className="note" key={note}>{note}</p>
                  ))}
                  <label>
                    첫 회신 초안
                    <textarea
                      rows={12}
                      value={directResult.draft}
                      onChange={(e) => setDirectResult((prev) => (prev ? { ...prev, draft: e.target.value } : prev))}
                    />
                  </label>
                  <button
                    className="button"
                    type="button"
                    onClick={() => void handleCopy('direct-draft', directResult.draft)}
                  >
                    {copiedKey === 'direct-draft' ? '초안 복사됨' : '초안 복사'}
                  </button>
                </div>
              )}
            </>
          )}
        </details>
      </section>

      <section aria-labelledby="inquiries">
        <h2 id="inquiries">접수 목록</h2>
        <div className="admin-filter" role="group" aria-label="상태 필터">
          <button
            className={`button ${filter === 'all' ? 'button--primary' : ''}`}
            type="button"
            onClick={() => setFilter('all')}
          >
            전체 ({stats.total})
          </button>
          {STATUS_KEYS.map((key) => (
            <button
              key={key}
              className={`button ${filter === key ? 'button--primary' : ''}`}
              type="button"
              onClick={() => setFilter(key)}
            >
              {STATUS_LABEL[key]} ({stats.byStatus[key] ?? 0})
            </button>
          ))}
          <button
            className={`button ${filter === 'urgent' ? 'button--primary' : ''}`}
            type="button"
            onClick={() => setFilter('urgent')}
          >
            기한 우선 ({urgentCount})
          </button>
        </div>

        {items === null && !error && <p className="note">불러오는 중...</p>}
        {items !== null && visible.length === 0 && <p className="note">표시할 접수가 없습니다.</p>}

        {visible.map((item) => (
          <details
            className="card admin-item"
            key={item.id}
            id={`inquiry-${item.id}`}
            open={item.id === focusId || undefined}
          >
            <summary>
              {isUrgentItem(item) && (
                <span className="admin-badge-urgent" title={urgentTitle(item)}>⏰ 기한 우선</span>
              )}
              <strong>{item.id}</strong> · {item.topic} ·{' '}
              {item.purged ? '(개인정보 파기됨)' : item.name} · {formatDateTime(item.receivedAt)} ·{' '}
              {STATUS_LABEL[item.status]}
            </summary>

            {item.purged ? (
              <>
                <p className="note">
                  개인정보가 파기된 접수입니다. 분야·접수일·상태만 통계용으로 보관됩니다. (메모{' '}
                  {item.memoCount ?? 0}건 함께 파기)
                </p>
                {renderStatusActions(item)}
              </>
            ) : (
              <>
                <p>
                  연락처: <a href={`tel:${item.phone}`}>{item.phone}</a>
                  {item.email && (
                    <>
                      {' · '}이메일: <a href={`mailto:${item.email}`}>{item.email}</a>
                    </>
                  )}
                </p>
                {item.status !== 'done' && <FollowUpEditor date={item.followUpDate}
                  save={async (followUpDate) => {
                    const result = await patchInquiry(token, item.id, { followUpDate });
                    if (result.ok) replaceItem(result.value);
                    if (!result.ok && result.error === 'conflict') {
                      return '접수가 변경됐습니다. 새로고침 후 일정을 확인해 주세요.';
                    }
                    return result.ok ? '' : '재연락 일정을 저장하지 못했습니다. 다시 시도해 주세요.';
                  }} />}
                {(() => {
                  const brief = buildConsultBrief(item);
                  return brief && brief.length > 0 ? (
                    <details className="admin-item" open>
                      <summary>상담 준비 메모 — 전화·회신 전에 보는 정리(고객에게 보내지 않음)</summary>
                      <ConsultBriefView
                        sections={brief}
                        copyKey={`brief-${item.id}`}
                        copiedKey={copiedKey}
                        onCopy={(key, text) => void handleCopy(key, text)}
                      />
                    </details>
                  ) : null;
                })()}
                {item.localCaseId && (
                  <p className="note">
                    행정심판 시스템: {item.localStatus ? LOCAL_STATUS_LABEL[item.localStatus] : '대기함 등록'}
                    {item.localStatus === 'closed' && item.localCloseReason
                      ? ` — ${LOCAL_CLOSE_REASON_LABEL[item.localCloseReason]}`
                      : ''}
                    {item.localStatusAt ? ` · ${formatDateTime(item.localStatusAt)}` : ''}
                    {` (${item.localCaseId})`}
                  </p>
                )}
                {item.deadlineReport && (
                  <p className="note">
                    처분서·통지서 기한 — 고객 자가 응답(증빙 미확인):{' '}
                    <strong>
                      {DEADLINE_REPORT_OPTIONS.find((o) => o.value === item.deadlineReport)?.label ?? item.deadlineReport}
                    </strong>
                  </p>
                )}
                {item.message && <p className="admin-message">{item.message}</p>}

                {item.diagnosis && (
                  <details className="admin-item">
                    <summary>
                      셀프 진단 상세 ({findCheck(item.diagnosis.domain)?.title ?? item.diagnosis.domain}
                      {item.diagnosis.counts?.urgent ? ' · 긴급 항목 있음' : ''})
                    </summary>
                    <ul className="admin-stat-list">
                      {describeDiagnosis(item.diagnosis).map((entry) => (
                        <li key={entry.key}>
                          {entry.question} — <strong>{entry.answer}</strong>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                {item.visaDiagnosis && (
                  <details className="admin-item">
                    <summary>
                      비자 사전진단 상세 ({item.visaDiagnosis.visaSlug.toUpperCase()}
                      {' · '}{item.visaDiagnosis.questionCount}개 답변
                      {item.visaDiagnosis.level === 'urgent' ? ' · 긴급 확인 항목 있음' : ''})
                    </summary>
                    <ul className="admin-stat-list">
                      {Object.entries(item.visaDiagnosis.answers).map(([questionId, answer]) => (
                        <li key={questionId}>
                          {describeVisaDiagnosisAnswer(questionId, answer).question}
                          {' '}<span className="note">({questionId})</span>
                          {' — '}
                          <strong>{describeVisaDiagnosisAnswer(questionId, answer).answer}</strong>
                          {' '}<span className="note">({answer})</span>
                        </li>
                      ))}
                    </ul>
                    <p className="note">고객의 결과 전달 동의를 거쳐 일회성 연결로 접수된 답변입니다.</p>
                  </details>
                )}
                {item.visaIntake && (
                  <details className="admin-item" open={Boolean(item.visaIntake.deadlineFirst)}>
                    <summary>
                      비자 접수 질문 — 고객 자가 응답(증빙 미확인)
                      {item.visaIntake.deadlineFirst ? ' · 기한 우선 확인' : ''}
                    </summary>
                    <ul className="admin-stat-list">
                      {describeVisaIntake(item.visaIntake).map((entry) => (
                        <li key={entry.key}>
                          {entry.question} — <strong>{entry.answer}</strong>
                        </li>
                      ))}
                    </ul>
                    <p className="note">고객이 선택한 내용이며 사무소가 자료로 확인한 결과가 아닙니다.</p>
                  </details>
                )}
                {(item.sourcePath || item.utmSource) && (
                  <p className="note">
                    유입: {item.sourcePath ?? '-'}
                    {item.utmSource ? ` (utm: ${item.utmSource})` : ''}
                  </p>
                )}

                {renderStatusActions(item)}

                <div className="admin-pipeline">
                  <p className="note">
                    수임 흐름: {PIPELINE_LABEL[item.pipelineStage ?? 'inquiry']}
                  </p>
                  <div className="admin-actions" role="group" aria-label={`${item.id} 수임 단계 변경`}>
                    {Object.entries(PIPELINE_LABEL)
                      .filter(([key]) => key !== (item.pipelineStage ?? 'inquiry'))
                      .map(([key, label]) => (
                        <button
                          className="button"
                          key={key}
                          type="button"
                          onClick={() => void handlePipelineStage(
                            item.id,
                            key as NonNullable<InquiryRecord['pipelineStage']>,
                          )}
                        >
                          {label}(으)로 기록
                        </button>
                      ))}
                  </div>
                </div>

                {(item.memos ?? []).length > 0 && (
                  <ul className="admin-stat-list">
                    {(item.memos ?? []).map((memo) => (
                      <li key={memo.at}>
                        [{formatDateTime(memo.at)}] {memo.text}
                      </li>
                    ))}
                  </ul>
                )}
                <label>
                  처리 메모
                  <textarea
                    rows={2}
                    value={memoDrafts[item.id] ?? ''}
                    onChange={(e) =>
                      setMemoDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                  />
                </label>
                <button className="button" type="button" onClick={() => void handleMemoAdd(item.id)}>
                  메모 추가
                </button>

                <div className="admin-reply">
                  <button className="button" type="button" onClick={() => handleBuildReply(item)}>
                    회신문 생성
                  </button>
                  {replyDrafts[item.id] && (
                    <>
                      {(replyNotes[item.id] ?? []).map((note) => (
                        <p className="note" key={note}>
                          {note}
                        </p>
                      ))}
                      <label>
                        회신문 초안 (확인 질문 포함)
                        <textarea
                          rows={12}
                          value={replyDrafts[item.id]}
                          onChange={(e) =>
                            setReplyDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                        />
                      </label>
                      <button
                        className="button"
                        type="button"
                        onClick={() => void handleCopyReply(item.id)}
                      >
                        {copiedId === item.id ? '복사됨' : '복사'}
                      </button>
                    </>
                  )}
                </div>

                <button
                  className="button admin-purge"
                  type="button"
                  onClick={() => void handlePurge(item.id)}
                >
                  개인정보 파기
                </button>
              </>
            )}
          </details>
        ))}
      </section>
    </div>
  );
}
