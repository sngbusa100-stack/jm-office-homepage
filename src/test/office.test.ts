import { office, isAcceptingRequests, assertOfficeValid, REQUIRED_WHEN_OPEN } from '../data/office';
import { REQUIRED_OFFICE_FIELDS } from '../../scripts/go-live-check-lib.mjs';

describe('사무소 정보 단일 출처', () => {
  it('개업 전환 점검의 필수값 목록이 화면 코드와 같다', () => {
    expect(REQUIRED_OFFICE_FIELDS).toEqual(REQUIRED_WHEN_OPEN);
  });

  it('개업 전에는 접수를 받지 않고 개업일도 비어 있다', () => {
    expect(office.isOpen).toBe(false);
    expect(office.openedOn).toBeNull();
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
