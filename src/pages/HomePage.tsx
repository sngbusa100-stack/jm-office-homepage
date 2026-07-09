import { Link } from 'react-router-dom';
import { services } from '../data/services';
import { homeFaqs } from '../data/faq';
import { checks } from '../data/checks';
import { ConsultCta } from '../components/ConsultCta';

export function HomePage() {
  return (
    <>
      <section className="hero page-shell">
        <p className="eyebrow">정명(正明) 행정사사무소</p>
        <h1>영업정지 통지, 면허 취소, 반려된 신청 —<br />행정 문제는 기한 싸움입니다.</h1>
        <p className="hero__intro">
          처분을 다툴 수 있는 기간은 법으로 정해져 있습니다. 내 상황에서 무엇을,
          언제까지 확인해야 하는지 셀프 진단으로 먼저 정리해 보세요.
        </p>
        <div className="button-row">
          <Link className="button button--accent" to="/check">셀프 진단 시작 →</Link>
          <Link className="button button--ghost" to="/why">행정사가 필요한 이유</Link>
        </div>
        <ul className="trust-list">
          <li>✓ 결과는 처분·인용 여부에 대한 판단이 아닌 일반 정보입니다</li>
          <li>✓ 답변은 브라우저에만 저장되며 서버로 전송하지 않습니다</li>
        </ul>
      </section>

      <section className="section page-shell" aria-labelledby="check-heading">
        <h2 id="check-heading">3분 셀프 진단</h2>
        <p>지금 확인이 급한 대표 3개 분야입니다.</p>
        <div className="grid-3">
          {Object.values(checks).map((def) => (
            <article className="card" key={def.domain}>
              <h3>{def.title}</h3>
              <p>{def.intro}</p>
              <Link className="button button--primary" to={`/check/${def.domain}`}>진단 시작 →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section page-shell" id="services" aria-labelledby="services-heading">
        <h2 id="services-heading">업무 분야</h2>
        <div className="grid-3">
          {services.map((s) => (
            <article className="card" key={s.slug}>
              <h3>{s.name}</h3>
              <p>{s.short}</p>
              <Link to={`/services/${s.slug}`}>자세히 보기 →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--tinted">
        <div className="page-shell">
          <h2>왜 전문가와 함께해야 하나요?</h2>
          <p>
            행정 절차는 한 번 기한을 놓치거나 요건을 잘못 짚으면 되돌리기 어렵습니다.
            행정사가 하는 일과, 혼자 진행할 때와의 차이를 정리했습니다.
          </p>
          <Link className="button button--ghost" to="/why">행정사가 필요한 이유 보기 →</Link>
        </div>
      </section>

      <section className="section page-shell" aria-labelledby="process-heading">
        <h2 id="process-heading">진행 절차</h2>
        <ol className="process-grid">
          <li><span>1</span><h3>셀프 진단·상담</h3><p>상황과 기한을 확인하고 진행 방향을 정합니다.</p></li>
          <li><span>2</span><h3>서류 준비·작성</h3><p>요건에 맞는 증빙을 수집하고 서류를 작성합니다.</p></li>
          <li><span>3</span><h3>제출·결과 확인</h3><p>제출을 대행하고 보완 요구와 결과에 대응합니다.</p></li>
        </ol>
      </section>

      <section className="section page-shell faq-section" aria-labelledby="faq-heading">
        <h2 id="faq-heading">자주 묻는 질문</h2>
        <div className="faq-list">
          {homeFaqs.map((faq) => (
            <details key={faq.q}>
              <summary>{faq.q}</summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section page-shell">
        <ConsultCta />
      </section>
    </>
  );
}
