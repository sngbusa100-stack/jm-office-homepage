import { Link } from 'react-router-dom';
import type { Service } from '../data/services';
import { attributedExternalUrl, type Attribution } from '../lib/funnel';
import { FLOW_STEP_INTRO, SERVICE_FLOW_STEPS, VISA_EXTERNAL_NOTE } from '../data/serviceFlow';

interface StepTarget {
  label: string;
  href: string;
  external: boolean;
}

// 3단계(진단)는 분야마다 목적지가 다르다.
// 내부 진단 → /check/:domain, 비자 → 외부 진단센터, 진단이 없는 분야 → 페이지 안 확인 목록
function diagnosisTarget(service: Service, attribution?: Attribution): StepTarget {
  if (service.checkDomain) {
    return { label: SERVICE_FLOW_STEPS[2], href: `/check/${service.checkDomain}`, external: false };
  }
  if (service.externalLink) {
    return {
      label: SERVICE_FLOW_STEPS[2],
      href: attributedExternalUrl(service.externalLink.url, 'jm_main', attribution ?? {}),
      external: true,
    };
  }
  return { label: '상담 전 확인 목록', href: '#preparation-review', external: false };
}

export function ServiceFlowSteps({
  service,
  attribution,
}: {
  service: Service;
  attribution?: Attribution;
}) {
  const diagnosis = diagnosisTarget(service, attribution);
  const steps: StepTarget[] = [
    { label: SERVICE_FLOW_STEPS[0], href: '#target', external: false },
    { label: SERVICE_FLOW_STEPS[1], href: '#quick-checks', external: false },
    diagnosis,
    { label: SERVICE_FLOW_STEPS[3], href: `/consult?topic=${service.consultTopic}`, external: false },
  ];

  return (
    <nav className="flow-steps" aria-label="진행 단계">
      <p className="flow-steps__intro">{FLOW_STEP_INTRO}</p>
      <ol className="flow-steps__list">
        {steps.map((step, index) => (
          <li key={step.label} aria-current={index === 0 ? 'step' : undefined}>
            <span className="flow-steps__number" aria-hidden="true">{index + 1}</span>
            {index === 0 ? (
              <span className="flow-steps__label">{step.label}</span>
            ) : step.external ? (
              <a className="flow-steps__label" href={step.href}>{step.label}</a>
            ) : step.href.startsWith('#') ? (
              <a className="flow-steps__label" href={step.href}>{step.label}</a>
            ) : (
              <Link className="flow-steps__label" to={step.href}>{step.label}</Link>
            )}
          </li>
        ))}
      </ol>
      {diagnosis.external && <p className="note flow-steps__note">{VISA_EXTERNAL_NOTE}</p>}
    </nav>
  );
}
