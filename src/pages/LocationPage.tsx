import { IntakeLinks } from '../components/IntakeLinks';
import { office } from '../data/office';
import { OfficeVisitFacts } from '../components/OfficeVisitFacts';
import { OfficeLocation } from '../components/OfficeLocation';
import { OfficeStructuredData } from '../components/OfficeStructuredData';
import { trackContactClick } from '../lib/funnel';
import { mapEmbedUrl } from '../lib/officeContact';

export function LocationPage() {
  return (
    <div className="page-shell section narrow-page">
      <OfficeStructuredData />
      <header className="page-header">
        <h1>오시는 길</h1>
      </header>

      <section className="card" aria-labelledby="location-address">
        <h2 id="location-address">주소</h2>
        <OfficeLocation />
        {office.mapQuery && (
          <iframe
            className="location-map"
            title="정명 행정사사무소 위치 지도"
            src={mapEmbedUrl(office.mapQuery)}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
      </section>

      {(office.consultHours || office.parking) && (
        <section className="card" aria-labelledby="location-visit">
          <h2 id="location-visit">상담 시간·주차</h2>
          <OfficeVisitFacts />
        </section>
      )}

      <section className="card" aria-labelledby="location-contact">
        <h2 id="location-contact">연락처</h2>
        <div className="button-row"><IntakeLinks /></div>
        {office.fax && <p>팩스 {office.fax}</p>}
        {office.email && (
          <p>이메일 <a href={`mailto:${office.email}`} onClick={() => trackContactClick('email')}>{office.email}</a></p>
        )}
      </section>
    </div>
  );
}
