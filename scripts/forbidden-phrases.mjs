// 사이트 문구 금지어 — 소스 검사(src/test/forbiddenPhrases.test.ts)와 빌드 산출물 검사(scripts/verify-dist.mjs)가 같이 쓴다.
// 근거: 행정사법 제22조 제4호(연고 선전)·제5호(오도·오해 광고), 표시광고법 제3조①.
// 일상 표현이 걸리지 않게 단어가 아니라 문구 단위로 넣는다('1층 로비', '청탁금지법', '사전관리'는 통과해야 한다).

export const FORBIDDEN_PHRASES = [
  // 결과 보장·과장
  '100%', '１００％', '보장합니다', '보장해', '확실히 구제', '무조건', '성공률',
  '반드시 구제', '전액 환불', '한 번에 통과', '반려 없이 한 번에',
  // 기한을 단정하는 공포 문구
  '기한이 지나면 다툴 수 없습니다', '다툴 방법 자체가 사라집니다',
  // 행정심판 청구 대리는 행정사 업무(행정사법 제2조①)가 아니다(행정심판법 제18조①)
  '심리 대응', '행정심판까지 대응',
  // 연고·영향력 선전(행정사법 제22조 제4호)
  '인맥', '전관예우', '전관 출신', '연고를', '청탁해', '로비해',
];

const REVIEW_PATTERN = /OO\s*님|★{3,}/;

/** 문자열에서 발견된 금지어 목록. 가상 후기 형식은 '후기 오인 형식'으로 보고한다. */
export function findForbidden(text) {
  const found = FORBIDDEN_PHRASES.filter((phrase) => text.includes(phrase));
  if (REVIEW_PATTERN.test(text)) found.push('후기 오인 형식');
  return found;
}

/**
 * 빌드된 HTML에서 방문자와 검색엔진에 보이는 글만 남긴다.
 * 남기는 것: 본문 글, title, meta content, alt·title·aria-label 속성, JSON-LD.
 * 빼는 것: 주석, CSS, 일반 스크립트, 그 밖의 태그 속성(style의 width:100% 같은 값이 걸리지 않게).
 */
export function htmlToCheckedText(html) {
  const cleaned = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script\b(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/gi, ' ');
  const attributes = [...cleaned.matchAll(/\s(?:content|alt|title|aria-label)="([^"]*)"/gi)].map((match) => match[1]);
  const body = cleaned.replace(/<[^>]+>/g, ' ');
  return [...attributes, body].join('\n');
}
