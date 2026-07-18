import { Link, useParams } from 'react-router-dom';
import { findService } from '../data/services';
import { ConsultCta } from '../components/ConsultCta';
import { NotFoundPage } from './NotFoundPage';

export function ServicePage() {
  const { slug } = useParams();
  const service = slug ? findService(slug) : undefined;
  if (!service) return <NotFoundPage />;

  return (
    <div className="page-shell section">
      <header className="page-header">
        <p className="eyebrow">{service.name}</p>
        <h1>{service.headline}</h1>
        <p className="page-lead">{service.short}</p>
      </header>

      <section aria-labelledby="target">
        <h2 id="target">이런 분께 필요합니다</h2>
        <ul className="check-list">{service.target.map((t) => <li key={t}>{t}</li>)}</ul>
      </section>

      {service.deadlines && (
        <section className="card level-urgent" aria-labelledby="deadlines">
          <h2 id="deadlines">법정 기한 — 늦기 전에 확인하세요</h2>
          <p className="note">아래는 일반적인 기한입니다. 처분 종류·통지 방식·개별 사정에 따라 달라질 수 있으므로 처분서의 안내를 함께 확인하세요.</p>
          <ul className="bullet-list">{service.deadlines.map((d) => <li key={d}>{d}</li>)}</ul>
        </section>
      )}

      <section aria-labelledby="process">
        <h2 id="process">진행 절차</h2>
        <ol className="process-list">{service.process.map((p) => <li key={p}>{p}</li>)}</ol>
      </section>

      <section aria-labelledby="documents">
        <h2 id="documents">필요 서류 예시</h2>
        <ul className="bullet-list">{service.documents.map((d) => <li key={d}>{d}</li>)}</ul>
      </section>

      <section className="faq-list" aria-labelledby="faq">
        <h2 id="faq">자주 묻는 질문</h2>
        {service.faqs.map((faq) => (
          <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>
        ))}
      </section>

      {service.checkDomain ? (
        <div className="center-actions">
          <Link className="button button--accent" to={`/check/${service.checkDomain}`}>
            내 상황 셀프 진단하기 →
          </Link>
        </div>
      ) : service.comingSoon ? (
        <aside className="availability-card card" role="note">
          <p className="eyebrow">준비 중</p>
          <h2>{service.comingSoon.title}</h2>
          <p>{service.comingSoon.description}</p>
        </aside>
      ) : service.externalLink ? (
        <div className="center-actions">
          <a className="button button--accent" href={service.externalLink.url}>
            {service.externalLink.label} →
          </a>
        </div>
      ) : (
        <ConsultCta />
      )}
    </div>
  );
}
