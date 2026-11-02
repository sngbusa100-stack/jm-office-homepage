import { checks, findCheck } from '../data/checks';
import { findService, services } from '../data/services';
import { SLOGAN } from '../data/profile';

export const SITE_URL = 'https://jungmyungoffice.com';

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  robots: 'index, follow' | 'noindex, nofollow';
}

// 업무분야는 명함 5개(src/data/serviceAreas.ts). 셸 index.html의 description·og·JSON-LD도 DEFAULT_DESCRIPTION과 같아야 한다(seo.test).
export const DEFAULT_DESCRIPTION = '광명KTX역 5번출구 앞 정명 행정사사무소. 인허가·등록·변경, 출입국·비자, 토지개발·보상, 행정심판·권리구제, 공공조달·기업인증 업무 안내와 셀프 진단.';
const HOME_DESCRIPTION = '광명KTX역 5번출구 앞 정명 행정사사무소(대표 행정사 정재훈). 인허가·등록·변경, 출입국·비자, 토지개발·보상, 행정심판·권리구제, 공공조달·기업인증 업무 안내와 셀프 진단.';
// 홈 제목에 지역명을 넣는다 — 네이버 '정명' 검색에 다른 지역 정명 행정사가 함께 나와 구분이 필요하다(2026-11-02 조회).
export const HOME_TITLE = `정명 행정사사무소 | 광명KTX역 앞 행정사 — ${SLOGAN}`;

const STATIC_META: Record<string, Pick<PageMeta, 'title' | 'description'>> = {
  '/': {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
  '/about': {
    title: '사무소 소개 | 정명 행정사사무소',
    description: '광명KTX역 5번출구 앞 정명 행정사사무소 대표 행정사 정재훈의 인사말과 약속. 변호사 사무실과 같은 공간에서 행정 절차를 맡습니다.',
  },
  '/why': {
    title: '행정사가 필요한 이유 | 정명 행정사사무소',
    description: '행정사가 수행하는 업무와 변호사·법무사의 역할 차이, 행정 절차에서 전문가의 도움이 필요한 때를 안내합니다.',
  },
  '/services': {
    title: '업무 분야 | 정명 행정사사무소',
    description: '인허가·등록·변경, 출입국·비자, 토지개발·보상, 행정심판·권리구제, 공공조달·기업인증 — 정명 행정사사무소의 다섯 가지 업무 분야를 확인하세요.',
  },
  '/check': {
    title: '3분 셀프 진단 | 정명 행정사사무소',
    description: '인허가 신청, 영업정지 처분, 음주운전 면허, 국가유공자 등록에 관해 지금 확인할 사항과 준비 서류를 정리합니다. 외국인 비자는 5개 언어 비자 진단으로 안내합니다.',
  },
  '/consult': {
    title: '상담 안내 | 정명 행정사사무소',
    description: '정명 행정사사무소의 상담 채널과 온라인 상담 신청 절차를 안내합니다.',
  },
  '/privacy': {
    title: '개인정보처리방침 | 정명 행정사사무소',
    description: '정명 행정사사무소 홈페이지의 개인정보 수집·이용과 셀프 진단 데이터 보관 방식을 안내합니다.',
  },
  '/disclaimer': {
    title: '면책 고지 | 정명 행정사사무소',
    description: '홈페이지 정보와 셀프 진단의 이용 범위, 법령 확인 및 긴급 사안에 관한 안내입니다.',
  },
  '/location': {
    title: '오시는 길 | 정명 행정사사무소',
    description: '광명KTX역 5번출구 앞 광명역자이타워에 있는 정명 행정사사무소의 주소, 지도, 상담 시간, 주차, 연락처를 안내합니다.',
  },
};

function buildMeta(
  pathname: string,
  data: Pick<PageMeta, 'title' | 'description'>,
  robots: PageMeta['robots'] = 'index, follow',
): PageMeta {
  const normalized = pathname === '/' ? '' : pathname.replace(/\/$/, '');
  return { ...data, canonical: `${SITE_URL}${normalized}`, robots };
}

export function getPageMeta(pathname: string): PageMeta {
  const normalized = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  if (normalized === '/admin') {
    return buildMeta(normalized, {
      title: '접수 관리 | 정명 행정사사무소',
      description: '사무소 내부용 접수 관리 화면입니다.',
    }, 'noindex, nofollow');
  }
  const exact = STATIC_META[normalized];
  if (exact) return buildMeta(normalized, exact);

  const serviceMatch = normalized.match(/^\/services\/([^/]+)$/);
  if (serviceMatch) {
    const service = findService(serviceMatch[1]);
    if (service) {
      return buildMeta(normalized, {
        title: `${service.name} | 정명 행정사사무소`,
        description: service.short,
      });
    }
  }

  const resultMatch = normalized.match(/^\/check\/([^/]+)\/result$/);
  if (resultMatch) {
    const definition = findCheck(resultMatch[1]);
    if (definition) {
      return buildMeta(normalized, {
        title: `${definition.title} 결과 | 정명 행정사사무소`,
        description: '브라우저에 저장된 답변을 바탕으로 정리한 개인 셀프 진단 결과입니다.',
      }, 'noindex, nofollow');
    }
  }

  const checkMatch = normalized.match(/^\/check\/([^/]+)$/);
  if (checkMatch) {
    const definition = findCheck(checkMatch[1]);
    if (definition) {
      return buildMeta(normalized, {
        title: `${definition.title} | 정명 행정사사무소`,
        description: definition.intro,
      });
    }
  }

  return buildMeta(normalized, {
    title: '페이지를 찾을 수 없습니다 | 정명 행정사사무소',
    description: DEFAULT_DESCRIPTION,
  }, 'noindex, nofollow');
}

/** 검색엔진에 색인시킬 경로. 사전 렌더링·sitemap·vercel.json 검사가 모두 이 목록을 쓴다. */
export function getIndexablePaths(): string[] {
  return [
    ...Object.keys(STATIC_META),
    ...services.map((service) => `/services/${service.slug}`),
    ...Object.keys(checks).map((domain) => `/check/${domain}`),
  ];
}

export function buildSitemapXml(paths: string[] = getIndexablePaths()): string {
  const urls = paths
    .map((path) => `  <url><loc>${getPageMeta(path).canonical}</loc></url>`)
    .join('\n');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');
}
