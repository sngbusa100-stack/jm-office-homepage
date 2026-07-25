import {
  captureAttribution,
  attributedExternalUrl,
  readAttribution,
  sanitizeAttribution,
  trackFunnelEvent,
} from '../lib/funnel';

describe('개인정보 없는 전환 퍼널 규격', () => {
  beforeEach(() => {
    sessionStorage.clear();
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
});
