import { useRef, useState } from 'react';

export function FollowUpEditor({ date, save }: {
  date?: string;
  save: (patch: { followUpDate?: string | null; memo?: string }) => Promise<string>;
}) {
  const [draft, setDraft] = useState(date ?? '');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const dateInput = useRef<HTMLInputElement>(null);

  async function submit(patch: Parameters<typeof save>[0]) {
    setBusy(true);
    try {
      const error = await save(patch);
      setNotice(error || (patch.memo === '부재중' ? '부재중으로 기록했습니다. 다음 연락일을 정해 주세요.' : '저장했습니다.'));
      if (!error && patch.followUpDate !== undefined) setDraft(patch.followUpDate ?? '');
      if (!error && patch.memo === '부재중') requestAnimationFrame(() => dateInput.current?.focus());
    } finally {
      setBusy(false);
    }
  }

  return (
    <fieldset disabled={busy} className="admin-actions">
      <legend>재연락 일정</legend>
      <label>다음 연락일 <input ref={dateInput} type="date" value={draft}
        onChange={(event) => { setDraft(event.target.value); setNotice(''); }} /></label>
      <button className="button" type="button" disabled={!draft || draft === date}
        onClick={() => void submit({ followUpDate: draft })}>일정 저장</button>
      <button className="button" type="button" onClick={() => void submit({ memo: '통화함' })}>
        통화함
      </button>
      <button className="button" type="button" onClick={() => void submit({ memo: '부재중' })}>부재중</button>
      {date && <button className="button" type="button" onClick={() => void submit({ followUpDate: null })}>연락 완료</button>}
      <span role="status">{notice}</span>
    </fieldset>
  );
}
