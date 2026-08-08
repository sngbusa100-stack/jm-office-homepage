import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ServiceFlowSteps } from '../components/ServiceFlowSteps';
import { findService, type Service } from '../data/services';
import {
  attributedExternalUrl,
  captureAttribution,
  trackFunnelEvent,
  type Attribution,
} from '../lib/funnel';
import { NotFoundPage } from './NotFoundPage';

function ServiceActions({
  service,
  location,
  attribution,
}: {
  service: Service;
  location: 'top' | 'bottom';
  attribution: Attribution;
}) {
  const track = () => {
    void trackFunnelEvent({
      event: 'landing_cta_click',
      domain: service.funnelDomain,
      path: `/services/${service.slug}`,
    });
  };

  return (
    <div className={`service-actions service-actions--${location}`} aria-label="다음 단계">
      {service.checkDomain ? (
        <Link className="button button--accent" to={`/check/${service.checkDomain}`} onClick={track}>
          내 상황 셀프 진단하기 →
        </Link>
      ) : service.externalLink ? (
        <a
          className="button button--accent"
          href={attributedExternalUrl(service.externalLink.url, 'jm_main', attribution)}
          onClick={track}
        >
          {service.externalLink.label} →
        </a>
      ) : (
        <a className="button button--accent" href="#preparation-review" onClick={track}>
          상담 전 확인 목록 보기 →
        </a>
      )}
      <Link
        className="button button--ghost"
        to={`/consult?topic=${service.consultTopic}&priority=urgent`}
        onClick={track}
      >
        {service.deadlines ? '기한이 급하면 상담부터' : '내 상황을 상담으로 정리하기'}
      </Link>
    </div>
  );
}

export function ServicePage() {
  const { slug } = useParams();
  const service = slug ? findService(slug) : undefined;
  // 첫 렌더의 외부 링크에도 현재 URL의 유입정보가 바로 반영되도록 초기화한다.
  const [attribution] = useState(() => captureAttribution(window.location.search));

  useEffect(() => {
    if (!service) return;
    void trackFunnelEvent({
      event: 'landing_view',
      domain: service.funnelDomain,
      path: `/services/${service.slug}`,
    });
  }, [service]);

  if (!service) return <NotFoundPage />;

  return (
    <div className="page-shell section service-landing">
      <header className="page-header">
        <p className="eyebrow">{service.name}</p>
        <h1>{service.headline}</h1>
        <p className="page-lead">{service.short}</p>
        <ServiceFlowSteps service={service} attribution={attribution} />
        <ServiceActions service={service} location="top" attribution={attribution} />
      </header>

      {service.deadlines && (
        <section className="card level-urgent deadline-callout" aria-labelledby="deadlines">
          <h2 id="deadlines">법정 기한 — 늦기 전에 확인하세요</h2>
          <p className="note">아래는 일반적인 기한입니다. 처분 종류·통지 방식·개별 사정에 따라 달라질 수 있으므로 처분서의 안내를 함께 확인하세요.</p>
          <ul className="bullet-list">{service.deadlines.map((d) => <li key={d}>{d}</li>)}</ul>
        </section>
      )}

      <section aria-labelledby="quick-checks">
        <div className="section-heading">
          <p className="eyebrow">조회</p>
          <h2 id="quick-checks">먼저 확인할 항목</h2>
          <p>내 문서와 현재 단계를 아래 항목에 대입해 보면 다음 행동을 고르기 쉬워집니다.</p>
        </div>
        <div className="quick-check-grid">
          {service.quickChecks.map((item) => (
            <article className="card quick-check-card" key={item.label}>
              <p className="quick-check-card__label">{item.label}</p>
              <h3>{item.value}</h3>
              {item.note && <p className="note">{item.note}</p>}
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="target">
        <h2 id="target">이런 분께 필요합니다</h2>
        <ul className="check-list">{service.target.map((t) => <li key={t}>{t}</li>)}</ul>
      </section>

      <details className="card official-source-card reference-section">
        <summary>
          <h2 id="official-sources">공식 기준·조회 경로</h2>
          <span className="reference-section__hint">{service.officialSources.length}건 · 펼쳐 보기</span>
        </summary>
        <p className="note">기준은 바뀔 수 있으므로 실제 신청 전 최신 공지와 받은 문서를 다시 확인해야 합니다.</p>
        <ul className="official-source-list">
          {service.officialSources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>
              <span>확인일 {source.checkedAt}</span>
            </li>
          ))}
        </ul>
      </details>

      <section aria-labelledby="process">
        <h2 id="process">진행 절차</h2>
        <ol className="process-list">{service.process.map((p) => <li key={p}>{p}</li>)}</ol>
      </section>

      <section aria-labelledby="documents">
        <h2 id="documents">필요 서류 예시</h2>
        <ul className="bullet-list">{service.documents.map((d) => <li key={d}>{d}</li>)}</ul>
      </section>

      <section id="preparation-review" aria-labelledby="preparation-review-heading">
        <div className="section-heading">
          <p className="eyebrow">준비 구분</p>
          <h2 id="preparation-review-heading">직접 준비와 검토가 필요한 부분</h2>
        </div>
        <div className="grid-2 preparation-grid">
          <article className="card">
            <h3>지금 직접 준비할 수 있습니다</h3>
            <ul className="check-list">{service.selfService.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
          <article className="card">
            <h3>사건별 검토가 필요한 부분입니다</h3>
            <ul className="bullet-list">{service.professionalReview.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        </div>
      </section>

      {service.relatedLinks && (
        <section aria-labelledby="related-links">
          <h2 id="related-links">비자별 설명·진단 바로가기</h2>
          <div className="related-link-grid">
            {service.relatedLinks.map((link) => (
              <a
                className="card related-link"
                href={attributedExternalUrl(link.url, 'jm_main', attribution)}
                key={link.url}
              >
                {link.label} <span aria-hidden="true">→</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* FAQ는 바깥으로 한 번 더 감싸지 않는다. 질문 목록을 훑어 내 상황을 찾는 것이
          FAQ의 핵심인데, 감싸면 질문까지 숨겨지고 답을 보기까지 클릭이 두 번 필요하다.
          항목별 details로 이미 가벼우므로 제목 무게만 참고 섹션 수준으로 낮춘다. */}
      <section className="faq-list reference-heading" aria-labelledby="faq">
        <h2 id="faq">자주 묻는 질문</h2>
        {service.faqs.map((faq) => (
          <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>
        ))}
      </section>

      <aside className="card service-next-step" aria-labelledby="next-step">
        <p className="eyebrow">다음 단계</p>
        <h2 id="next-step">설명을 확인했다면 내 상황으로 좁혀 보세요</h2>
        <p>진단은 가능성과 준비 항목을 정리하는 도구이며, 결과를 보장하지 않습니다. 기한이 임박했거나 문서 종류가 불명확하면 상담 단계로 바로 이동할 수 있습니다.</p>
        <ServiceActions service={service} location="bottom" attribution={attribution} />
      </aside>
    </div>
  );
}
