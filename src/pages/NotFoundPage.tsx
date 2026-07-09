import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="page-shell section narrow-page">
      <h1>페이지를 찾을 수 없습니다</h1>
      <p>주소가 바뀌었거나 잘못 입력되었을 수 있습니다.</p>
      <div className="button-row">
        <Link className="button button--primary" to="/">홈으로 돌아가기</Link>
        <Link className="button button--ghost" to="/check">셀프 진단</Link>
        <Link className="button button--ghost" to="/consult">상담 안내</Link>
      </div>
    </div>
  );
}
