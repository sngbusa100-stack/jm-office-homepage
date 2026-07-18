import { Link } from 'react-router-dom';
import { services } from '../data/services';
import { ConsultCta } from '../components/ConsultCta';

export function ServicesPage() {
  return (
    <div className="page-shell section">
      <header className="page-header page-header--lead">
        <p className="eyebrow">정명 업무 안내</p>
        <h1>업무 분야</h1>
        <p className="page-lead">
          처분 대응부터 인허가와 사실관계 서류 작성까지, 현재 상황에 가까운 분야를 선택해
          절차·기한·준비 서류를 먼저 확인해 보세요.
        </p>
      </header>

      <div className="grid-3 service-grid">
        {services.map((service, index) => (
          <article className="card service-card" key={service.slug}>
            <p className="service-card__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</p>
            <h2>{service.name}</h2>
            <p>{service.short}</p>
            <Link className="text-link" to={`/services/${service.slug}`}>
              {service.name} 자세히 보기 →
            </Link>
          </article>
        ))}
      </div>

      <ConsultCta message="어느 분야에 해당하는지 판단하기 어렵다면, 먼저 셀프 진단으로 확인할 항목을 정리해 보세요." />
    </div>
  );
}
