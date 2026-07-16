import { useCallback, useEffect, useMemo, useState } from 'react';
import { removeStorage, safeSessionGet, safeSessionSet } from '../lib/browserStorage';
import {
  fetchInquiries,
  patchInquiry,
  purgeInquiry,
  summarizeInquiries,
} from '../lib/adminApi';
import type { InquiryRecord } from '../lib/adminApi';
import { buildReply, findReplyTemplate } from '../data/replyTemplates';

const TOKEN_KEY = 'admin:token';

const STATUS_KEYS = ['new', 'in_progress', 'done', 'on_hold'] as const;

const STATUS_LABEL: Record<InquiryRecord['status'], string> = {
  new: '신규',
  in_progress: '진행 중',
  done: '완료',
  on_hold: '보류',
};

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  } catch {
    return iso;
  }
}

export function AdminPage() {
  const [token, setToken] = useState<string | null>(() => safeSessionGet(TOKEN_KEY));
  const [tokenInput, setTokenInput] = useState('');
  const [items, setItems] = useState<InquiryRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | InquiryRecord['status']>('all');
  const [memoDrafts, setMemoDrafts] = useState<Record<string, string>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(async (activeToken: string) => {
    setError(null);
    const result = await fetchInquiries(activeToken);
    if (!result.ok) {
      if (result.error === 'unauthorized') {
        removeStorage('sessionStorage', TOKEN_KEY);
        setToken(null);
        setError('관리자 토큰이 올바르지 않습니다.');
      } else {
        setError('접수 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
      }
      setItems(null);
      return;
    }
    setItems(result.value);
  }, []);

  useEffect(() => {
    if (token) void load(token);
  }, [token, load]);

  function handleTokenSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = tokenInput.trim();
    if (!value) return;
    safeSessionSet(TOKEN_KEY, value);
    setToken(value);
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
    const template = findReplyTemplate(item.topic);
    if (!template || !item.name) return;
    setReplyDrafts((prev) => ({
      ...prev,
      [item.id]: buildReply(template, { name: item.name ?? '', id: item.id }),
    }));
  }

  async function handleCopyReply(id: string) {
    const text = replyDrafts[id];
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
    } catch {
      // 클립보드 권한이 없으면 textarea에서 직접 복사하면 된다.
    }
  }

  const stats = useMemo(() => summarizeInquiries(items ?? []), [items]);
  const visible = useMemo(
    () => (items ?? []).filter((item) => filter === 'all' || item.status === filter),
    [items, filter],
  );

  if (!token) {
    return (
      <div className="page-shell section narrow-page">
        <header className="page-header">
          <h1>접수 관리</h1>
        </header>
        <form className="card consult-form" onSubmit={handleTokenSubmit}>
          <p className="note">사무소 관리자 전용 페이지입니다. 관리자 토큰을 입력해 주세요.</p>
          <label>
            관리자 토큰
            <input
              type="password"
              name="adminToken"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              autoComplete="off"
            />
          </label>
          <button className="button button--primary" type="submit">
            접속
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
      </header>

      {error && (
        <p className="note" role="alert">
          {error}
        </p>
      )}

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
        </div>
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
        </div>

        {items === null && !error && <p className="note">불러오는 중...</p>}
        {items !== null && visible.length === 0 && <p className="note">표시할 접수가 없습니다.</p>}

        {visible.map((item) => (
          <details className="card admin-item" key={item.id}>
            <summary>
              <strong>{item.id}</strong> · {item.topic} ·{' '}
              {item.purged ? '(개인정보 파기됨)' : item.name} · {formatDateTime(item.receivedAt)} ·{' '}
              {STATUS_LABEL[item.status]}
            </summary>

            {item.purged ? (
              <p className="note">
                개인정보가 파기된 접수입니다. 분야·접수일·상태만 통계용으로 보관됩니다. (메모{' '}
                {item.memoCount ?? 0}건 함께 파기)
              </p>
            ) : (
              <>
                <p>
                  연락처: <a href={`tel:${item.phone}`}>{item.phone}</a>
                </p>
                {item.message && <p className="admin-message">{item.message}</p>}

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
