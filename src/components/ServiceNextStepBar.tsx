import { Link } from 'react-router-dom';
import type { Service } from '../data/services';
import type { Attribution } from '../lib/funnel';
import { nextStepFor } from '../lib/serviceNextStep';

/**
 * 모바일에서만 보이는 하단 고정 바.
 * 상단 sticky 바의 `상담 문의`와 겹치지 않도록 범용 상담이 아니라
 * 지금 보고 있는 분야의 다음 단계를 보여준다.
 */
export function ServiceNextStepBar({
  service,
  attribution,
}: {
  service: Service;
  attribution?: Attribution;
}) {
  const next = nextStepFor(service, attribution);
  const label = <span className="next-step-bar__field">{service.name}</span>;

  return (
    <div className="next-step-bar" role="complementary" aria-label="다음 단계 바로가기">
      {label}
      {next.external || next.href.startsWith('#') ? (
        <a className="button button--accent" href={next.href}>{next.barLabel}</a>
      ) : (
        <Link className="button button--accent" to={next.href}>{next.barLabel}</Link>
      )}
    </div>
  );
}
