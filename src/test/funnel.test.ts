import {
  captureAttribution,
  attributedExternalUrl,
  funnelSourceOf,
  markInternalBrowser,
  readAttribution,
  referrerSource,
  sanitizeAttribution,
  trackFunnelEvent,
} from '../lib/funnel';

describe('개인정보 없는 전환 퍼널 규격', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('허용된 UTM 값만 길이를 제한해 보관한다', () => {
    expect(sanitizeAttribution({
      source: 'naver',
      medium: 'blog',
      campaign: '음주운전-여름',
      content: 'a'.repeat(120),
      ignored: '홍길동',
    })).toEqual({
      source: 'naver',
      medium: 'blog',
      campaign: '음주운전-여름',
      content: 'a'.repeat(80),
    });
  });

  it('URL의 UTM 4종을 세션에 저장하고 기존 값을 유지한다', () => {
    captureAttribution('?utm_source=naver&utm_medium=blog&utm_campaign=dui&utm_content=top');
    expect(readAttribution()).toEqual({
      source: 'naver',
      medium: 'blog',
      campaign: 'dui',
      content: 'top',
    });

    captureAttribution('?utm_medium=organic');
    expect(readAttribution()).toEqual({
      source: 'naver',
      medium: 'organic',
      campaign: 'dui',
      content: 'top',
    });
  });

  it('이전 사이트 주소는 출처 묶음 이름으로만 바꾸고 우리 사이트·이상한 주소는 무시한다', () => {
    expect(referrerSource('https://m.search.naver.com/search.naver?query=%ED%99%8D%EA%B8%B8%EB%8F%99')).toBe('naver');
    expect(referrerSource('https://blog.naver.com/someone/123')).toBe('blog');
    expect(referrerSource('https://example.tistory.com/160')).toBe('blog');
    expect(referrerSource('https://www.google.co.kr/')).toBe('google');
    expect(referrerSource('https://search.daum.net/search?q=x')).toBe('kakao');
    expect(referrerSource('https://l.instagram.com/')).toBe('instagram');
    expect(referrerSource('https://youtu.be/abc')).toBe('youtube');
    expect(referrerSource('https://www.bing.com/')).toBe('referral');
    expect(referrerSource('https://notnaver.com/')).toBe('referral');
    expect(referrerSource('https://visa.jungmyungoffice.com/visa/e7')).toBeUndefined();
    expect(referrerSource('https://jungmyungoffice.co.kr/')).toBeUndefined();
    expect(referrerSource('android-app://com.google.android.gm/')).toBeUndefined();
    expect(referrerSource('')).toBeUndefined();
  });

  it('UTM 출처가 없을 때만 이전 사이트 주소의 출처 묶음을 쓰고 주소 자체는 남기지 않는다', () => {
    captureAttribution('', 'https://m.search.naver.com/search.naver?query=%ED%99%8D%EA%B8%B8%EB%8F%99');
    expect(readAttribution()).toEqual({ source: 'naver' });
    expect(JSON.stringify(sessionStorage)).not.toContain('search.naver');

    // 같은 방문 안에서는 처음 정한 출처를 유지한다.
    captureAttribution('', 'https://www.google.com/');
    expect(readAttribution()).toEqual({ source: 'naver' });

    sessionStorage.clear();
    captureAttribution('?utm_source=blog', 'https://www.google.com/');
    expect(readAttribution()).toEqual({ source: 'blog' });
  });

  it('비자 사이트 이동에는 허용된 원 유입과 내부 접점을 함께 전달한다', () => {
    captureAttribution('?utm_source=naver&utm_medium=blog&utm_campaign=e7&utm_content=top');
    const url = new URL(attributedExternalUrl('https://visa.example/visa/e7', 'jm_main'));
    expect(Object.fromEntries(url.searchParams)).toEqual({
      utm_source: 'naver',
      utm_medium: 'blog',
      utm_campaign: 'e7',
      utm_content: 'top--jm_main',
    });

    captureAttribution('?utm_source=person%40example.com&utm_campaign=%ED%99%8D%EA%B8%B8%EB%8F%99');
    const filtered = new URL(attributedExternalUrl('https://visa.example', 'jm_main'));
    expect(filtered.searchParams.has('utm_source')).toBe(false);
    expect(filtered.searchParams.has('utm_campaign')).toBe(false);
  });

  it('허용되지 않은 이벤트·분야는 전송하지 않는다', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await trackFunnelEvent({
      event: 'landing_view',
      domain: 'dui',
      path: '/services/dui',
    });
    await trackFunnelEvent({
      event: 'name_entered' as 'landing_view',
      domain: '홍길동' as 'dui',
      path: '/consult',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0];
    const payload = JSON.parse((options as RequestInit).body as string);
    expect(payload).toMatchObject({
      event: 'landing_view',
      domain: 'dui',
    });
    expect(Object.keys(payload).sort()).toEqual([
      'attribution',
      'domain',
      'event',
    ]);
  });

  it('관리 화면에 로그인한 브라우저는 퍼널을 보내지 않는다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    markInternalBrowser();
    await trackFunnelEvent({ event: 'landing_view', domain: 'dui', path: '/services/dui' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('통계 요청에는 원본 UTM 대신 정규화된 source 하나만 전송한다', async () => {
    captureAttribution(
      '?utm_source=person%40example.com&utm_medium=01012345678'
      + '&utm_campaign=%ED%99%8D%EA%B8%B8%EB%8F%99&utm_content=secret',
    );
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    await trackFunnelEvent({ event: 'landing_view', domain: 'visa', path: '/services/immigration' });
    const payload = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(payload.attribution).toEqual({ source: 'other' });
    expect(JSON.stringify(payload)).not.toContain('person@example.com');
    expect(JSON.stringify(payload)).not.toContain('01012345678');
    expect(JSON.stringify(payload)).not.toContain('홍길동');
    expect(JSON.stringify(payload)).not.toContain('secret');
  });

  it('지도 장소 화면의 홈페이지 링크(utm_medium=place)는 검색과 나눠 보내고, 다른 사이트로는 원래 출처만 넘긴다', async () => {
    expect(funnelSourceOf({ source: 'naver', medium: 'place' })).toBe('naver_place');
    expect(funnelSourceOf({ source: 'Google', medium: 'PLACE' })).toBe('google_place');
    expect(funnelSourceOf({ source: 'kakao', medium: 'place' })).toBe('kakao_place');
    expect(funnelSourceOf({ source: 'naver', medium: 'blog' })).toBe('naver');
    expect(funnelSourceOf({ source: 'blog', medium: 'place' })).toBe('blog');

    captureAttribution('?utm_source=naver&utm_medium=place');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    await trackFunnelEvent({ event: 'landing_view', domain: 'home', path: '/' });
    const payload = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(payload.attribution).toEqual({ source: 'naver_place' });

    const visa = new URL(attributedExternalUrl('https://visa.example', 'jm_main'));
    expect(visa.searchParams.get('utm_source')).toBe('naver');
    expect(visa.searchParams.get('utm_medium')).toBe('place');
  });

  it('새 출처로 다시 들어왔는데 medium이 없으면 앞 방문의 place를 이어 붙이지 않는다', () => {
    captureAttribution('?utm_source=naver&utm_medium=place');
    captureAttribution('?utm_source=google');
    expect(readAttribution()).toEqual({ source: 'google' });
    expect(funnelSourceOf(readAttribution())).toBe('google');
  });
});
