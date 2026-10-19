import { office } from '../data/office';

/** 개업 전 사전 공개 안내 띠. 개업(office.json isOpen) 뒤에는 보이지 않는다. */
export function PreOpeningNotice() {
  if (office.isOpen) return null;
  return (
    <p className="preopen-banner" role="note">
      <span className="badge-preopen">개업 준비 중</span>{' '}
      이 사이트는 정식 개업 전 사전 공개 화면입니다. 상담·수임 접수는 개업 후 시작됩니다.
    </p>
  );
}
