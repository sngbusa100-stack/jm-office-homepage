import { nextStepFor } from '../lib/serviceNextStep';
import { findService } from '../data/services';

describe('분야별 다음 단계', () => {
  it('내부 진단이 있으면 진단 경로를 가리킨다', () => {
    const step = nextStepFor(findService('dui')!, {});
    expect(step.href).toBe('/check/dui');
    expect(step.external).toBe(false);
    expect(step.barLabel).toBe('내 상황 진단 시작');
  });

  it('인허가도 진단 경로를 가리킨다', () => {
    expect(nextStepFor(findService('license')!, {}).href).toBe('/check/permit');
  });

  it('비자는 외부 진단센터를 가리킨다', () => {
    const step = nextStepFor(findService('immigration')!, {});
    expect(step.external).toBe(true);
    expect(step.href).toContain('visa.jungmyungoffice.com');
    expect(step.barLabel).toBe('다국어 진단센터 열기');
  });

  it('토지 분야는 맞춤 진단으로 연결한다', () => {
    const step = nextStepFor(findService('documents')!, {});
    expect(step.href).toBe('/check/land');
    expect(step.stepLabel).toBe('내 상황 진단');
  });
});
