import { Link } from 'react-router-dom';
import type { Service } from '../data/services';
import type { Attribution } from '../lib/funnel';
import { nextStepFor } from '../lib/serviceNextStep';
import { FLOW_STEP_INTRO, SERVICE_FLOW_STEPS, VISA_EXTERNAL_NOTE } from '../data/serviceFlow';

// href가 없는 단계가 곧 현재 단계다. Phase 1에서는 1단계에 쓰이지 않는
// '#target'을 계산해 두고 버렸는데, 그 죽은 데이터를 없앤다.
interface StepTarget {
  label: string;
  href?: string;
  external?: boolean;
}

export function ServiceFlowSteps({
  service,
  attribution,
}: {
  service: Service;
  attribution?: Attribution;
}) {
  const diagnosis = nextStepFor(service, attribution);
  const steps: StepTarget[] = [
    { label: SERVICE_FLOW_STEPS[0] },
    { label: SERVICE_FLOW_STEPS[1], href: '#quick-checks' },
    { label: diagnosis.stepLabel, href: diagnosis.href, external: diagnosis.external },
    { label: SERVICE_FLOW_STEPS[3], href: `/consult?topic=${service.consultTopic}` },
  ];

  return (
    <nav className="flow-steps" aria-label="진행 단계">
      <p className="flow-steps__intro">{FLOW_STEP_INTRO}</p>
      <ol className="flow-steps__list">
        {steps.map((step, index) => (
          <li key={step.label} aria-current={step.href ? undefined : 'step'}>
            <span className="flow-steps__number" aria-hidden="true">{index + 1}</span>
            {!step.href ? (
              <span className="flow-steps__label">{step.label}</span>
            ) : step.external || step.href.startsWith('#') ? (
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
