import type { CheckDomain } from '../types/content';
import type { FunnelDomain } from '../lib/funnel';

export interface ServiceFaq { q: string; a: string }
export interface ServiceQuickCheck { label: string; value: string; note?: string }
export interface ServiceSource { label: string; url: string; checkedAt: string }
export interface ServiceLink { label: string; url: string }

export interface Service {
  slug: string;
  name: string;
  short: string;               // 홈 카드용 한 줄
  headline: string;            // 상세 페이지 제목
  target: string[];            // 이런 분께 필요합니다
  process: string[];           // 진행 절차
  deadlines?: string[];        // 법정 기한 (근거 조항 포함 문자열)
  documents: string[];         // 필요 서류 예시
  faqs: ServiceFaq[];
  quickChecks: ServiceQuickCheck[];
  officialSources: ServiceSource[];
  selfService: string[];
  professionalReview: string[];
  funnelDomain: FunnelDomain;
  consultTopic: string;
  relatedLinks?: ServiceLink[];
  checkDomain?: CheckDomain;   // 연결된 셀프 진단
  externalLink?: { label: string; url: string };  // 출입국 → 비자진단 사이트
  comingSoon?: { title: string; description: string };
}

export const services: Service[] = [
  {
    slug: 'dui',
    name: '음주운전 면허 구제',
    short: '면허 정지·취소 처분에 대한 이의신청·행정심판을 준비합니다.',
    headline: '음주운전 면허 정지·취소, 다툴 수 있는 기한이 정해져 있습니다',
    target: ['운전이 생계 수단인 분(화물·버스·택시·배달 등)', '면허 취소 통지를 받고 감경을 검토하는 분', '이의신청·행정심판 절차가 처음이라 막막한 분'],
    process: ['처분 통지서·적발 경위 확인', '감경 요건·배제 사유 검토', '생계·정상 참작 증빙 수집', '이의신청 또는 행정심판 청구서 작성·제출', '심리 대응과 결과 확인'],
    deadlines: ['이의신청: 처분 통지 후 60일 이내 (도로교통법 제94조)', '행정심판: 처분이 있음을 안 날부터 90일 이내 (행정심판법 제27조)'],
    documents: ['운전면허 취소·정지 결정통지서', '재직증명서·소득 증빙', '부양가족 증빙(가족관계증명서 등)', '표창·봉사활동 등 정상 참작 자료'],
    faqs: [
      { q: '벌금을 냈는데 면허 처분도 따로 다퉈야 하나요?', a: '네. 형사처벌(벌금)과 행정처분(면허)은 별개 절차입니다. 벌금 납부와 관계없이 면허 처분은 별도의 기한 안에 다퉈야 합니다.' },
      { q: '행정심판을 하면 결과가 나올 때까지 운전할 수 있나요?', a: '아닙니다. 청구만으로 처분 효력이 멈추지 않습니다. 사안에 따라 집행정지 신청을 함께 검토합니다(행정심판법 제30조).' },
      { q: '감경되면 어느 정도로 줄어드나요?', a: '취소 처분이 정지 처분으로 변경되는 사례도 있지만, 적용 기준과 결과는 위반 내용과 개별 사정에 따라 달라집니다. 구체적인 결과를 미리 단정할 수 없습니다.' },
    ],
    quickChecks: [
      { label: '받은 문서', value: '취소·정지 결정통지서', note: '사전통지서와 결정통지서는 대응 단계가 다릅니다.' },
      { label: '이의신청 기준', value: '처분을 받은 날부터 60일 이내', note: '도로교통법 제94조의 일반 기준입니다.' },
      { label: '행정심판 기준', value: '처분을 안 날부터 90일 이내', note: '처분일부터 180일 기준도 함께 확인합니다.' },
      { label: '핵심 자료', value: '운전 필요성·위반 경위·재발방지 자료' },
    ],
    officialSources: [
      { label: '도로교통법 제94조 — 운전면허 처분 이의신청', url: 'https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1000561335', checkedAt: '2026-07-25' },
      { label: '행정심판법 제27조 — 심판청구 기간', url: 'https://www.law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1018377597', checkedAt: '2026-07-25' },
    ],
    selfService: ['결정통지서의 처분일·수령일 표시', '운전이 필요한 이유와 소득·부양 자료 모으기', '재발방지 교육·실천 자료 정리'],
    professionalReview: ['감경 배제 사유와 적용 기준 대조', '이의신청·행정심판 중 적합한 절차 판단', '주장과 증거의 연결 및 집행정지 필요성 검토'],
    funnelDomain: 'dui',
    consultTopic: 'dui',
    checkDomain: 'dui',
  },
  {
    slug: 'suspension',
    name: '영업정지 · 행정심판',
    short: '영업정지·과징금 처분의 사전 의견제출부터 행정심판까지 대응합니다.',
    headline: '영업정지 통지, 받은 날부터 대응 시계가 돌아갑니다',
    target: ['영업정지 사전통지(의견제출 안내)를 받은 자영업자', '청소년 주류 제공 등으로 처분이 확정된 업주', '영업이 유일한 생계 수단이라 집행을 늦춰야 하는 분'],
    process: ['처분 사유·근거 법령 확인', '의견제출서 또는 행정심판 청구 준비', '소명 증거(CCTV·확인 기록 등) 정리', '집행정지 신청 검토', '심리 대응과 결과 확인'],
    deadlines: ['의견제출: 사전통지서에 기재된 기한 이내 (행정절차법 제27조)', '행정심판: 처분이 있음을 안 날부터 90일 이내 (행정심판법 제27조)'],
    documents: ['처분 사전통지서 또는 처분서', '영업신고증·사업자등록증', 'CCTV 영상, 신분증 확인 기록 등 소명 자료', '매출·생계 의존도 증빙'],
    faqs: [
      { q: '사전통지 단계인데 그냥 기다리면 안 되나요?', a: '의견제출 기간은 처분이 확정되기 전에 소명할 수 있는 사실상 유일한 기회입니다. 기간이 지나면 예정된 내용대로 처분되는 경우가 많습니다.' },
      { q: '영업정지 대신 과징금으로 바꿀 수 있다고 들었습니다.', a: '업종과 위반 유형에 따라 과징금 전환이 가능한 경우가 있습니다. 근거 법령마다 요건이 달라 개별 확인이 필요합니다.' },
      { q: '정지 기간에 영업하면 어떻게 되나요?', a: '정지 기간 중 영업은 허가 취소 등 훨씬 무거운 처분 사유가 됩니다. 반드시 집행정지 등 적법한 절차로 대응해야 합니다.' },
    ],
    quickChecks: [
      { label: '현재 단계', value: '사전통지 / 처분 확정', note: '의견제출과 행정심판은 준비 문서가 다릅니다.' },
      { label: '의견제출 기한', value: '사전통지서에 적힌 날까지' },
      { label: '행정심판 기준', value: '처분을 안 날부터 90일 이내' },
      { label: '긴급 검토', value: '영업 중단 전 집행정지 필요성' },
    ],
    officialSources: [
      { label: '행정절차법 제27조 — 의견제출', url: 'https://law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1016108513', checkedAt: '2026-07-25' },
      { label: '행정심판법 제27조 — 심판청구 기간', url: 'https://www.law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1018377597', checkedAt: '2026-07-25' },
    ],
    selfService: ['사전통지서·처분서와 봉투까지 보관', 'CCTV·신분 확인 기록·직원 진술 확보', '월 매출·임대료·직원 급여 등 영업중단 영향 정리'],
    professionalReview: ['업종별 개별 법령과 처분기준 확인', '고의·과실과 정상참작 사유의 구조화', '과징금 전환·집행정지·행정심판의 병행 순서 검토'],
    funnelDomain: 'suspension',
    consultTopic: 'suspension',
    checkDomain: 'suspension',
  },
  {
    slug: 'license',
    name: '인허가 대리',
    short: '법인 설립, 공장 등록, 각종 영업 인허가 신청을 대행합니다.',
    headline: '반려 사유를 없애고 신청하는 것이 가장 빠른 길입니다',
    target: ['비영리법인·사단법인 설립을 준비하는 분', '공장 등록, 창고·물류 등 시설 인허가가 필요한 사업자', '서류 미비로 반려를 경험한 신청인'],
    process: ['요건·입지·결격 사유 사전 검토', '필요 서류 목록 확정과 수집', '신청서 작성·제출 대리', '보완 요구 대응', '허가증 수령 확인'],
    documents: ['사업계획서', '정관·임원 명부(법인)', '시설·입지 관련 증빙', '자격·경력 증빙'],
    faqs: [
      { q: '혼자 신청했다가 반려됐습니다. 다시 하면 되나요?', a: '재신청은 가능하지만 같은 사유로 다시 반려되면 시간만 잃습니다. 반려 사유를 정확히 해소한 뒤 신청하는 것이 중요합니다.' },
      { q: '인허가에 얼마나 걸리나요?', a: '법정 처리기간은 인허가 종류마다 다르고, 보완 요구가 있으면 늘어납니다. 사전 검토로 보완 가능성을 줄이는 것이 가장 효과적입니다.' },
    ],
    quickChecks: [
      { label: '허가 종류', value: '등록·허가·인가·신고 중 구분' },
      { label: '관할 기관', value: '사업장 소재지와 업무별 담당청 확인' },
      { label: '사전 요건', value: '입지·시설·인력·자본 기준' },
      { label: '반려 이력', value: '보완 요구와 반려 사유 원문' },
    ],
    officialSources: [
      { label: '정부24 — 민원 서비스·구비서류 조회', url: 'https://www.gov.kr/portal/main', checkedAt: '2026-07-25' },
      { label: '국가법령정보센터 — 현행 법령 조회', url: 'https://www.law.go.kr', checkedAt: '2026-07-25' },
    ],
    selfService: ['하려는 사업과 시설 위치를 한 문장으로 정리', '임대차계약서·건축물대장·도면 등 입지 자료 확보', '관할 기관에서 받은 보완·반려 문서 보관'],
    professionalReview: ['인허가 명칭과 근거 법령·관할 기관 특정', '입지·결격·시설 기준의 선행 검토', '사업계획서와 증빙의 정합성 및 보완 대응'],
    funnelDomain: 'permit',
    consultTopic: 'permit',
  },
  {
    slug: 'immigration',
    name: '출입국 · 비자',
    short: '외국인 비자 발급·연장과 체류 자격 변경에 필요한 요건과 서류를 확인합니다.',
    headline: '비자 문제는 체류 목적과 자격 요건부터 확인해야 합니다',
    target: ['비자 발급·연장·변경을 준비하는 외국인', '외국인 직원을 고용하려는 사업주', '결혼이민·영주·국적을 준비하는 가족'],
    process: ['체류 목적과 현재 자격 확인', '자격별 요건·서류 확인', '신청·변경 절차 준비'],
    documents: ['여권·외국인등록증', '체류 자격별 요건 서류'],
    faqs: [
      { q: '비자 사전 확인은 어디에서 하나요?', a: '정명 비자 진단센터에서 비자별 일반 정보와 준비·공식 확인 항목을 확인할 수 있습니다. 개별 상담 접수는 개업 후 시작됩니다.' },
    ],
    quickChecks: [
      { label: '현재 자격', value: '체류자격·만료일·체류 상태' },
      { label: '희망 목적', value: '취업·유학·결혼·영주 등' },
      { label: '신청 유형', value: '사증발급 / 체류자격 변경·연장' },
      { label: '공식 확인', value: '하이코리아·비자포털 최신 공지' },
    ],
    officialSources: [
      { label: '하이코리아 — 체류민원·최신 공지', url: 'https://www.hikorea.go.kr', checkedAt: '2026-07-25' },
      { label: '대한민국 비자포털 — 사증 안내', url: 'https://www.visa.go.kr', checkedAt: '2026-07-25' },
    ],
    selfService: ['여권·외국인등록증의 표기 내용과 만료일 확인', '입국·체류 목적과 예정 활동 정리', '고용계약·학력·가족관계 등 기본 증빙 확보'],
    professionalReview: ['현재 자격에서 변경 가능한 체류자격 판단', '직종·소득·학력·고용주 요건의 최신 기준 대조', '보완 가능성과 신청 시점·관할 출입국기관 검토'],
    funnelDomain: 'visa',
    consultTopic: 'visa',
    relatedLinks: [
      { label: 'E-7 전문인력', url: 'https://jm-visa-precheck.vercel.app/visa/e7' },
      { label: 'F-6 결혼이민', url: 'https://jm-visa-precheck.vercel.app/visa/f6' },
      { label: 'D-2 유학', url: 'https://jm-visa-precheck.vercel.app/visa/d2' },
      { label: 'D-10 구직', url: 'https://jm-visa-precheck.vercel.app/visa/d10' },
      { label: 'F-2-7 거주', url: 'https://jm-visa-precheck.vercel.app/visa/f27' },
      { label: 'F-5 영주', url: 'https://jm-visa-precheck.vercel.app/visa/f5' },
    ],
    externalLink: {
      label: '정명 비자 진단센터 열기',
      url: 'https://jm-visa-precheck.vercel.app',
    },
  },
  {
    slug: 'veterans',
    name: '국가보훈 등록',
    short: '국가유공자·보훈보상대상자 등록 신청과 비해당 결정 불복을 돕습니다.',
    headline: '국가를 위한 헌신, 기록으로 입증해야 인정받습니다',
    target: ['군 복무 중 다치거나 병을 얻은 본인·가족', '비해당 결정을 받고 재심의·행정심판을 검토하는 분', '오래된 기록 때문에 입증이 막막한 유족'],
    process: ['신청 유형(국가유공자/보훈보상대상자) 판단', '병상일지·의무기록 등 입증 자료 확보', '공무 관련성 입증 논리 구성', '등록 신청 또는 불복 절차 진행', '심의 결과 확인·후속 대응'],
    deadlines: ['비해당 결정 불복 행정심판: 결정을 안 날부터 90일 이내 (행정심판법 제27조)'],
    documents: ['병적증명서·전역증', '병상일지, 군 병원 진료기록', '민간 병원 진료기록·장애 진단서', '사고 경위 확인 자료(동료 진술 등)'],
    faqs: [
      { q: '수십 년 전 일인데 지금도 신청할 수 있나요?', a: '등록 신청 자체에는 기한이 없습니다. 다만 오래될수록 기록 확보가 어려워지므로 가능한 자료부터 빨리 확보하는 것이 중요합니다.' },
      { q: '한 번 기각됐으면 끝인가요?', a: '아닙니다. 기각 사유를 분석해 새로운 입증 자료를 보완하면 재신청·재심의·행정심판 등 후속 절차를 검토할 수 있습니다.' },
    ],
    quickChecks: [
      { label: '신청 유형', value: '본인 등록 / 유족·가족 등록 / 비해당 불복' },
      { label: '핵심 쟁점', value: '직무·교육훈련과 상이·질병의 관련성' },
      { label: '기본 자료', value: '병적·복무·의무·민간 진료기록' },
      { label: '불복 기한', value: '결정을 안 날부터 90일 일반 기준' },
    ],
    officialSources: [
      { label: '국가보훈부 — 국가유공자 및 가족 등록신청', url: 'https://mpva.go.kr/mpva/contents.do?key=106', checkedAt: '2026-07-25' },
      { label: '국가유공자법 제6조 — 등록 및 결정', url: 'https://www.law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1027778575', checkedAt: '2026-07-25' },
    ],
    selfService: ['병적증명서·전역증과 현재 보유 기록 목록 만들기', '사고·발병 시점과 치료 경과를 시간순으로 정리', '동료·지휘관 등 사실을 아는 사람과 당시 자료 확인'],
    professionalReview: ['국가유공자·보훈보상대상자 해당 가능성 구분', '공무 관련성을 뒷받침하는 기록 공백 분석', '비해당 사유에 맞춘 보완·재신청·불복 경로 검토'],
    funnelDomain: 'veterans',
    consultTopic: 'veterans',
    checkDomain: 'veterans',
  },
  {
    slug: 'documents',
    name: '토지보상 · 내용증명 · 계약서',
    short: '수용 보상 협의, 내용증명 작성, 계약서 검토로 권리를 지킵니다.',
    headline: '문서로 남기지 않은 권리는 지키기 어렵습니다',
    target: ['공익사업으로 토지·건물 수용을 앞둔 소유자', '임대차·용역 분쟁에서 의사 표시를 남겨야 하는 분', '계약 체결 전 위험 조항을 확인하고 싶은 분'],
    process: ['사실관계·서류 검토', '문서 초안 작성', '검토·수정 협의', '발송·제출 및 후속 안내'],
    documents: ['등기부등본·토지대장(보상)', '기존 계약서·거래 증빙', '상대방과 주고받은 자료'],
    faqs: [
      { q: '내용증명을 보내면 법적 효력이 생기나요?', a: '내용증명 자체가 의무를 강제하지는 않습니다. 다만 의사 표시의 내용과 시점을 공적으로 증명해 이후 분쟁에서 중요한 증거가 됩니다.' },
      { q: '보상금이 적은 것 같은데 그냥 받아야 하나요?', a: '협의에 응하기 전 감정평가 내용을 검토하고, 이의신청·수용재결 등 단계별 불복 절차를 확인할 수 있습니다.' },
    ],
    quickChecks: [
      { label: '업무 유형', value: '토지보상 / 내용증명 / 계약서' },
      { label: '현재 단계', value: '협의·재결·이의 / 발송 전·후 / 체결 전·후' },
      { label: '상대 문서', value: '보상 안내·계약서·대화·거래 증빙' },
      { label: '원하는 결과', value: '금액 검토·의사표시·위험 조항 수정' },
    ],
    officialSources: [
      { label: '토지보상법 — 협의·수용·손실보상 기준', url: 'https://www.law.go.kr/LSW/LsiJoLinkP.do?docType=JO&joNo=009100000&languageType=KO&lsNm=%EA%B3%B5%EC%9D%B5%EC%82%AC%EC%97%85%EC%9D%84+%EC%9C%84%ED%95%9C+%ED%86%A0%EC%A7%80+%EB%93%B1%EC%9D%98+%EC%B7%A8%EB%93%9D+%EB%B0%8F+%EB%B3%B4%EC%83%81%EC%97%90+%EA%B4%80%ED%95%9C+%EB%B2%95%EB%A5%A0&paras=1', checkedAt: '2026-07-25' },
      { label: '인터넷우체국 — 내용증명 서비스', url: 'https://www.epost.go.kr', checkedAt: '2026-07-25' },
    ],
    selfService: ['문서와 거래 내역을 날짜순으로 정리', '상대방에게 요구할 내용과 기한을 명확히 적기', '원본·사본·송수신 기록을 함께 보관'],
    professionalReview: ['보상 단계와 불복 가능 절차·기한 구분', '내용증명의 사실·요구·기한 표현과 증거 연결', '계약 조항의 책임·해지·대금·분쟁 위험 검토'],
    funnelDomain: 'documents',
    consultTopic: 'land',
  },
];

export function findService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
