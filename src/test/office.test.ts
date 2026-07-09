import { office, isAcceptingRequests, assertOfficeValid } from '../data/office';

describe('사무소 정보 단일 출처', () => {
  it('개업 전에는 접수를 받지 않는다', () => {
    expect(office.isOpen).toBe(false);
    expect(isAcceptingRequests(office)).toBe(false);
  });

  it('isOpen인데 필수 정보가 비어 있으면 유효하지 않다', () => {
    const invalid = { ...office, isOpen: true };
    expect(() => assertOfficeValid(invalid)).toThrow();
  });

  it('모든 필수 정보가 채워지면 유효하다', () => {
    const filled = {
      isOpen: true,
      phone: '02-000-0000',
      kakaoChannelUrl: 'https://pf.kakao.com/_example',
      address: '서울시 ...',
      registrationNumber: '제0000-00호',
      businessNumber: '000-00-00000',
      formEndpoint: 'https://formspree.io/f/example',
    };
    expect(() => assertOfficeValid(filled)).not.toThrow();
    expect(isAcceptingRequests(filled)).toBe(true);
  });
});
