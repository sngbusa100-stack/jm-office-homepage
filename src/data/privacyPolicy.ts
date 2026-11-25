// 개인정보처리방침의 시행일·변경 이력·국외 이전 표.
// 시행일은 배포일로 정한다(2026-10-19 주인님 결정). 배포 당일 이 값과 api/_store.mjs의
// CONSENT_VERSION을 함께 배포일로 바꾼다 — 두 값이 다르면 privacyPolicy·visaIntake.sync 테스트가 실패한다.

// 2026-10-21: 상담 화면 기한 질문 추가로 수집 항목·파기 방법이 바뀌었다. 지금 값은 임시이고, 배포 당일 배포일로 바꾼다.
// 2026-11-15: 주인님 결정으로 이날 공개·상담 접수 개시. 사무소 전화·이메일·방문 상담, 요구 처리·파기 기록, 국내 위탁(네이버 메일)을 더했다.
// 2026-11-19: 카카오톡 채널 상담을 열어 상담 경로와 국내 위탁(주식회사 카카오)을 더했다.
// 2026-11-20: 가상 사건 실연(F9)을 마쳐 위임 업무에서 받는 서류·고유식별정보·보유 기간·법정 보존·파기 방법·안전조치를 더했다.
export const PRIVACY_EFFECTIVE_DATE = '2026-11-25';

export const PRIVACY_HISTORY = [
  { date: '2026-11-25', note: '온라인 신청에 동의하지 않을 때의 상담 경로를 카카오톡 채널로 안내' },
  { date: '2026-11-24', note: '홈페이지 접수 저장 장애 알림에서 고객 정보 제외' },
  { date: '2026-11-20', note: '위임 업무 추가 — 맡기신 뒤 받는 서류, 고유식별·민감정보 처리, 보유 기간·법정 보존, 파기 방법·안전조치, 카카오톡 채널 대화 보관(서류는 이메일로)' },
  { date: '2026-11-19', note: '이전 방침(카카오톡 채널 상담 추가 — 상담 경로와 국내 처리 위탁(주식회사 카카오))' },
  { date: '2026-11-15', note: '이전 방침(상담 접수 개시 — 사무소 전화·이메일·방문 상담, 요구 처리·파기 기록, 국내 처리 위탁, 연락 버튼 누름 통계 추가)' },
  { date: '2026-10-21', note: '이전 방침(상담 화면 기한 질문 추가)' },
  { date: '2026-10-19', note: '이전 방침(법정 기재사항·국외 이전 표 정비)' },
  { date: '2026-07-19', note: '이전 방침(상담 접수·국외 이전 고지)' },
];

export interface OverseasTransfer {
  recipient: string;
  contact: string;
  country: string;
  items: string;
  when: string;
  purpose: string;
  retention: string;
}

/**
 * 처리위탁·보관에 따른 국외 이전(개인정보 보호법 제28조의8제1항제3호, 같은 조 제2항 각 호).
 * 이전받는 자의 법인명·연락처는 각 사의 개인정보처리방침·약관에서 확인했다(확인일 PRIVACY_SOURCES_CHECKED_AT).
 */
export const OVERSEAS_TRANSFERS: OverseasTransfer[] = [
  {
    recipient: 'Vercel Inc.',
    contact: 'privacy@vercel.com',
    country: '미국',
    items: '상담 신청 때 입력하신 항목과 자동 생성 항목 전체(접수 서버를 거쳐 저장소로 전달), 서버 접속 기록',
    when: '상담 신청을 제출하는 즉시, 암호화된 연결(HTTPS)로 전송',
    purpose: '웹사이트와 접수 서버 운영',
    retention: '접수 내용은 저장소로 전달만 하고 따로 보관하지 않음. 접속 기록은 Vercel의 보관 기준에 따름',
  },
  {
    recipient: 'Upstash, Inc.',
    contact: 'support@upstash.com',
    country: '미국',
    items: '상담 접수 기록 전체, 요청 남용 방지용 IP 해시값, 이용 단계 통계 합계(개인정보 아님)',
    when: '상담 신청을 제출하는 즉시, 암호화된 연결(HTTPS)로 전송',
    purpose: '접수 데이터 보관과 요청 남용 방지',
    retention: '아래 보관·파기 기준(처리 완료 후 120일)까지. IP 해시값은 60초(관리자 로그인 실패 제한은 5분)',
  },
  {
    recipient: 'Telegram Messenger Inc.',
    contact: '공개 이메일 없음 — telegram.org 안내와 앱 안의 문의 메뉴',
    country: 'Telegram이 서버 소재국을 공개하지 않음(여러 국가의 데이터센터를 쓴다고만 밝힘)',
    items: '평상시 접수번호와 기한 긴급 표시. 접수 저장 장애 때는 장애 사실과 확인번호',
    when: '접수 직후, 메신저 API로 암호화된 연결(HTTPS)을 통해 사무소 업무용 대화방에 전송',
    purpose: '사무소에 접수 또는 저장 장애 알림',
    retention: 'Telegram 서비스의 메시지 보관 기준에 따름',
  },
];

export const PRIVACY_SOURCES_CHECKED_AT = '2026-10-19';

export const PRIVACY_SOURCES = [
  { label: 'Vercel 개인정보처리방침', url: 'https://vercel.com/legal/privacy-policy' },
  { label: 'Upstash 개인정보처리방침', url: 'https://upstash.com/trust/privacy' },
  { label: 'Telegram 봇 개발자 약관(계약 상대방 Telegram Messenger Inc.)', url: 'https://telegram.org/tos/bot-developers' },
  { label: 'Telegram 개인정보처리방침', url: 'https://telegram.org/privacy' },
];
