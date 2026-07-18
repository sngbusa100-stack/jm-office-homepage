import { Link } from 'react-router-dom';
import { services } from '../data/services';
import { homeFaqs } from '../data/faq';
import { checks } from '../data/checks';
import { ConsultCta } from '../components/ConsultCta';

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="page-shell hero__grid">
          <div className="hero__content">
            <p className="eyebrow">정명(正明) 행정사사무소</p>
            <h1>영업정지 통지, 면허 취소, 반려된 신청 —<br />행정 문제는 초기 대응이 중요합니다.</h1>
            <p className="hero__intro">
              처분에 대한 불복과 의견제출에는 정해진 기간이 있습니다. 내 상황에서 무엇을,
              언제까지 확인해야 하는지 셀프 진단으로 먼저 정리해 보세요.
            </p>
            <div className="button-row">
              <Link className="button button--accent" to="/check">셀프 진단 시작 →</Link>
              <Link className="button button--ghost" to="/services">업무 분야 살펴보기</Link>
            </div>
            <ul className="trust-list">
              <li>결과는 처분·인용 여부에 대한 판단이 아닌 일반 정보입니다</li>
              <li>답변은 브라우저에만 저장되며 서버로 전송하지 않습니다</li>
            </ul>
          </div>

          <aside className="hero__guide" aria-labelledby="first-step-heading">
            <p className="eyebrow">셀프 진단 전에</p>
            <h2 id="first-step-heading">통지서를 옆에 두고 시작하세요</h2>
            <ul className="guide-list">
              <li><strong>받은 날짜</strong><span>기한 확인의 출발점입니다</span></li>
              <li><strong>처분·통지서</strong><span>처분 단계와 근거를 확인합니다</span></li>
              <li><strong>약 3분</strong><span>확인할 항목을 4단계로 정리합니다</span></li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section page-shell" aria-labelledby="check-heading">
        <div className="section-heading">
          <p className="eyebrow">스스로 먼저 확인하기</p>
          <h2 id="check-heading">3분 셀프 진단</h2>
          <p>지금 확인이 급한 대표 3개 분야입니다.</p>
        </div>
        <div className="grid-3">
          {Object.values(checks).map((def) => (
            <article className="card action-card" key={def.domain}>
              <h3>{def.title}</h3>
              <p>{def.intro}</p>
              <Link className="button button--primary" to={`/check/${def.domain}`}>진단 시작 →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section page-shell" id="services" aria-labelledby="services-heading">
        <div className="section-heading section-heading--row">
          <div>
            <p className="eyebrow">분야별 절차 안내</p>
            <h2 id="services-heading">업무 분야</h2>
          </div>
          <Link className="text-link" to="/services">전체 업무 보기 →</Link>
        </div>
        <div className="grid-3 service-grid">
          {services.map((s, index) => (
            <article className="card service-card" key={s.slug}>
              <p className="service-card__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</p>
              <h3>{s.name}</h3>
              <p>{s.short}</p>
              <Link className="text-link" to={`/services/${s.slug}`}>자세히 보기 →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--tinted">
        <div className="page-shell">
          <div className="feature-band">
            <div>
              <p className="eyebrow">역할과 범위</p>
              <h2>왜 전문가와 함께해야 하나요?</h2>
              <p>
                행정 절차는 기한과 요건을 함께 살펴야 합니다. 행정사가 하는 일과,
                혼자 진행할 때의 차이를 알기 쉽게 정리했습니다.
              </p>
            </div>
            <Link className="button button--ghost" to="/why">행정사가 필요한 이유 보기 →</Link>
          </div>
        </div>
      </section>

      <section className="section page-shell" aria-labelledby="process-heading">
        <div className="section-heading">
          <p className="eyebrow">처음부터 제출 이후까지</p>
          <h2 id="process-heading">진행 절차</h2>
        </div>
        <ol className="process-grid">
          <li><h3>셀프 진단·상담</h3><p>상황과 기한을 확인하고 진행 방향을 정합니다.</p></li>
          <li><h3>서류 준비·작성</h3><p>요건에 맞는 증빙을 수집하고 서류를 작성합니다.</p></li>
          <li><h3>제출·결과 확인</h3><p>제출을 대행하고 보완 요구와 결과에 대응합니다.</p></li>
        </ol>
      </section>

      <section className="section page-shell faq-section" aria-labelledby="faq-heading">
        <div className="section-heading">
          <p className="eyebrow">이용 전 확인</p>
          <h2 id="faq-heading">자주 묻는 질문</h2>
        </div>
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
