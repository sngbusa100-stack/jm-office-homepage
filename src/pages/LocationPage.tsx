import { office } from '../data/office';
import { OfficeLocation } from '../components/OfficeLocation';
import { OfficeStructuredData } from '../components/OfficeStructuredData';

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
      </section>

      {(office.consultHours || office.parking) && (
        <section className="card" aria-labelledby="location-visit">
          <h2 id="location-visit">상담 시간·주차</h2>
          <dl className="visit-facts">
            {office.consultHours && <div><dt>상담 시간</dt><dd>{office.consultHours}</dd></div>}
            {office.parking && <div><dt>주차</dt><dd>{office.parking}</dd></div>}
          </dl>
        </section>
      )}

      {(office.phone || office.fax || office.email) && (
        <section className="card" aria-labelledby="location-contact">
          <h2 id="location-contact">연락처</h2>
          {office.phone && (
            <p>
              <a className="button button--primary" href={`tel:${office.phone}`}>{office.phone}</a>
            </p>
          )}
          {office.fax && <p>팩스 {office.fax}</p>}
          {office.email && (
            <p>이메일 <a href={`mailto:${office.email}`}>{office.email}</a></p>
          )}
        </section>
      )}
    </div>
  );
}
