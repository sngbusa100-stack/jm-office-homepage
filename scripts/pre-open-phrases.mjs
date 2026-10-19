// 개업 전에만 보여야 하는 문구. 개업(office.json isOpen=true) 뒤에 화면·사전 렌더링 결과·운영 사이트에
// 남아 있으면 안 된다. 개업 화면 테스트(src/test/goLiveWording.open.test.tsx)와
// 개업 전환 점검(scripts/go-live-check.mjs)이 같은 목록을 쓴다.
export const PRE_OPEN_PHRASES = ['개업 준비', '개업 후', '개업 전', '개업을 기다리지', '사전 공개'];

/** 글에 남은 개업 전 문구 목록 */
export function findPreOpenPhrases(text) {
  return PRE_OPEN_PHRASES.filter((phrase) => text.includes(phrase));
}
