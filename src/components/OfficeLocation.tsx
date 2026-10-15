import { office } from '../data/office';
import { mapLinks } from '../lib/officeContact';

/** 주소·교통 안내·지도 바로가기. 오시는 길 페이지와 상담 안내가 함께 쓴다. */
export function OfficeLocation() {
  if (!office.address || !office.mapQuery) return null;
  const maps = mapLinks(office.mapQuery);
  return (
    <>
      <p>{office.address}</p>
      {office.addressNote && <p className="note">{office.addressNote}</p>}
      <div className="location-actions">
        <a className="button button--ghost" href={maps.naver} target="_blank" rel="noopener noreferrer">네이버 지도</a>
        <a className="button button--ghost" href={maps.kakao} target="_blank" rel="noopener noreferrer">카카오맵</a>
      </div>
    </>
  );
}
