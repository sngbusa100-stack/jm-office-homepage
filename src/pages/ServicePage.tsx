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
      </header>

      <section aria-labelledby="target">
        <h2 id="target">이런 분께 필요합니다</h2>
        <ul className="check-list">{service.target.map((t) => <li key={t}>{t}</li>)}</ul>
      </section>

      {service.deadlines && (
        <section className="card level-urgent" aria-labelledby="deadlines">
          <h2 id="deadlines">법정 기한 — 지나면 다툴 수 없습니다</h2>
          <ul>{service.deadlines.map((d) => <li key={d}>{d}</li>)}</ul>
        </section>
      )}

      <section aria-labelledby="process">
        <h2 id="process">진행 절차</h2>
        <ol className="process-list">{service.process.map((p) => <li key={p}>{p}</li>)}</ol>
      </section>

      <section aria-labelledby="documents">
        <h2 id="documents">필요 서류 예시</h2>
        <ul>{service.documents.map((d) => <li key={d}>{d}</li>)}</ul>
      </section>

      <section aria-labelledby="faq">
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
