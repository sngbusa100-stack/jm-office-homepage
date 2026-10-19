import { office } from './office';

/** 명함·블로그 썸네일과 같은 슬로건. 정·명 두 글자를 강조해 상호와 잇는다. */
export const SLOGAN = '복잡한 행정절차를 정확하고 명쾌하게';

export interface ProfilePromise {
  mark?: string;   // 금색으로 강조할 첫 글자(정·명)
  rest: string;
  detail: string;
}

export interface Profile {
  name: string | null;
  role: string;
  nameEn: string;
  photo: { src: string; alt: string } | null;
  education: string[];
  career: string[];
  lawPartner: { firm: string; lawyer: string } | null;
  intro: { lead: string; body: string };
  greeting: string[];
  promises: ProfilePromise[];
}

/**
 * 대표 행정사 소개. 학력·경력·사진은 주인님이 확인한 사실만 넣고 지어내지 않는다.
 * - education·career: 2026-10-16 주인님 확인 항목만 (석사과정은 재학 중이라 "석사과정"으로만 표기)
 * - photo: 사진을 받으면 public/images에 두고 경로를 넣는다. null이면 사무소 엠블럼으로 대체
 * - lawPartner: 명함 뒷면 "법률 업무제휴 | DHL 법률사무소(변호사 이동호)"와 같은 표기
 */
export const profile: Profile = {
  name: office.representative ?? null,
  role: '대표 행정사',
  nameEn: 'JUNG JAE HOON',
  photo: null,
  education: ['중앙대학교 행정대학원 석사과정'],
  career: ['DHL 법률사무소 고문'],
  lawPartner: { firm: 'DHL 법률사무소', lawyer: '변호사 이동호' },
  // 첫 화면 슬로건 아래 소개. 결과가 아니라 태도(경청·확인·끝까지 최선)를 약속한다.
  intro: {
    lead: '서류 한 장에도 의뢰인의 생업과 생활이 걸려 있습니다.',
    body: '내 일처럼 귀 기울여 듣고, 근거 법령과 기한부터 꼼꼼히 확인해 맡겨 주신 일에 끝까지 최선을 다하겠습니다.',
  },
  greeting: [
    '행정 절차는 서류 몇 장처럼 보이지만, 실제로는 요건과 기한, 그리고 입증의 문제입니다. 같은 사안이라도 무엇을 먼저 확인하고 어떤 자료로 설명하느냐에 따라 진행이 달라지기에, 한 건 한 건을 가볍게 넘기지 않겠습니다.',
    '사무소 이름 정명(正明)처럼, 근거 법령과 기한은 정확하게 확인하고 지금 해야 할 일은 명쾌하게 설명드리겠습니다.',
    '결과를 미리 장담하기보다 가능한 길과 준비할 것을 솔직하게 말씀드리고, 맡겨 주신 일은 처음부터 끝까지 최선을 다해 챙기겠습니다.',
  ],
  promises: [
    {
      mark: '정',
      rest: '확하게',
      detail: '근거 법령과 기한부터 확인합니다. 확인되지 않은 내용을 확인된 것처럼 말씀드리지 않습니다.',
    },
    {
      mark: '명',
      rest: '쾌하게',
      detail: '지금 해야 할 일과 준비할 서류를 쉬운 말로 정리합니다. 착수 전에 업무 범위와 비용을 서면으로 안내합니다.',
    },
    {
      rest: '법률의 시선까지',
      detail: '행정절차 중 법률 쟁점이 생기면, 필요 시 같은 공간의 변호사와 신속히 협의합니다. 행정사 업무 범위를 벗어나는 사안은 먼저 그 사실을 알려드립니다.',
    },
  ],
};
