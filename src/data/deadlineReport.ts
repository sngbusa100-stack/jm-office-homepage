// 상담 화면 '처분서·통지서 기한' 자가 응답과 긴급 근거 라벨.
// 연동 계약(api/_inquiry-contract.json)의 deadlineReportLabels·urgentReasonLabels를 이 파일에서 만든다.
// 값 목록이 서버 api/_urgency.mjs(DEADLINE_REPORTS·URGENT_REASONS)와 같은지는 src/test/inquiryContract.test.ts가 확인한다.
// 라벨을 바꾸면 npm run contract:inquiry로 계약을 다시 만든다(로컬 sync는 홈페이지 배포 뒤).

export type DeadlineReport = 'soon' | 'later' | 'unknown' | 'none';
export type UrgentReason = 'diagnosis' | 'visaIntake' | 'visaDiagnosis' | 'selfReported';

/** 화면에서는 뒤에 '(선택)'을 붙인다. */
export const DEADLINE_REPORT_QUESTION = '받으신 처분서·통지서에 적힌 기한이 있나요?';

export const DEADLINE_REPORT_OPTIONS: { value: DeadlineReport; label: string }[] = [
  { value: 'soon', label: '2주 안이거나 이미 지났습니다' },
  { value: 'later', label: '있지만 2주 넘게 남았습니다' },
  { value: 'unknown', label: '기한이 있는지, 언제인지 모릅니다' },
  { value: 'none', label: '받은 통지서가 없습니다' },
];

/** /admin 배지 설명과 로컬 대기함 표시에 쓰는 긴급 근거 이름. */
export const URGENT_REASON_LABELS: Record<UrgentReason, string> = {
  diagnosis: '셀프 진단',
  visaIntake: '비자 접수 답변',
  visaDiagnosis: '비자 사전진단',
  selfReported: '고객 직접 선택',
};
