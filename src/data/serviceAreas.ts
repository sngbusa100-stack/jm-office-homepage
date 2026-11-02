import { findService, services, type Service } from './services';

export interface ServiceArea {
  id: string;
  name: string;
  short: string;
  /** 이 분야에 속한 업무 상세 페이지(services.ts slug). 비어 있으면 상세 안내가 아직 없다 */
  serviceSlugs: string[];
}

/**
 * 명함의 업무분야 5개(2026-11-02 주인님 지시: "업무범위 5개로 합쳐").
 * 기존 업무 상세 페이지 6개의 주소(/services/:slug)·상담 분야·유입 통계 코드는 그대로 두고 위에서 묶기만 한다.
 * 검색에 이미 등록된 주소와 접수→로컬 연동이 깨지지 않게 하기 위해서다.
 * 공공조달·기업인증은 상세 페이지와 상담 분야가 아직 없다(상담 분야 추가는 접수 계약·로컬 연동을 함께 바꿔야 함).
 */
export const serviceAreas: ServiceArea[] = [
  {
    id: 'permit',
    name: '인허가 · 등록 · 변경',
    short: '비영리법인 설립 허가, 공장 등록, 각종 영업 인허가의 신청과 변경을 대행합니다.',
    serviceSlugs: ['license'],
  },
  {
    id: 'visa',
    name: '출입국 · 비자',
    short: '외국인 비자 발급·연장과 체류 자격 변경에 필요한 요건과 서류를 확인하고 준비합니다.',
    serviceSlugs: ['immigration'],
  },
  {
    id: 'land',
    name: '토지개발 · 보상',
    short: '개발행위허가 등 토지개발 인허가와, 토지보상 단계의 의견서·이의신청서 작성·제출을 돕습니다.',
    serviceSlugs: ['documents'],
  },
  {
    id: 'remedy',
    name: '행정심판 · 권리구제',
    short: '영업정지·운전면허 처분, 국가보훈 등록과 비해당 결정에 대한 의견제출서·이의신청서·행정심판 청구서 작성과 제출을 돕습니다.',
    serviceSlugs: ['suspension', 'dui', 'veterans'],
  },
  {
    id: 'procurement',
    name: '공공조달 · 기업인증',
    short: '공공조달 참여에 필요한 등록·확인과 기업 인증 신청 서류의 작성·제출을 돕습니다.',
    serviceSlugs: [],
  },
];

export function areaServices(area: ServiceArea): Service[] {
  return area.serviceSlugs.map((slug) => {
    const service = findService(slug);
    if (!service) throw new Error(`업무 분야 ${area.id}에 없는 업무 페이지: ${slug}`);
    return service;
  });
}

export function findAreaOfService(slug: string): ServiceArea | undefined {
  return serviceAreas.find((area) => area.serviceSlugs.includes(slug));
}

/** 모든 업무 상세 페이지가 정확히 한 분야에 속하는지(테스트에서 확인) */
export function unassignedServices(): string[] {
  return services.map((s) => s.slug).filter((slug) => !findAreaOfService(slug));
}
