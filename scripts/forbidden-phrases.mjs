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

/**
 * 토지보상 보상액 교섭·증액·가액 산정을 사무소가 해 준다는 광고. 사무소는 이 일을 하지 않는다
 * (행정사법 제2조① 단서, 변호사법 제109조, 감정평가법 제2조·제49조).
 * 끝맺는 긍정 서술('합니다', '해 드립니다')만 잡는다 — '보상액을 협상해 드리지 않습니다',
 * '증액해 드리는 업무는 하지 않습니다', '증액 보장은 하지 않습니다', '보상 협의 단계 확인' 같은
 * 업무 제한·절차 설명은 통과해야 한다.
 */
export const LAND_PATTERNS = [
  [/(?:보상금|보상액|감정가|감정평가액)\s*(?:을|를)?\s*(?:협의|협상|교섭|증액|산정|올려|더\s*받아)\s*(?:해|하여|해서)?\s*(?:드립니다|드려요|드림|줍니다|합니다)/, '보상액 교섭·증액·산정 광고'],
  [/보상\s*(?:금|액)?\s*(?:협의|협상|교섭)\s*(?:를|을)?\s*대행\s*(?:합니다|(?:해|하여)\s*드립니다|드립니다|(?:해|하여)\s*드려요)/, '보상 협의 대행 광고'],
  [/증액\s*(?:을|이)?\s*보장(?!\s*(?:은|을|는)?\s*(?:하지|할\s*수|되지|않|없))/, '증액 보장'],
];

/** 문자열에서 발견된 금지어 목록. 가상 후기 형식은 '후기 오인 형식'으로 보고한다. */
export function findForbidden(text) {
  const found = FORBIDDEN_PHRASES.filter((phrase) => text.includes(phrase));
  for (const [pattern, label] of LAND_PATTERNS) if (pattern.test(text)) found.push(label);
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
