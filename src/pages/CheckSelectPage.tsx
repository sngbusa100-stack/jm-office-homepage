import { Link } from 'react-router-dom';
import { checks } from '../data/checks';

export function CheckSelectPage() {
  return (
    <div className="page-shell section">
      <header className="page-header">
        <h1>셀프 진단</h1>
        <p>
          답변을 바탕으로 확인이 필요한 항목을 4단계(긴급 확인 · 서류 보완 · 공식 확인 · 확인됨)로
          정리합니다. 결과는 일반 정보이며 법률 자문이 아닙니다. 답변은 브라우저에만 저장되며, 상담 신청 때
          직접 선택하신 경우에만 함께 전송됩니다.
        </p>
      </header>
      <aside className="prep-guide" aria-labelledby="prep-guide-heading">
        <div>
          <p className="eyebrow">셀프 진단 전에</p>
          <h2 id="prep-guide-heading">처분 관련 진단은 통지서를 옆에 두고 시작하세요</h2>
        </div>
        <ul className="guide-list">
          <li><strong>받은 날짜</strong><span>기한 확인의 출발점입니다</span></li>
          <li><strong>처분·통지서</strong><span>처분 단계와 근거를 확인합니다</span></li>
          <li><strong>약 3분</strong><span>확인할 항목을 4단계로 정리합니다</span></li>
        </ul>
      </aside>
      <div className="grid-3">
        {Object.values(checks).map((def) => (
          <article className="card" key={def.domain}>
            <h2>{def.title}</h2>
            <p>{def.intro}</p>
            <p className="note">{def.questions.length}개 문항 · 약 3분</p>
            <Link className="button button--primary" to={`/check/${def.domain}`}>{def.title} 시작 →</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
