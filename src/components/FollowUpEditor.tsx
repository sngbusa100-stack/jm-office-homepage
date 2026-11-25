import { useState } from 'react';

export function FollowUpEditor({ date, save }: {
  date?: string;
  save: (value: string | null) => Promise<string>;
}) {
  const [draft, setDraft] = useState(date ?? '');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  async function submit(value: string | null) {
    setBusy(true);
    try {
      const error = await save(value);
      setNotice(error || '저장했습니다.');
      if (!error) setDraft(value ?? '');
    } finally {
      setBusy(false);
    }
  }

  return (
    <fieldset disabled={busy} className="admin-actions">
      <legend>재연락 일정</legend>
      <label>다음 연락일 <input type="date" value={draft}
        onChange={(event) => { setDraft(event.target.value); setNotice(''); }} /></label>
      <button className="button" type="button" disabled={!draft || draft === date}
        onClick={() => void submit(draft)}>일정 저장</button>
      {date && <button className="button" type="button" onClick={() => void submit(null)}>연락 완료</button>}
      <span role="status">{notice}</span>
    </fieldset>
  );
}
