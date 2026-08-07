// 비자 진단 사이트(`행정사 비자진단 홈페이지/src/pages/VisaDetailPage.tsx`의 flowSteps)와
// 같은 표현을 쓴다. 두 사이트를 오가는 방문자가 같은 단계 이름을 보게 하기 위한 것이므로
// 한쪽을 고치면 다른 쪽도 함께 고쳐야 한다. serviceFlowSteps.test.tsx가 문구를 고정한다.
export const SERVICE_FLOW_STEPS = ['설명', '요건·서류 조회', '내 상황 진단', '상담 준비'] as const;

export const FLOW_STEP_INTRO =
  '필요한 단계만 선택할 수 있습니다. 기한이 급하면 진단을 건너뛰고 상담 준비로 바로 이동하세요.';

export const VISA_EXTERNAL_NOTE = '3단계는 다국어 진단센터로 이동합니다.';
