import { office } from '../data/office';
import { OfficeLocation } from '../components/OfficeLocation';

export function LocationPage() {
  return (
    <div className="page-shell section narrow-page">
      <header className="page-header">
        <h1>오시는 길</h1>
      </header>

      <section className="card" aria-labelledby="location-address">
        <h2 id="location-address">주소</h2>
        <OfficeLocation />
      </section>

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
