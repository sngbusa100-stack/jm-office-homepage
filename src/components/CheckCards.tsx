import { Link } from 'react-router-dom';
import { checks } from '../data/checks';
import { serviceAreas } from '../data/serviceAreas';
import { VisaCheckCard } from './VisaCheckCard';

export function CheckCards({ headingLevel }: { headingLevel: 'h2' | 'h3' }) {
  const Heading = headingLevel;
  return (
    <div className="grid-3 check-directory">
      {serviceAreas.map((area) => {
        if (area.id === 'visa') return <VisaCheckCard key={area.id} headingLevel={headingLevel} />;
        if (area.id === 'remedy') {
          return (
            <article className="card action-card" key={area.id}>
              <Heading>{area.name}</Heading>
              <p>받은 통지가 있다면 받은 날짜를 확인하고, 아래에서 해당하는 일을 고르세요.</p>
              <ul className="check-links">
                {([['suspension', '영업정지·과징금'], ['dui', '운전면허 취소·정지'], ['veterans', '국가보훈 등록·결정'], ['appeal', '그 밖의 행정기관 결정·통지']] as const).map(([domain, label]) => (
                  <li key={domain}><Link to={`/check/${domain}`}>{label}<span aria-hidden="true"> →</span></Link></li>
                ))}
              </ul>
            </article>
          );
        }
        const def = checks[area.id];
        return (
          <article className="card action-card" key={def.domain}>
            <Heading>{area.name}</Heading>
            <p>{def.summary}</p>
            <Link className="button button--primary" to={`/check/${def.domain}`} aria-label={`${area.name} 질문 시작`}>질문 시작 →</Link>
          </article>
        );
      })}
    </div>
  );
}
