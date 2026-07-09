import { Link } from 'react-router-dom';
import { checks } from '../data/checks';

export function CheckSelectPage() {
  return (
    <div className="page-shell section">
      <header className="page-header">
        <h1>셀프 진단</h1>
        <p>
          답변을 바탕으로 확인이 필요한 항목을 4단계(긴급 확인 · 서류 보완 · 공식 확인 · 확인됨)로
          정리합니다. 결과는 일반 정보이며 법률 자문이 아닙니다. 답변은 브라우저에만 저장됩니다.
        </p>
      </header>
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
