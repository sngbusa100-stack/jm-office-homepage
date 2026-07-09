import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const menu = [
  { to: '/why', label: '행정사가 필요한 이유' },
  { to: '/services/dui', label: '업무분야' },
  { to: '/check', label: '셀프 진단' },
  { to: '/consult', label: '상담 안내' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="navbar">
      <div className="page-shell navbar__inner">
        <Link to="/" className="navbar__logo" onClick={() => setOpen(false)}>
          <img src="/images/logo_final.png" alt="" height={40} />
          <span>정명(正明) <small>행정사사무소</small></span>
        </Link>
        <button
          className="navbar__toggle"
          aria-expanded={open}
          aria-controls="global-nav"
          onClick={() => setOpen((v) => !v)}
        >
          메뉴
        </button>
        <nav id="global-nav" className={open ? 'is-open' : ''} aria-label="주요 메뉴">
          {menu.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
