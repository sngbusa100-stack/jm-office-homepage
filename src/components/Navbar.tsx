import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const menu = [
  { to: '/why', label: '행정사가 필요한 이유' },
  { to: '/services', label: '업무분야' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  return (
    <header className="navbar">
      <div className="page-shell navbar__inner">
        <Link to="/" className="navbar__logo" onClick={() => setOpen(false)}>
          <img src={`${import.meta.env.BASE_URL}images/logo_final.png`} alt="" width={40} height={40} />
          <span>정명(正明) <small>행정사사무소</small></span>
        </Link>
        {/* 상담 버튼은 nav 밖에 둔다. nav는 768px 이하에서 접히므로 안에 넣으면
            모바일에서 햄버거를 열어야만 보인다. */}
        <div className="navbar__right">
          <nav id="global-nav" className={open ? 'is-open' : ''} aria-label="주요 메뉴">
            {menu.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Link className="button button--accent navbar__cta" to="/consult" onClick={() => setOpen(false)}>
            상담 문의
          </Link>
          <button
            className="navbar__toggle"
            aria-expanded={open}
            aria-controls="global-nav"
            aria-label={open ? '주요 메뉴 닫기' : '주요 메뉴 열기'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? '닫기' : '메뉴'}
          </button>
        </div>
      </div>
    </header>
  );
}
