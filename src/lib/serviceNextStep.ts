import type { Service } from '../data/services';
import { attributedExternalUrl, type Attribution } from './funnel';
import { SERVICE_FLOW_STEPS } from '../data/serviceFlow';

export interface NextStep {
  /** 4단계 표시의 3단계 라벨 */
  stepLabel: string;
  /** 모바일 하단 바 버튼 라벨 — 좁은 화면을 위해 짧게 */
  barLabel: string;
  href: string;
  external: boolean;
}

/**
 * 분야의 3단계(진단) 목적지를 계산한다.
 * 내부 진단 → /check/:domain, 비자 → 외부 진단센터, 진단이 없는 분야 → 페이지 안 확인 목록
 */
export function nextStepFor(service: Service, attribution?: Attribution): NextStep {
  if (service.checkDomain) {
    return {
      stepLabel: SERVICE_FLOW_STEPS[2],
      barLabel: '내 상황 진단 시작',
      href: `/check/${service.checkDomain}`,
      external: false,
    };
  }
  if (service.externalLink) {
    return {
      stepLabel: SERVICE_FLOW_STEPS[2],
      barLabel: '다국어 진단센터 열기',
      // attribution을 그대로 넘긴다. 빈 객체를 넘기면 readAttribution() 폴백이 건너뛰어진다.
      href: attributedExternalUrl(service.externalLink.url, 'jm_main', attribution),
      external: true,
    };
  }
  return {
    stepLabel: '상담 전 확인 목록',
    barLabel: '확인 목록 보기',
    href: '#preparation-review',
    external: false,
  };
}
