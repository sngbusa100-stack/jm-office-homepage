import { findCheck } from '../data/checks';
import { findService } from '../data/services';

export const SITE_URL = 'https://jm-office-homepage.vercel.app';

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  robots: 'index, follow' | 'noindex, nofollow';
}

const DEFAULT_DESCRIPTION = '정명 행정사사무소의 음주운전 면허 구제, 영업정지 행정심판, 인허가, 국가보훈 업무 안내와 셀프 진단.';

const STATIC_META: Record<string, Pick<PageMeta, 'title' | 'description'>> = {
  '/': {
    title: '정명 행정사사무소 | 정확함으로 길을 밝히다',
    description: DEFAULT_DESCRIPTION,
  },
  '/why': {
    title: '행정사가 필요한 이유 | 정명 행정사사무소',
    description: '행정사가 수행하는 업무와 변호사·법무사의 역할 차이, 행정 절차에서 전문가의 도움이 필요한 때를 안내합니다.',
  },
  '/services': {
    title: '업무 분야 | 정명 행정사사무소',
    description: '음주운전 면허 구제, 영업정지 행정심판, 인허가, 출입국·비자, 국가보훈, 토지보상 관련 업무를 확인하세요.',
  },
  '/check': {
    title: '3분 셀프 진단 | 정명 행정사사무소',
    description: '음주운전 면허, 영업정지 처분, 국가유공자 등록에 관해 지금 확인할 사항과 준비 서류를 정리합니다.',
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
