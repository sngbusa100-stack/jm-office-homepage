import { Link } from 'react-router-dom';
import { SITE_URL } from '../lib/pageMeta';
import { serializeJsonLd } from '../lib/officeContact';

export interface BreadcrumbTrail {
  /** 마지막에서 두 번째까지의 상위 항목(링크) */
  parents: Array<{ name: string; to: string }>;
  /** 현재 페이지 이름(링크 아님) */
  current: string;
}

/** 현재 위치 표시(홈 › 상위 › 현재)와 같은 경로의 BreadcrumbList 구조화 데이터를 함께 낸다. */
export function Breadcrumbs({ parents, current }: BreadcrumbTrail) {
  const home = { name: '홈', to: '/' };
  const links = [home, ...parents];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      ...links.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.to === '/' ? SITE_URL : `${SITE_URL}${item.to}`,
      })),
      { '@type': 'ListItem', position: links.length + 1, name: current },
    ],
  };
  return (
    <>
      <nav className="breadcrumbs" aria-label="현재 위치">
        <ol>
          {links.map((item) => (
            <li key={item.to}><Link to={item.to}>{item.name}</Link></li>
          ))}
          <li><span aria-current="page">{current}</span></li>
        </ol>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
    </>
  );
}
