import { Link } from 'react-router-dom';
import { areaServices, serviceAreas } from '../data/serviceAreas';

/**
 * 명함 업무분야 5개 카드. 홈(카드 제목 h3)과 /services(h2)가 함께 쓴다.
 * 각 카드 아래에 그 분야의 업무 상세 페이지로 가는 링크를 둔다.
 */
export function ServiceAreaGrid({ headingLevel }: { headingLevel: 'h2' | 'h3' }) {
  const Heading = headingLevel;
  return (
    <div className="grid-3 service-grid">
      {serviceAreas.map((area, index) => {
        const pages = areaServices(area);
        return (
          <article className="card service-card" key={area.id}>
            <p className="service-card__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</p>
            <Heading>{area.name}</Heading>
            <p>{area.short}</p>
            {pages.length > 0 ? (
              <ul className="service-card__links">
                {pages.map((service) => (
                  <li key={service.slug}>
                    <Link className="text-link" to={`/services/${service.slug}`}>{service.name} →</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="service-card__links">
                <p className="note">분야별 안내 페이지를 준비하고 있습니다.</p>
                <Link className="text-link" to="/consult">상담 안내 보기 →</Link>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
