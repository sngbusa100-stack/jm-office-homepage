import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { FORBIDDEN_PHRASES, findForbidden, htmlToCheckedText } from '../../scripts/forbidden-phrases.mjs';

const SRC = join(__dirname, '..');
const ROOT = join(__dirname, '../..');

/** 화면·검색 결과에 나갈 수 있는 소스 전체(src 아래, 테스트 제외)와 셸 index.html. */
function collectFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return full === join(SRC, 'test') ? [] : collectFiles(full);
    return /\.(ts|tsx|json)$/.test(name) && !/\.test\./.test(name) ? [full] : [];
  });
}

// 근거: 행정사법 제22조 제4호(연고 선전)·제5호(오도·오해 광고), 표시광고법 제3조①.
// 예전 주석의 '§21의2'는 수임제한 조문이라 잘못된 인용이었다(2026-10-17 원문 대조).
// 금지어 목록은 scripts/forbidden-phrases.mjs 한 곳에서 관리하고, 빌드 뒤 verify-dist도 같은 목록으로 dist HTML을 검사한다.
describe('금지 표현 검사 (행정사법 제22조 제4·5호, 표시광고법 제3조①)', () => {
  const targets = [...collectFiles(SRC), join(ROOT, 'index.html')].filter((file) => existsSync(file));

  it('검사 대상에 검색 제목·설명을 만드는 lib과 셸 index.html이 들어 있다', () => {
    expect(targets).toContain(join(SRC, 'lib/pageMeta.ts'));
    expect(targets).toContain(join(SRC, 'data/services.ts'));
    expect(targets).toContain(join(ROOT, 'index.html'));
    expect(targets.some((file) => file.startsWith(join(SRC, 'test')))).toBe(false);
  });

  it.each(targets.map((file) => [file.slice(ROOT.length + 1), file]))('%s에 금지 표현이 없다', (_label, file) => {
    expect(findForbidden(readFileSync(file, 'utf8'))).toEqual([]);
  });
});

describe('금지어 목록과 판별 규칙', () => {
  it('보장·성공률 표현, 행정심판 대리로 읽히는 표현, 연고·결과 단정 문구를 모두 담는다', () => {
    for (const phrase of ['100%', '보장합니다', '성공률', '심리 대응', '행정심판까지 대응', '인맥', '전관예우', '연고를', '청탁해', '로비해', '한 번에 통과', '반려 없이 한 번에']) {
      expect(FORBIDDEN_PHRASES).toContain(phrase);
    }
  });

  it('문구 단위로 판별해 일상 표현은 걸지 않는다', () => {
    expect(findForbidden('1층 로비에서 만나요. 청탁금지법 안내, 사전관리 일정')).toEqual([]);
    expect(findForbidden('인맥으로 해결합니다')).toEqual(['인맥']);
    expect(findForbidden('반려 없이 한 번에 통과')).toEqual(expect.arrayContaining(['한 번에 통과', '반려 없이 한 번에']));
  });

  it('토지보상: 사무소가 보상액을 교섭·증액·산정해 준다고 읽히는 광고는 잡는다', () => {
    for (const ad of ['보상금 협의해 드립니다', '보상액을 협상해 드립니다', '감정가를 산정하여 드립니다', '보상금을 증액해 드립니다', '보상금을 올려 드립니다', '보상금 더 받아 드려요', '보상액을 협상합니다', '감정가를 산정합니다']) {
      expect(findForbidden(ad), ad).toEqual(['보상액 교섭·증액·산정 광고']);
    }
    expect(findForbidden('보상 협의를 대행합니다')).toEqual(['보상 협의 대행 광고']);
    expect(findForbidden('보상금 증액 보장')).toEqual(['증액 보장']);
  });

  it('토지보상: 업무 제한·절차 설명은 통과시킨다', () => {
    for (const ok of [
      '보상금 증액을 약속하지 않습니다. 보상 협의 단계 확인',
      '보상금 협상은 하지 않습니다',
      '보상 협의 대행은 제공하지 않습니다',
      '증액을 보장하지 않습니다',
      '증액 보장은 하지 않습니다',
      '보상액을 협상해 드리지 않습니다',
      '보상금을 증액해 드리는 업무는 하지 않습니다',
      '보상액을 협상하지 않습니다',
      '사업시행자와 보상액을 교섭하거나 감정평가 금액이 맞는지 정해 드리지는 않습니다',
    ]) {
      expect(findForbidden(ok), ok).toEqual([]);
    }
  });

  it('가상 후기 형식(별점·"OO님")도 금지 표현으로 잡는다', () => {
    expect(findForbidden('★★★★★ 친절해요')).toEqual(['후기 오인 형식']);
    expect(findForbidden('OO 님 후기')).toEqual(['후기 오인 형식']);
  });

  it('dist HTML은 본문·title·meta·대체 텍스트·JSON-LD만 검사하고 태그 속성·CSS·스크립트·주석은 뺀다', () => {
    const html = [
      '<!doctype html><html><head><title>정명 행정사사무소</title>',
      '<meta name="description" content="반드시 구제">',
      '<style>.bar{width:100%}</style>',
      '<script type="module" src="/assets/a.js"></script><script>var x="100%";</script>',
      '<script type="application/ld+json">{"answer":"성공률 안내"}</script>',
      '</head><body><div style="width:100%"><!-- 100% --><img alt="무조건" src="a.png">본문</div></body></html>',
    ].join('');
    const text = htmlToCheckedText(html);
    expect(findForbidden(text).sort()).toEqual(['무조건', '반드시 구제', '성공률'].sort());
    expect(text).toContain('정명 행정사사무소');
    expect(text).toContain('본문');
  });
});
