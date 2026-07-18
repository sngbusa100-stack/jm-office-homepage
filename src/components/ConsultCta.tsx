import { Link } from 'react-router-dom';

export function ConsultCta({
  message = '법정 기한이 지나면 불복 절차가 제한될 수 있습니다. 내 상황부터 확인해 보세요.',
}: {
  message?: string;
}) {
  return (
    <aside className="consult-cta card">
      <p>{message}</p>
      <div className="button-row">
        <Link className="button button--accent" to="/check">셀프 진단 시작 →</Link>
        <Link className="button button--ghost" to="/consult">상담 안내 보기</Link>
      </div>
    </aside>
  );
}
