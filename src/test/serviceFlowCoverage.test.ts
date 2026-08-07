import { services } from '../data/services';
import { checks } from '../data/checks';

describe('업무분야 → 진단 경로 커버리지', () => {
  it('모든 분야가 내부 진단 · 외부 진단 · 확인 목록 중 하나를 갖는다', () => {
    for (const service of services) {
      const hasPath = Boolean(service.checkDomain) || Boolean(service.externalLink) || service.selfService.length > 0;
      expect(hasPath, `${service.slug}에 3단계 경로가 없음`).toBe(true);
    }
  });

  it('checkDomain은 실제 존재하는 진단을 가리킨다', () => {
    for (const service of services) {
      if (!service.checkDomain) continue;
      expect(checks[service.checkDomain], `${service.slug}의 진단 정의 없음`).toBeDefined();
    }
  });

  it('인허가 분야는 permit 진단에 연결된다', () => {
    const license = services.find((s) => s.slug === 'license');
    expect(license?.checkDomain).toBe('permit');
  });

  it('출입국 비자 분야는 외부 진단센터로 연결된다', () => {
    const immigration = services.find((s) => s.slug === 'immigration');
    expect(immigration?.checkDomain).toBeUndefined();
    expect(immigration?.externalLink?.url).toContain('jm-visa-precheck');
  });
});
