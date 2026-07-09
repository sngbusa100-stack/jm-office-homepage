import raw from './office.json';

export interface Office {
  isOpen: boolean;
  phone: string | null;
  kakaoChannelUrl: string | null;
  address: string | null;
  registrationNumber: string | null;
  businessNumber: string | null;
  formEndpoint: string | null;
}

const REQUIRED_WHEN_OPEN: (keyof Office)[] = [
  'phone', 'kakaoChannelUrl', 'address', 'registrationNumber', 'businessNumber', 'formEndpoint',
];

export function assertOfficeValid(candidate: Office): void {
  if (!candidate.isOpen) return;
  const missing = REQUIRED_WHEN_OPEN.filter((key) => !candidate[key]);
  if (missing.length > 0) {
    throw new Error(`개업 상태인데 다음 정보가 비어 있습니다: ${missing.join(', ')}`);
  }
}

export function isAcceptingRequests(candidate: Office): boolean {
  return candidate.isOpen && REQUIRED_WHEN_OPEN.every((key) => Boolean(candidate[key]));
}

export const office: Office = raw as unknown as Office;
assertOfficeValid(office);
