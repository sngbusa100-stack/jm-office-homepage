# 정명 행정사사무소 홈페이지 재구축 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 방문자가 셀프 진단으로 상황을 점검하고, 행정사의 필요성을 이해하고, 상담·수임을 신청할 수 있는 한국어 전용 React 홈페이지를 구축한다.

**Architecture:** Vite + React + TypeScript SPA. 콘텐츠·진단 문항은 `src/data/`의 타입된 모듈로 분리하고, 진단 분류 로직은 `src/domain/`의 순수 함수로 구현한다. 사무소 정보는 `src/data/office.json` 단일 파일이 유일한 출처이며 `isOpen: false`인 동안 모든 접수 채널은 "개업 준비 중"으로 렌더링된다.

**Tech Stack:** React 19.2.7, React Router DOM 7.18.1, Vite 8.1.2, TypeScript 6.0.3, Vitest 4.1.9 (비자진단 프로젝트와 동일 버전)

**작업 규칙 (사용자 지침 — 계획 전체에 적용):**
- 커밋·푸시 단계는 계획에서 제외한다. 사용자가 별도 지시할 때만 수행한다.
- 각 Task 완료 시 `checklist.md` 체크, 경과는 `memory.md`에 기록한다.
- 기존 루트 파일(D:\홈페이지\index.html 등)은 절대 삭제·수정하지 않는다.

---

## 파일 구조

```
D:\홈페이지\정명 행정사사무소 홈페이지\
├── package.json / tsconfig.json / vite.config.ts / .gitignore
├── index.html
├── checklist.md / memory.md
├── scripts/
│   ├── clean-dist.mjs / clean-dist.ps1     # 비자진단 프로젝트에서 복사
│   ├── verify-office.mjs                    # isOpen=true인데 값 누락 시 빌드 실패
│   └── verify-dist.mjs                      # 배포 산출물 검증
├── public/
│   ├── _redirects                           # Netlify SPA
│   └── images/ (logo_final.png 등 기존 로고 복사)
├── vercel.json
├── legacy/original-site/                    # 기존 루트 index.html·styles.css·script.js·images 복사 보존
├── docs/superpowers/{specs,plans}/
└── src/
    ├── main.tsx / App.tsx
    ├── app/AppRouter.tsx
    ├── styles/tokens.css / app.css
    ├── types/content.ts                     # CheckDomain, ResultLevel, Question 등 공유 타입
    ├── data/
    │   ├── office.json / office.ts          # 사무소 정보 단일 출처
    │   ├── services.ts                      # 업무분야 6종 콘텐츠
    │   ├── why.ts                           # 행정사 필요성 콘텐츠
    │   ├── faq.ts                           # 홈 FAQ
    │   └── checks/
    │       ├── index.ts                     # 도메인별 질문 모음
    │       ├── dui.ts                       # 음주운전 구제 10문항
    │       ├── suspension.ts                # 영업정지 구제 10문항
    │       └── veterans.ts                  # 국가유공자 등록 9문항
    ├── domain/diagnosis.ts                  # 답변 → 4단계 분류 순수 함수
    ├── lib/browserStorage.ts                # 안전한 sessionStorage 접근 (비자진단에서 복사)
    ├── components/
    │   ├── Layout.tsx / Navbar.tsx / Footer.tsx
    │   ├── PreOpeningNotice.tsx             # 개업 준비 중 배지·배너
    │   └── ConsultCta.tsx                   # 상담 유도 배너 (재사용)
    ├── pages/
    │   ├── HomePage.tsx / WhyPage.tsx
    │   ├── ServicePage.tsx                  # /services/:slug 데이터 구동
    │   ├── CheckSelectPage.tsx / CheckPage.tsx / CheckResultPage.tsx
    │   ├── ConsultPage.tsx
    │   ├── PrivacyPage.tsx / DisclaimerPage.tsx / NotFoundPage.tsx
    └── test/ (setup.ts, 각종 테스트)
```

---

### Task 1: 프로젝트 스캐폴딩과 기존 파일 보존

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`, `src/test/setup.ts`
- Copy: `D:\홈페이지\행정사 비자진단 홈페이지\scripts\clean-dist.mjs`, `clean-dist.ps1` → `scripts/`
- Copy: `D:\홈페이지\{index.html,styles.css,script.js,images\}` → `legacy/original-site/`
- Copy: `D:\홈페이지\images\logo_final.png`, `logo.png` → `public/images/`

- [ ] **Step 1: 폴더 생성, git init, 기존 파일 복사 보존**

```powershell
Set-Location "D:\홈페이지\정명 행정사사무소 홈페이지"
git init
New-Item -ItemType Directory -Force legacy/original-site, scripts, public/images, src/test
Copy-Item "D:\홈페이지\index.html","D:\홈페이지\styles.css","D:\홈페이지\script.js" legacy/original-site/
Copy-Item "D:\홈페이지\images" legacy/original-site/images -Recurse
Copy-Item "D:\홈페이지\images\logo_final.png","D:\홈페이지\images\logo.png" public/images/
Copy-Item "D:\홈페이지\행정사 비자진단 홈페이지\scripts\clean-dist.mjs","D:\홈페이지\행정사 비자진단 홈페이지\scripts\clean-dist.ps1" scripts/
```

- [ ] **Step 2: package.json 작성** (비자진단과 동일 버전, 이름·verify:office만 다름)

```json
{
  "name": "jm-office-homepage",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "engines": { "node": ">=20.19.0" },
  "scripts": {
    "dev": "vite",
    "prebuild": "node scripts/clean-dist.mjs && node scripts/verify-office.mjs",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "typecheck": "tsc --noEmit --pretty false",
    "verify:dist": "node scripts/verify-dist.mjs",
    "check": "npm run typecheck && npm run test:run && npm run build && npm run verify:dist"
  },
  "dependencies": {
    "react": "19.2.7",
    "react-dom": "19.2.7",
    "react-router-dom": "7.18.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "6.9.1",
    "@testing-library/react": "16.3.2",
    "@testing-library/user-event": "14.6.1",
    "@types/react": "19.2.17",
    "@types/react-dom": "19.2.3",
    "@vitejs/plugin-react": "6.0.3",
    "jsdom": "29.1.1",
    "typescript": "6.0.3",
    "vite": "8.1.2",
    "vitest": "4.1.9"
  }
}
```

`verify-office.mjs`는 Task 3에서 작성하므로 그 전까지 prebuild가 실패한다. Task 3 전에는 build를 실행하지 않는다.

- [ ] **Step 3: tsconfig.json, vite.config.ts, .gitignore, setup.ts 작성** (비자진단과 동일)

tsconfig.json — 비자진단 프로젝트 파일과 동일 내용 사용:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "vite.config.ts"]
}
```

vite.config.ts:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
```

.gitignore:

```
node_modules
dist
.env
.claude/
```

src/test/setup.ts:

```ts
import '@testing-library/jest-dom/vitest';

Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});
```

- [ ] **Step 4: index.html, main.tsx, App.tsx 최소 구현**

index.html:

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="정명 행정사사무소 — 음주운전 구제, 영업정지 행정심판, 인허가, 국가보훈. 셀프 진단으로 내 상황을 먼저 확인하세요. (개업 준비 중 사전 공개)" />
    <title>정명 행정사사무소 | 정확함으로 길을 밝히다</title>
    <link rel="icon" href="/images/logo.png" type="image/png" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

src/main.tsx:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/tokens.css';
import './styles/app.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

src/App.tsx (라우터는 Task 7에서 연결, 지금은 임시):

```tsx
export function App() {
  return <main>정명 행정사사무소 — 준비 중</main>;
}
```

src/vite-env.d.ts:

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 5: 의존성 설치와 타입 검사 통과 확인**

Run: `npm install` → 취약점 0개 기대. `npm run typecheck` → 오류 0개 (styles/*.css는 Task 2에서 만들므로 이 시점엔 main.tsx의 css import를 잠시 주석 처리하거나 빈 파일을 미리 생성: `New-Item -ItemType File -Force src/styles/tokens.css, src/styles/app.css`)

- [ ] **Step 6: checklist.md 체크, memory.md에 경과 기록**

---

### Task 2: 디자인 토큰·전역 스타일·공통 컴포넌트

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/app.css`
- Create: `src/components/Layout.tsx`, `Navbar.tsx`, `Footer.tsx`, `PreOpeningNotice.tsx`, `ConsultCta.tsx`
- Test: `src/test/components.test.tsx`

- [ ] **Step 1: 실패하는 컴포넌트 테스트 작성**

```tsx
// src/test/components.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Layout } from '../components/Layout';

function renderLayout() {
  return render(
    <MemoryRouter>
      <Layout>
        <p>본문</p>
      </Layout>
    </MemoryRouter>,
  );
}

describe('공통 레이아웃', () => {
  it('개업 준비 중 안내를 표시한다', () => {
    renderLayout();
    expect(screen.getAllByText(/개업 준비 중/).length).toBeGreaterThan(0);
  });

  it('본문 건너뛰기 링크와 주요 메뉴를 제공한다', () => {
    renderLayout();
    expect(screen.getByText('본문으로 건너뛰기')).toHaveAttribute('href', '#main');
    expect(screen.getByRole('link', { name: '셀프 진단' })).toHaveAttribute('href', '/check');
    expect(screen.getByRole('link', { name: '상담 안내' })).toHaveAttribute('href', '/consult');
  });

  it('푸터에 가짜 연락처가 없고 면책 링크가 있다', () => {
    renderLayout();
    expect(screen.queryByText(/02-1234/)).toBeNull();
    expect(screen.getByRole('link', { name: '면책 고지' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실패 확인** — Run: `npx vitest run src/test/components.test.tsx` → FAIL (Layout 없음)

- [ ] **Step 3: tokens.css 작성** (비자진단 토큰 구조 + 정명 브랜드 남색·금색)

```css
:root {
  --primary: #14284b;
  --primary-dark: #0c1a33;
  --accent: #b98a2f;
  --bg: #fafaf8;
  --surface: #ffffff;
  --surface-muted: #f3f5f8;
  --border: #dfe4ec;
  --text: #0f1a2a;
  --text-muted: #526072;
  --text-soft: #7b8798;
  --danger: #a33b2d;
  --warning: #9a6200;
  --success: #1f6b4f;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --shadow-sm: 0 1px 2px rgb(15 26 42 / 8%);
  --shadow-md: 0 16px 40px -24px rgb(15 26 42 / 35%);
}
```

- [ ] **Step 4: app.css 작성** — 전역 리셋, 레이아웃, 버튼, 카드, 폼, 배지, 반응형(768px 기준 모바일 메뉴), `prefers-reduced-motion` 대응. 핵심 클래스:

```css
* { box-sizing: border-box; margin: 0; }
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
body { font-family: 'Noto Sans KR', system-ui, sans-serif; background: var(--bg); color: var(--text); line-height: 1.65; }
.skip-link { position: absolute; left: -999px; top: 0; background: var(--primary); color: #fff; padding: 8px 16px; z-index: 100; }
.skip-link:focus { left: 0; }
.page-shell { max-width: 1080px; margin: 0 auto; padding: 0 20px; }
.button { display: inline-flex; align-items: center; gap: 6px; padding: 12px 22px; border-radius: var(--radius-sm); font-weight: 600; text-decoration: none; border: 1px solid transparent; cursor: pointer; font-size: 1rem; }
.button--primary { background: var(--primary); color: #fff; }
.button--accent { background: var(--accent); color: #fff; }
.button--ghost { border-color: var(--border); color: var(--primary); background: var(--surface); }
.button:disabled { opacity: 0.5; cursor: not-allowed; }
.badge-preopen { display: inline-block; background: var(--warning); color: #fff; border-radius: 999px; padding: 4px 12px; font-size: 0.85rem; font-weight: 700; }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 24px; box-shadow: var(--shadow-sm); }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
@media (max-width: 768px) { .grid-3, .grid-2 { grid-template-columns: 1fr; } }
.level-urgent { border-left: 4px solid var(--danger); }
.level-official { border-left: 4px solid var(--warning); }
.level-documents { border-left: 4px solid var(--accent); }
.level-ready { border-left: 4px solid var(--success); }
```

(그 외 navbar/footer/hero/faq/form 스타일은 위 토큰을 사용해 같은 파일에 이어서 작성한다. 색상 대비는 흰 배경 위 `--text-muted` 이상만 본문에 사용.)

- [ ] **Step 5: PreOpeningNotice.tsx 구현**

```tsx
// src/components/PreOpeningNotice.tsx
export function PreOpeningNotice() {
  return (
    <p className="preopen-banner" role="note">
      <span className="badge-preopen">개업 준비 중</span>{' '}
      이 사이트는 정식 개업 전 사전 공개 화면입니다. 상담·수임 접수는 개업 후 시작됩니다.
    </p>
  );
}
```

- [ ] **Step 6: Navbar.tsx 구현** — 로고 + 메뉴(홈 `/`, 행정사가 필요한 이유 `/why`, 업무분야 `/#services`, 셀프 진단 `/check`, 상담 안내 `/consult`), 모바일 햄버거 토글(`aria-expanded`, `aria-controls`), NavLink 활성 표시.

```tsx
// src/components/Navbar.tsx
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
```

- [ ] **Step 7: Footer.tsx 구현** — office 정보는 Task 3 이후 연결하므로 지금은 준비 중 문구 + 법적 링크만:

```tsx
// src/components/Footer.tsx
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="footer">
      <div className="page-shell">
        <p className="footer__brand">정명(正明) 행정사사무소</p>
        <p>사무소 정보(대표자·등록번호·소재지·연락처)는 정식 개업 후 이 자리에 게시됩니다.</p>
        <nav aria-label="법적 고지">
          <Link to="/privacy">개인정보처리방침</Link>
          <Link to="/disclaimer">면책 고지</Link>
        </nav>
        <p className="footer__note">본 사이트의 안내는 일반 정보이며 법률 자문이 아닙니다.</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 8: ConsultCta.tsx, Layout.tsx 구현**

```tsx
// src/components/ConsultCta.tsx
import { Link } from 'react-router-dom';

export function ConsultCta({ message = '기한이 지나면 다툴 방법 자체가 사라집니다. 내 상황부터 확인해 보세요.' }: { message?: string }) {
  return (
    <aside className="consult-cta card">
      <p>{message}</p>
      <div className="button-row">
        <Link className="button button--accent" to="/check">셀프 진단 시작 →</Link>
        <Link className="button button--ghost" to="/consult">상담 안내 보기</Link>
      </div>
    </aside>
  );
}
```

```tsx
// src/components/Layout.tsx
import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PreOpeningNotice } from './PreOpeningNotice';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main">본문으로 건너뛰기</a>
      <PreOpeningNotice />
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 9: 테스트 통과 확인** — Run: `npx vitest run src/test/components.test.tsx` → PASS. `npm run typecheck` → 통과.

주의: Step 1 테스트의 '업무분야' 링크 단언은 Navbar 구조 확정에 맞춰 `/services/dui`로 작성한다 (해시 링크 대신 대표 분야로 진입).

- [ ] **Step 10: checklist.md 체크, memory.md 기록**

---

### Task 3: 사무소 정보 단일 출처(office)와 빌드 안전장치

**Files:**
- Create: `src/data/office.json`, `src/data/office.ts`, `scripts/verify-office.mjs`
- Test: `src/test/office.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// src/test/office.test.ts
import { office, isAcceptingRequests } from '../data/office';

describe('사무소 정보 단일 출처', () => {
  it('개업 전에는 접수를 받지 않는다', () => {
    expect(office.isOpen).toBe(false);
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

import { assertOfficeValid } from '../data/office';
```

- [ ] **Step 2: 실패 확인** — Run: `npx vitest run src/test/office.test.ts` → FAIL

- [ ] **Step 3: office.json + office.ts 구현**

```json
{
  "isOpen": false,
  "phone": null,
  "kakaoChannelUrl": null,
  "address": null,
  "registrationNumber": null,
  "businessNumber": null,
  "formEndpoint": null
}
```

```ts
// src/data/office.ts
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

export const office: Office = raw as Office;
assertOfficeValid(office);
```

- [ ] **Step 4: verify-office.mjs 구현** (prebuild에서 실행 — JSON을 직접 읽어 동일 검증)

```js
// scripts/verify-office.mjs
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const office = JSON.parse(readFileSync(resolve(here, '../src/data/office.json'), 'utf8'));
const required = ['phone', 'kakaoChannelUrl', 'address', 'registrationNumber', 'businessNumber', 'formEndpoint'];

if (office.isOpen) {
  const missing = required.filter((key) => !office[key]);
  if (missing.length > 0) {
    console.error(`[verify-office] 개업 상태인데 정보 누락: ${missing.join(', ')}`);
    process.exit(1);
  }
}
console.log('[verify-office] 사무소 정보 검증 통과');
```

- [ ] **Step 5: 테스트·빌드 확인** — Run: `npx vitest run src/test/office.test.ts` → PASS. `node scripts/verify-office.mjs` → 통과 메시지.

- [ ] **Step 6: Footer를 office 연동으로 수정** — `isAcceptingRequests(office)`가 true면 전화·주소·등록번호 표시, false면 기존 준비 중 문구 유지:

```tsx
// Footer.tsx 본문 교체
import { office, isAcceptingRequests } from '../data/office';
// ...
{isAcceptingRequests(office) ? (
  <>
    <p>{office.address}</p>
    <p>행정사 등록번호 {office.registrationNumber} | 사업자등록번호 {office.businessNumber}</p>
    <p>전화 <a href={`tel:${office.phone}`}>{office.phone}</a></p>
  </>
) : (
  <p>사무소 정보(대표자·등록번호·소재지·연락처)는 정식 개업 후 이 자리에 게시됩니다.</p>
)}
```

- [ ] **Step 7: 전체 테스트 통과 확인 후 checklist.md 체크, memory.md 기록**

---

### Task 4: 진단 타입·질문 데이터 3종과 무결성 테스트

**Files:**
- Create: `src/types/content.ts`, `src/data/checks/dui.ts`, `suspension.ts`, `veterans.ts`, `index.ts`
- Test: `src/test/checkData.test.ts`

- [ ] **Step 1: 공유 타입 정의**

```ts
// src/types/content.ts
export type CheckDomain = 'dui' | 'suspension' | 'veterans';

export type ResultLevel = 'ready' | 'documents' | 'official' | 'urgent';

export interface QuestionOption {
  id: string;
  label: string;
  level: ResultLevel;
  note: string;           // 결과 화면 안내 문구
  lawRef?: string;        // 근거 법령 (예: '행정심판법 제27조')
}

export interface Question {
  id: string;
  text: string;
  help?: string;
  options: QuestionOption[];
}

export interface CheckDefinition {
  domain: CheckDomain;
  title: string;
  intro: string;
  questions: Question[];
}
```

- [ ] **Step 2: 실패하는 무결성 테스트 작성**

```ts
// src/test/checkData.test.ts
import { checks } from '../data/checks';

const LEVELS = ['ready', 'documents', 'official', 'urgent'];

describe('진단 데이터 무결성', () => {
  const domains = Object.keys(checks);

  it('3개 도메인이 모두 존재한다', () => {
    expect(domains.sort()).toEqual(['dui', 'suspension', 'veterans']);
  });

  it.each(domains)('%s: 문항 8~12개, ID 중복 없음, 모든 선택지에 분류·안내가 있다', (domain) => {
    const def = checks[domain as keyof typeof checks];
    expect(def.questions.length).toBeGreaterThanOrEqual(8);
    expect(def.questions.length).toBeLessThanOrEqual(12);
    const ids = def.questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const q of def.questions) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      const optionIds = q.options.map((o) => o.id);
      expect(new Set(optionIds).size).toBe(optionIds.length);
      for (const o of q.options) {
        expect(LEVELS).toContain(o.level);
        expect(o.note.length).toBeGreaterThan(5);
      }
    }
  });

  it.each(domains)('%s: 기한 관련 긴급 선택지에는 근거 법령이 있다', (domain) => {
    const def = checks[domain as keyof typeof checks];
    const urgentOptions = def.questions.flatMap((q) => q.options).filter((o) => o.level === 'urgent');
    expect(urgentOptions.length).toBeGreaterThan(0);
    for (const o of urgentOptions) {
      expect(o.lawRef, `${o.id}에 lawRef 없음`).toBeTruthy();
    }
  });
});
```

- [ ] **Step 3: 실패 확인** — Run: `npx vitest run src/test/checkData.test.ts` → FAIL

- [ ] **Step 4: dui.ts 작성 (음주운전 구제 10문항)** — 아래 내용 그대로 구현한다. 패턴: 경과 기간 문항이 긴급 분류의 핵심.

```ts
// src/data/checks/dui.ts
import type { CheckDefinition } from '../../types/content';

export const dui: CheckDefinition = {
  domain: 'dui',
  title: '음주운전 면허 구제 사전 점검',
  intro: '행정심판·이의신청으로 다툴 수 있는 상황인지, 무엇을 준비해야 하는지 정리합니다. 결과는 일반 정보이며 구제 여부에 대한 판단이 아닙니다.',
  questions: [
    {
      id: 'dui-disposition',
      text: '어떤 처분을 받으셨나요?',
      options: [
        { id: 'suspend', label: '면허 정지', level: 'ready', note: '정지 처분은 이의신청·행정심판으로 감경을 다툴 수 있는 대상입니다.' },
        { id: 'revoke', label: '면허 취소', level: 'official', note: '취소 처분은 110일 정지로의 감경을 다투는 경우가 많습니다. 관할 기관 절차를 확인하세요.' },
        { id: 'pending', label: '아직 통지 전 · 조사 중', level: 'official', note: '처분 확정 전입니다. 통지를 받으면 기한이 바로 시작되므로 통지서를 반드시 보관하세요.' },
        { id: 'unknown', label: '모름', level: 'official', note: '처분 내용은 경찰서 또는 도로교통공단(1577-1120)에서 확인할 수 있습니다.' },
      ],
    },
    {
      id: 'dui-bac',
      text: '적발 당시 혈중알코올농도 구간은 어디였나요?',
      help: '도로교통법 제44조 및 시행규칙 별표28 기준: 0.03% 이상 정지, 0.08% 이상 취소 대상.',
      options: [
        { id: 'low', label: '0.03% 이상 ~ 0.08% 미만', level: 'ready', note: '정지 구간입니다. 생계형 등 감경 사유가 있으면 다툴 여지를 검토할 수 있습니다.' },
        { id: 'mid', label: '0.08% 이상 ~ 0.1% 미만', level: 'official', note: '취소 구간 경계입니다. 처분 내용과 감경 요건을 함께 확인해야 합니다.' },
        { id: 'high', label: '0.1% 이상', level: 'official', note: '취소 구간입니다. 감경 배제 사유 해당 여부 확인이 중요합니다.' },
        { id: 'unknown', label: '모름', level: 'documents', note: '적발 당시 수치는 처분 통지서·수사 기록으로 확인할 수 있습니다.' },
      ],
    },
    {
      id: 'dui-elapsed',
      text: '처분(결정) 통지서를 받은 지 얼마나 되었나요?',
      help: '행정심판은 처분이 있음을 안 날부터 90일 이내에 청구해야 합니다.',
      options: [
        { id: 'none', label: '아직 통지서를 받지 않음', level: 'ready', note: '기한은 통지를 받은 날부터 계산됩니다. 통지서 수령일을 꼭 기록해 두세요.' },
        { id: 'within30', label: '30일 이내', level: 'ready', note: '이의신청(60일)·행정심판(90일) 기한이 남아 있습니다. 준비를 시작하기 좋은 시점입니다.', lawRef: '행정심판법 제27조' },
        { id: 'd30to60', label: '30일 ~ 60일', level: 'official', note: '이의신청 기한(60일)이 임박했습니다. 남은 절차별 기한을 바로 확인하세요.', lawRef: '도로교통법 제94조' },
        { id: 'd60to90', label: '60일 ~ 90일', level: 'urgent', note: '행정심판 청구 기한(90일)이 임박했습니다. 지금 바로 기한을 확인해야 합니다.', lawRef: '행정심판법 제27조' },
        { id: 'over90', label: '90일이 지남', level: 'urgent', note: '원칙적으로 행정심판 청구 기한이 지났습니다. 예외 인정 여부는 중앙행정심판위원회(110)에서 확인하세요.', lawRef: '행정심판법 제27조' },
        { id: 'unknown', label: '모름', level: 'urgent', note: '기한 계산의 기준일을 모르는 상태가 가장 위험합니다. 통지서 수령일부터 확인하세요.', lawRef: '행정심판법 제27조' },
      ],
    },
    {
      id: 'dui-procedure',
      text: '이의신청 또는 행정심판을 이미 진행 중인가요?',
      options: [
        { id: 'no', label: '아니오', level: 'ready', note: '아직 절차를 시작하지 않았습니다. 기한 안에 어떤 절차를 선택할지 정해야 합니다.' },
        { id: 'objection', label: '이의신청 진행 중', level: 'official', note: '이의신청 결과 통지 후에도 행정심판 기한이 별도로 진행됩니다. 일정 관리가 필요합니다.' },
        { id: 'appeal', label: '행정심판 진행 중', level: 'official', note: '보충 서면·증거 제출 기한을 관리해야 하는 단계입니다.' },
      ],
    },
    {
      id: 'dui-livelihood',
      text: '운전이 생계에 어느 정도 필요한가요?',
      help: '운전이 가족 생계의 주요 수단인 경우 감경 판단에서 고려될 수 있습니다.',
      options: [
        { id: 'job', label: '운전이 직업(화물·버스·택시 등)', level: 'documents', note: '생계형 감경 주장의 핵심입니다. 재직·소득 증빙을 준비하세요.' },
        { id: 'work', label: '업무상 반드시 필요', level: 'documents', note: '업무상 운전 필요성을 객관적으로 증빙할 자료를 준비하세요.' },
        { id: 'commute', label: '통근·일상용', level: 'ready', note: '생계형 주장은 어렵지만 다른 정상 참작 사유를 검토할 수 있습니다.' },
        { id: 'no', label: '꼭 필요하진 않음', level: 'ready', note: '감경 요소는 제한적이지만 처분 자체의 적법성 검토는 가능합니다.' },
      ],
    },
    {
      id: 'dui-history',
      text: '최근 5년 내 음주운전 이력이 있나요?',
      options: [
        { id: 'none', label: '없음 (이번이 처음)', level: 'ready', note: '초범은 감경 판단에서 유리한 요소입니다.' },
        { id: 'once', label: '1회 있음', level: 'official', note: '재범은 감경이 제한될 수 있습니다. 이력 내용을 정확히 확인하세요.' },
        { id: 'multi', label: '2회 이상', level: 'official', note: '감경 배제 사유에 해당할 가능성이 높습니다. 다른 구제 수단을 검토해야 합니다.' },
      ],
    },
    {
      id: 'dui-accident',
      text: '적발 당시 사고가 있었나요?',
      options: [
        { id: 'none', label: '사고 없음', level: 'ready', note: '단순 적발은 사고 동반 사안보다 감경 검토 폭이 넓습니다.' },
        { id: 'property', label: '물적 피해 사고', level: 'official', note: '피해 회복(합의·변제) 여부가 중요합니다. 관련 서류를 정리하세요.' },
        { id: 'injury', label: '인적 피해 사고', level: 'official', note: '인피 사고는 감경 배제 사유가 될 수 있습니다. 사안 검토가 꼭 필요합니다.' },
      ],
    },
    {
      id: 'dui-refusal',
      text: '음주 측정을 거부했나요?',
      options: [
        { id: 'no', label: '아니오', level: 'ready', note: '측정에 응한 경우 수치 기준으로 처분이 정해집니다.' },
        { id: 'yes', label: '예', level: 'official', note: '측정 거부는 별도의 취소 사유입니다(도로교통법 제93조). 처분 근거를 정확히 확인하세요.' },
      ],
    },
    {
      id: 'dui-evidence',
      text: '감경 주장에 쓸 증빙 서류는 준비되어 있나요?',
      help: '예: 재직증명서, 소득 증빙, 부양 가족 증빙, 표창·봉사 이력 등.',
      options: [
        { id: 'ready', label: '대부분 준비됨', level: 'ready', note: '준비된 증빙의 유효기간과 발급일을 확인하세요.' },
        { id: 'partial', label: '일부만 있음', level: 'documents', note: '부족한 증빙 목록을 만들어 발급 기관별로 준비하세요.' },
        { id: 'none', label: '없음', level: 'documents', note: '주장을 뒷받침할 증빙이 없으면 절차에서 불리합니다. 지금부터 수집을 시작하세요.' },
      ],
    },
    {
      id: 'dui-criminal',
      text: '형사 절차(벌금·재판)는 어떻게 진행 중인가요?',
      help: '행정처분(면허)과 형사처벌(벌금·징역)은 별개 절차로 각각 진행됩니다.',
      options: [
        { id: 'none', label: '아직 진행 없음', level: 'ready', note: '형사 절차 통지가 오면 행정 절차와 별도로 대응해야 합니다.' },
        { id: 'investigating', label: '경찰·검찰 조사 중', level: 'official', note: '형사 결과가 행정심판 자료로 쓰일 수 있어 진행 상황 관리가 필요합니다.' },
        { id: 'trial', label: '약식명령 · 재판 중', level: 'official', note: '형사 절차 서류는 행정 절차에서도 중요합니다. 사본을 보관하세요.' },
        { id: 'done', label: '종결(벌금 납부 등)', level: 'ready', note: '형사 결과 서류는 행정심판에서 참고 자료가 됩니다.' },
      ],
    },
  ],
};
```

- [ ] **Step 5: suspension.ts 작성 (영업정지 구제 10문항)** — 같은 패턴. 문항: ① 업종(음식점·주점/노래방·게임장/학원/기타 — ready, 업종별 근거법 note) ② 처분 단계(사전통지·의견제출 기간 중→**urgent**(lawRef '행정절차법 제21조', '의견제출 기한 안에 소명해야 처분 전 방어가 가능합니다')/확정 통지 받음→official/조사 중→ready) ③ 의견제출 기한(남음→documents/3일 이내 임박→**urgent**(행정절차법 제27조)/지남→official/해당 없음→ready) ④ 확정 통지 후 경과(30일 이내→ready(행정심판법 제27조 note)/30~60일→official/60~90일→**urgent**(행정심판법 제27조)/90일 지남→**urgent**(행정심판법 제27조, 110 안내)/해당 없음→ready) ⑤ 처분 사유(청소년 주류 제공/위생 위반/무허가·미신고/기타 — 각 official 또는 documents, 사유별 소명 포인트 note) ⑥ 위반 횟수(최초→ready/2차→official/3차 이상→official) ⑦ 생계 의존도(유일한 생계수단→documents(증빙 준비)/주요 수입원→documents/부수입→ready) ⑧ 집행 임박(정지 시작일 임박→**urgent**(lawRef '행정심판법 제30조', '집행정지 신청을 즉시 검토해야 합니다')/아직→ready/이미 정지 중→official) ⑨ 소명 증빙(CCTV·신분증 확인 기록 등)(있음→ready/일부→documents/없음→documents) ⑩ 과징금 전환(들어봤고 검토 원함→official('과징금 전환 가능 업종·요건은 근거법마다 다릅니다')/모름→official).

- [ ] **Step 6: veterans.ts 작성 (국가유공자 등록 9문항)** — 문항: ① 신청 대상(본인/가족·유족 — ready) ② 신청 유형(전상·공상/순직/보훈보상대상자/모름 — ready 또는 official, '국가유공자법과 보훈보상자법은 요건이 다릅니다' note) ③ 진행 단계(신청 전→ready/심사 중→official/비해당 결정 받음→official/재심의·행정심판 검토→official) ④ 비해당 결정 후 경과(해당 없음→ready/30일 이내→ready(lawRef '행정심판법 제27조')/30~90일→**urgent**(행정심판법 제27조)/90일 지남→**urgent**(행정심판법 제27조, 110 안내)) ⑤ 공무 관련성 자료(병상일지·사고경위서)(있음→ready/일부→documents/없음→documents/모름→official) ⑥ 의무기록(군병원·민간 진료기록)(확보→ready/일부→documents/없음→documents) ⑦ 현재 장애·치료 기록(있음→ready/없음→documents) ⑧ 과거 신청 이력(처음→ready/기각 1회→official('기각 사유 분석이 재신청의 출발점입니다')/기각 2회 이상→official) ⑨ 보훈부·보훈지청 상담 이력(있음→ready/없음→official('관할 보훈(지)청 사전 상담으로 필요 서류를 확정하세요')).

- [ ] **Step 7: checks/index.ts 작성**

```ts
// src/data/checks/index.ts
import type { CheckDefinition, CheckDomain } from '../../types/content';
import { dui } from './dui';
import { suspension } from './suspension';
import { veterans } from './veterans';

export const checks: Record<CheckDomain, CheckDefinition> = { dui, suspension, veterans };
```

- [ ] **Step 8: 테스트 통과 확인** — Run: `npx vitest run src/test/checkData.test.ts` → PASS

- [ ] **Step 9: checklist.md 체크, memory.md 기록**

---

### Task 5: 진단 분류 로직 (순수 함수)

**Files:**
- Create: `src/domain/diagnosis.ts`, `src/lib/browserStorage.ts`
- Test: `src/domain/diagnosis.test.ts`

- [ ] **Step 1: 실패하는 단위 테스트 작성**

```ts
// src/domain/diagnosis.test.ts
import { classifyAnswers, summarize, LEVEL_ORDER } from './diagnosis';
import { checks } from '../data/checks';

describe('진단 분류', () => {
  it('답변한 선택지의 분류·안내·법령을 결과 항목으로 만든다', () => {
    const answers = { 'dui-elapsed': 'd60to90' };
    const result = classifyAnswers(checks.dui, answers);
    const urgent = result.items.filter((i) => i.level === 'urgent');
    expect(urgent).toHaveLength(1);
    expect(urgent[0].lawRef).toBe('행정심판법 제27조');
    expect(urgent[0].questionText).toContain('통지서');
  });

  it('결과는 urgent → documents → official → ready 순으로 정렬된다', () => {
    const answers = {
      'dui-disposition': 'suspend',   // ready
      'dui-elapsed': 'over90',        // urgent
      'dui-evidence': 'partial',      // documents
      'dui-refusal': 'yes',           // official
    };
    const result = classifyAnswers(checks.dui, answers);
    const levels = result.items.map((i) => i.level);
    const sorted = [...levels].sort((a, b) => LEVEL_ORDER.indexOf(a) - LEVEL_ORDER.indexOf(b));
    expect(levels).toEqual(sorted);
    expect(levels[0]).toBe('urgent');
  });

  it('존재하지 않는 질문·선택지 답변은 무시한다', () => {
    const result = classifyAnswers(checks.dui, { 'fake-question': 'x', 'dui-bac': 'not-an-option' });
    expect(result.items).toHaveLength(0);
  });

  it('요약은 분야와 분류별 개수를 담는다', () => {
    const answers = { 'dui-elapsed': 'over90', 'dui-evidence': 'none' };
    const summary = summarize(checks.dui, classifyAnswers(checks.dui, answers));
    expect(summary.domain).toBe('dui');
    expect(summary.counts.urgent).toBe(1);
    expect(summary.counts.documents).toBe(1);
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `npx vitest run src/domain/diagnosis.test.ts` → FAIL

- [ ] **Step 3: diagnosis.ts 구현**

```ts
// src/domain/diagnosis.ts
import type { CheckDefinition, CheckDomain, ResultLevel } from '../types/content';

export const LEVEL_ORDER: ResultLevel[] = ['urgent', 'documents', 'official', 'ready'];

export interface ResultItem {
  questionId: string;
  questionText: string;
  answerLabel: string;
  level: ResultLevel;
  note: string;
  lawRef?: string;
}

export interface DiagnosisResult {
  items: ResultItem[];
}

export interface DiagnosisSummary {
  domain: CheckDomain;
  title: string;
  counts: Record<ResultLevel, number>;
}

export type Answers = Record<string, string>;

export function classifyAnswers(definition: CheckDefinition, answers: Answers): DiagnosisResult {
  const items: ResultItem[] = [];
  for (const question of definition.questions) {
    const optionId = answers[question.id];
    if (!optionId) continue;
    const option = question.options.find((o) => o.id === optionId);
    if (!option) continue;
    items.push({
      questionId: question.id,
      questionText: question.text,
      answerLabel: option.label,
      level: option.level,
      note: option.note,
      lawRef: option.lawRef,
    });
  }
  items.sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level));
  return { items };
}

export function summarize(definition: CheckDefinition, result: DiagnosisResult): DiagnosisSummary {
  const counts: Record<ResultLevel, number> = { urgent: 0, documents: 0, official: 0, ready: 0 };
  for (const item of result.items) counts[item.level] += 1;
  return { domain: definition.domain, title: definition.title, counts };
}
```

- [ ] **Step 4: browserStorage.ts 구현** — 비자진단 프로젝트의 `src/lib/browserStorage.ts`를 복사한다 (저장소 접근이 차단돼도 예외 없이 동작하는 안전 래퍼). 복사 후 `npm run typecheck`로 확인.

- [ ] **Step 5: 테스트 통과 확인** — Run: `npx vitest run src/domain/diagnosis.test.ts` → PASS

- [ ] **Step 6: checklist.md 체크, memory.md 기록**

---

### Task 6: 콘텐츠 데이터(업무분야·필요성·FAQ)와 금지 표현 검사

**Files:**
- Create: `src/data/services.ts`, `src/data/why.ts`, `src/data/faq.ts`
- Test: `src/test/forbiddenPhrases.test.ts`

- [ ] **Step 1: 실패하는 금지 표현 테스트 작성**

```ts
// src/test/forbiddenPhrases.test.ts
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const FORBIDDEN = ['100%', '１００％', '보장합니다', '보장해', '확실히 구제', '무조건', '성공률', '반드시 구제', '전액 환불'];

function collectFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return collectFiles(full);
    return /\.(ts|tsx|json)$/.test(name) && !/\.test\./.test(name) ? [full] : [];
  });
}

describe('금지 표현 검사 (행정사법 §21의2, 표시광고법)', () => {
  const targets = [...collectFiles(join(__dirname, '../data')), ...collectFiles(join(__dirname, '../pages'))];

  it('검사 대상 파일이 존재한다', () => {
    expect(targets.length).toBeGreaterThan(0);
  });

  it.each(FORBIDDEN)('콘텐츠에 "%s" 표현이 없다', (phrase) => {
    for (const file of targets) {
      const content = readFileSync(file, 'utf8');
      expect(content.includes(phrase), `${file}에 금지 표현 "${phrase}" 발견`).toBe(false);
    }
  });

  it('가상 후기 형식(별점·"OO님")을 사용하지 않는다', () => {
    for (const file of targets) {
      const content = readFileSync(file, 'utf8');
      expect(/OO\s*님|★{3,}/.test(content), `${file}에 후기 오인 형식 발견`).toBe(false);
    }
  });
});
```

주의: `src/pages`가 아직 없으면 `collectFiles`가 예외를 던진다. 이 테스트는 pages 폴더 생성(Task 7) 이후 전체 통과가 목표이며, 이 Task에서는 `src/pages` 빈 폴더를 미리 만들지 말고 `existsSync` 가드를 추가한다:

```ts
import { existsSync } from 'node:fs';
const targets = [join(__dirname, '../data'), join(__dirname, '../pages')]
  .filter((dir) => existsSync(dir))
  .flatMap((dir) => collectFiles(dir));
```

- [ ] **Step 2: services.ts 작성** — 6개 분야. 타입과 전체 콘텐츠:

```ts
// src/data/services.ts
import type { CheckDomain } from '../types/content';

export interface ServiceFaq { q: string; a: string }

export interface Service {
  slug: string;
  name: string;
  short: string;               // 홈 카드용 한 줄
  headline: string;            // 상세 페이지 제목
  target: string[];            // 이런 분께 필요합니다
  process: string[];           // 진행 절차
  deadlines?: string[];        // 법정 기한 (근거 조항 포함 문자열)
  documents: string[];         // 필요 서류 예시
  faqs: ServiceFaq[];
  checkDomain?: CheckDomain;   // 연결된 셀프 진단
  externalLink?: { label: string; url: string };  // 출입국 → 비자진단 사이트
}

export const services: Service[] = [
  {
    slug: 'dui',
    name: '음주운전 면허 구제',
    short: '면허 정지·취소 처분에 대한 이의신청·행정심판을 준비합니다.',
    headline: '음주운전 면허 정지·취소, 다툴 수 있는 기한이 정해져 있습니다',
    target: ['운전이 생계 수단인 분(화물·버스·택시·배달 등)', '면허 취소 통지를 받고 감경을 검토하는 분', '이의신청·행정심판 절차가 처음이라 막막한 분'],
    process: ['처분 통지서·적발 경위 확인', '감경 요건·배제 사유 검토', '생계·정상 참작 증빙 수집', '이의신청 또는 행정심판 청구서 작성·제출', '심리 대응과 결과 확인'],
    deadlines: ['이의신청: 처분 통지 후 60일 이내 (도로교통법 제94조)', '행정심판: 처분이 있음을 안 날부터 90일 이내 (행정심판법 제27조)'],
    documents: ['운전면허 취소·정지 결정통지서', '재직증명서·소득 증빙', '부양가족 증빙(가족관계증명서 등)', '표창·봉사활동 등 정상 참작 자료'],
    faqs: [
      { q: '벌금을 냈는데 면허 처분도 따로 다퉈야 하나요?', a: '네. 형사처벌(벌금)과 행정처분(면허)은 별개 절차입니다. 벌금 납부와 관계없이 면허 처분은 별도의 기한 안에 다퉈야 합니다.' },
      { q: '행정심판을 하면 결과가 나올 때까지 운전할 수 있나요?', a: '아닙니다. 청구만으로 처분 효력이 멈추지 않습니다. 사안에 따라 집행정지 신청을 함께 검토합니다(행정심판법 제30조).' },
      { q: '감경되면 어느 정도로 줄어드나요?', a: '취소 처분이 인용되는 경우 통상 110일 정지로 감경되는 예가 많습니다. 다만 결과는 사안별로 다르며 미리 단정할 수 없습니다.' },
    ],
    checkDomain: 'dui',
  },
  {
    slug: 'suspension',
    name: '영업정지 · 행정심판',
    short: '영업정지·과징금 처분의 사전 의견제출부터 행정심판까지 대응합니다.',
    headline: '영업정지 통지, 받은 날부터 대응 시계가 돌아갑니다',
    target: ['영업정지 사전통지(의견제출 안내)를 받은 자영업자', '청소년 주류 제공 등으로 처분이 확정된 업주', '영업이 유일한 생계 수단이라 집행을 늦춰야 하는 분'],
    process: ['처분 사유·근거 법령 확인', '의견제출서 또는 행정심판 청구 준비', '소명 증거(CCTV·확인 기록 등) 정리', '집행정지 신청 검토', '심리 대응과 결과 확인'],
    deadlines: ['의견제출: 사전통지서에 기재된 기한 이내 (행정절차법 제27조)', '행정심판: 처분이 있음을 안 날부터 90일 이내 (행정심판법 제27조)'],
    documents: ['처분 사전통지서 또는 처분서', '영업신고증·사업자등록증', 'CCTV 영상, 신분증 확인 기록 등 소명 자료', '매출·생계 의존도 증빙'],
    faqs: [
      { q: '사전통지 단계인데 그냥 기다리면 안 되나요?', a: '의견제출 기간은 처분이 확정되기 전에 소명할 수 있는 사실상 유일한 기회입니다. 기간이 지나면 예정된 내용대로 처분되는 경우가 많습니다.' },
      { q: '영업정지 대신 과징금으로 바꿀 수 있다고 들었습니다.', a: '업종과 위반 유형에 따라 과징금 전환이 가능한 경우가 있습니다. 근거 법령마다 요건이 달라 개별 확인이 필요합니다.' },
      { q: '정지 기간에 영업하면 어떻게 되나요?', a: '정지 기간 중 영업은 허가 취소 등 훨씬 무거운 처분 사유가 됩니다. 반드시 집행정지 등 적법한 절차로 대응해야 합니다.' },
    ],
    checkDomain: 'suspension',
  },
  {
    slug: 'license',
    name: '인허가 대리',
    short: '법인 설립, 공장 등록, 각종 영업 인허가 신청을 대행합니다.',
    headline: '반려 사유를 없애고 신청하는 것이 가장 빠른 길입니다',
    target: ['비영리법인·사단법인 설립을 준비하는 분', '공장 등록, 창고·물류 등 시설 인허가가 필요한 사업자', '서류 미비로 반려를 경험한 신청인'],
    process: ['요건·입지·결격 사유 사전 검토', '필요 서류 목록 확정과 수집', '신청서 작성·제출 대리', '보완 요구 대응', '허가증 수령 확인'],
    documents: ['사업계획서', '정관·임원 명부(법인)', '시설·입지 관련 증빙', '자격·경력 증빙'],
    faqs: [
      { q: '혼자 신청했다가 반려됐습니다. 다시 하면 되나요?', a: '재신청은 가능하지만 같은 사유로 다시 반려되면 시간만 잃습니다. 반려 사유를 정확히 해소한 뒤 신청하는 것이 중요합니다.' },
      { q: '인허가에 얼마나 걸리나요?', a: '법정 처리기간은 인허가 종류마다 다르고, 보완 요구가 있으면 늘어납니다. 사전 검토로 보완 가능성을 줄이는 것이 가장 효과적입니다.' },
    ],
  },
  {
    slug: 'immigration',
    name: '출입국 · 비자',
    short: '외국인 비자 발급·체류 자격 변경. 전용 비자 진단 센터에서 확인하세요.',
    headline: '비자 문제는 전용 진단 센터에서 더 자세히 안내합니다',
    target: ['비자 발급·연장·변경을 준비하는 외국인', '외국인 직원을 고용하려는 사업주', '결혼이민·영주·국적을 준비하는 가족'],
    process: ['비자 진단 센터에서 사전 점검', '요건·서류 확인', '상담 후 신청 진행'],
    documents: ['여권·외국인등록증', '체류 자격별 요건 서류'],
    faqs: [
      { q: '이 사이트에서도 비자 상담이 되나요?', a: '출입국 분야는 6개 비자 유형별 상세 가이드와 사전 점검을 제공하는 전용 사이트에서 안내합니다. 한국어 외 4개 언어도 지원합니다.' },
    ],
    externalLink: { label: '정명 비자 진단센터 바로가기', url: '/visa/' },
  },
  {
    slug: 'veterans',
    name: '국가보훈 등록',
    short: '국가유공자·보훈보상대상자 등록 신청과 비해당 결정 불복을 돕습니다.',
    headline: '국가를 위한 헌신, 기록으로 입증해야 인정받습니다',
    target: ['군 복무 중 다치거나 병을 얻은 본인·가족', '비해당 결정을 받고 재심의·행정심판을 검토하는 분', '오래된 기록 때문에 입증이 막막한 유족'],
    process: ['신청 유형(국가유공자/보훈보상대상자) 판단', '병상일지·의무기록 등 입증 자료 확보', '공무 관련성 입증 논리 구성', '등록 신청 또는 불복 절차 진행', '심의 결과 확인·후속 대응'],
    deadlines: ['비해당 결정 불복 행정심판: 결정을 안 날부터 90일 이내 (행정심판법 제27조)'],
    documents: ['병적증명서·전역증', '병상일지, 군 병원 진료기록', '민간 병원 진료기록·장애 진단서', '사고 경위 확인 자료(동료 진술 등)'],
    faqs: [
      { q: '수십 년 전 일인데 지금도 신청할 수 있나요?', a: '등록 신청 자체에는 기한이 없습니다. 다만 오래될수록 기록 확보가 어려워지므로 가능한 자료부터 빨리 확보하는 것이 중요합니다.' },
      { q: '한 번 기각됐으면 끝인가요?', a: '아닙니다. 기각 사유를 분석해 새로운 입증 자료를 보완하면 재신청·재심의·행정심판 등 후속 절차를 검토할 수 있습니다.' },
    ],
    checkDomain: 'veterans',
  },
  {
    slug: 'documents',
    name: '토지보상 · 내용증명 · 계약서',
    short: '수용 보상 협의, 내용증명 작성, 계약서 검토로 권리를 지킵니다.',
    headline: '문서로 남기지 않은 권리는 지키기 어렵습니다',
    target: ['공익사업으로 토지·건물 수용을 앞둔 소유자', '임대차·용역 분쟁에서 의사 표시를 남겨야 하는 분', '계약 체결 전 위험 조항을 확인하고 싶은 분'],
    process: ['사실관계·서류 검토', '문서 초안 작성', '검토·수정 협의', '발송·제출 및 후속 안내'],
    documents: ['등기부등본·토지대장(보상)', '기존 계약서·거래 증빙', '상대방과 주고받은 자료'],
    faqs: [
      { q: '내용증명을 보내면 법적 효력이 생기나요?', a: '내용증명 자체가 의무를 강제하지는 않습니다. 다만 의사 표시의 내용과 시점을 공적으로 증명해 이후 분쟁에서 중요한 증거가 됩니다.' },
      { q: '보상금이 적은 것 같은데 그냥 받아야 하나요?', a: '협의에 응하기 전 감정평가 내용을 검토하고, 이의신청·수용재결 등 단계별 불복 절차를 확인할 수 있습니다.' },
    ],
  },
];

export function findService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
```

`immigration.externalLink.url`은 비자진단 사이트 배포 주소가 정해지면 교체한다. 임시로 `/visa/`를 두고 `office.ts`처럼 배포 전 확인 목록에 포함한다.

- [ ] **Step 3: why.ts 작성** — `/why` 페이지 콘텐츠 전체:

```ts
// src/data/why.ts
export const why = {
  headline: '행정사는 언제, 왜 필요한가요?',
  intro: '행정 업무는 "서류 몇 장"처럼 보이지만, 실제로는 기한·요건·입증의 싸움입니다. 행정사는 행정사법 제2조에 따라 행정기관에 제출하는 서류의 작성과 제출 대행, 인허가 신청 대리, 행정심판 관련 서류 작성 등을 수행하는 국가자격 전문가입니다.',
  duties: {
    title: '행정사가 하는 일 (행정사법 제2조)',
    items: [
      '행정기관에 제출하는 서류(신청·청구·진정·건의 등)의 작성',
      '권리·의무나 사실 증명에 관한 서류의 작성',
      '행정기관의 업무에 관련된 서류의 제출 대행',
      '인가·허가·면허 등 신청·청구의 대리',
      '행정 관계 법령에 따른 상담 또는 자문',
    ],
  },
  when: {
    title: '이런 순간에 행정사가 필요합니다',
    items: [
      { situation: '처분 통지서를 받았을 때', detail: '이의신청 60일, 행정심판 90일 등 불복 기한은 통지를 받은 날부터 바로 줄어듭니다. 기한이 지나면 다툴 방법 자체가 사라집니다.' },
      { situation: '신청이 반복해서 반려될 때', detail: '반려 사유를 정확히 해소하지 못하면 몇 번을 다시 내도 결과는 같습니다. 요건 분석이 먼저입니다.' },
      { situation: '무엇을 입증해야 하는지 모를 때', detail: '같은 사실도 어떤 자료로 어떻게 입증하느냐에 따라 심사 결과가 달라집니다.' },
      { situation: '절차가 여러 기관에 걸쳐 있을 때', detail: '기관마다 요구 서류와 순서가 달라, 순서를 잘못 밟으면 처음부터 다시 해야 할 수 있습니다.' },
    ],
  },
  comparison: {
    title: '변호사·법무사와 무엇이 다른가요?',
    note: '분쟁이 소송 단계로 가면 변호사가, 등기·공탁은 법무사가 맡는 영역입니다. 행정기관을 상대로 한 신청·불복 절차는 행정사의 전문 영역이며, 일반적으로 소송 대비 비용 부담이 낮은 단계에서 문제를 해결하는 것을 목표로 합니다. 사안이 행정사의 업무 범위를 벗어나면 그 사실을 안내해 드립니다.',
    rows: [
      { role: '행정사', focus: '행정기관 제출 서류 작성·제출 대행, 인허가 대리, 행정심판 서류, 행정 상담' },
      { role: '변호사', focus: '소송 대리(행정소송 포함), 법률 자문 전반' },
      { role: '법무사', focus: '등기·공탁, 법원·검찰 제출 서류' },
    ],
  },
  diy: {
    title: '혼자 진행 vs 전문가와 진행',
    rows: [
      { aspect: '기한 관리', diy: '불복 기한·처리 기간을 스스로 추적해야 함', pro: '절차별 기한을 확인하고 일정에 맞춰 진행' },
      { aspect: '반려 위험', diy: '요건 해석을 놓치면 반려 후 처음부터 다시', pro: '반려 사유를 사전에 점검하고 보완 후 신청' },
      { aspect: '입증 자료', diy: '무엇이 유효한 증빙인지 판단이 어려움', pro: '심사 기준에 맞는 증빙 목록을 제시' },
      { aspect: '시간', diy: '기관 방문·서류 재발급 반복', pro: '준비 단계에서 누락을 줄여 왕복을 최소화' },
    ],
    note: '모든 사안에 전문가가 필요한 것은 아닙니다. 단순 민원은 직접 처리하는 것이 낫고, 기한이 걸린 불복·입증이 필요한 사안일수록 전문가 조력의 가치가 커집니다.',
  },
  misconceptions: {
    title: '흔한 오해',
    items: [
      { myth: '"행정사는 그냥 서류 대필하는 곳 아닌가요?"', fact: '서류 작성은 결과물일 뿐입니다. 핵심은 요건 분석, 기한 관리, 입증 설계입니다.' },
      { myth: '"어차피 결과는 정해져 있지 않나요?"', fact: '같은 사안도 소명과 증빙에 따라 결과가 달라질 수 있습니다. 다만 결과를 미리 보장할 수 있는 사람은 아무도 없으며, 그렇게 말하는 곳을 오히려 주의해야 합니다.' },
      { myth: '"기한이 지나도 사정을 말하면 봐주지 않나요?"', fact: '법정 기한 도과는 원칙적으로 구제가 어렵습니다. 예외는 매우 제한적이므로 기한 안에 움직이는 것이 최선입니다.' },
    ],
  },
};
```

- [ ] **Step 4: faq.ts 작성** — 홈 FAQ 6개:

```ts
// src/data/faq.ts
export const homeFaqs = [
  { q: '상담은 언제부터 가능한가요?', a: '현재 개업 준비 중으로, 상담·수임 접수는 정식 개업 후 시작됩니다. 개업 전에는 셀프 진단과 분야별 가이드를 이용해 주세요.' },
  { q: '셀프 진단 결과는 얼마나 정확한가요?', a: '진단은 답변을 정리해 확인이 필요한 항목을 보여주는 일반 정보 도구입니다. 처분 결과나 인용 여부에 대한 판단이 아니며, 최종 판단은 관할 기관이 합니다.' },
  { q: '진단에서 입력한 내용이 저장되나요?', a: '답변은 현재 브라우저 세션에만 저장되며 서버로 전송하지 않습니다. 탭을 닫으면 사라집니다.' },
  { q: '행정심판 기한이 이미 지난 것 같아요.', a: '기한 도과 여부와 예외 인정 가능성은 중앙행정심판위원회(국번 없이 110) 또는 관할 기관에서 바로 확인하실 수 있습니다. 개업을 기다리지 마시고 즉시 확인하세요.' },
  { q: '비용은 어떻게 되나요?', a: '수임료는 사안의 난이도와 범위에 따라 다르며, 개업 후 상담 시 서면으로 안내드립니다. 착수 전에 범위와 비용을 명확히 정하는 것을 원칙으로 합니다.' },
  { q: '변호사를 선임해야 하는 사안인지 모르겠어요.', a: '소송 단계이거나 형사 변호가 필요한 사안은 변호사의 영역입니다. 상담 과정에서 행정사 업무 범위를 벗어나는 사안은 그 사실을 안내해 드립니다.' },
];
```

- [ ] **Step 5: 테스트 통과 확인** — Run: `npx vitest run src/test/forbiddenPhrases.test.ts` → PASS (services.ts의 "110일 정지로 감경되는 예가 많습니다"처럼 단정 표현이 아닌지 재확인)

- [ ] **Step 6: checklist.md 체크, memory.md 기록**

---

### Task 7: 라우팅과 홈 페이지

**Files:**
- Create: `src/app/AppRouter.tsx`, `src/pages/HomePage.tsx`, `src/pages/NotFoundPage.tsx`
- Modify: `src/App.tsx`
- Test: `src/test/routing.test.tsx`

- [ ] **Step 1: 실패하는 라우팅 테스트 작성**

```tsx
// src/test/routing.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from '../app/AppRouter';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRouter />
    </MemoryRouter>,
  );
}

describe('라우팅', () => {
  it('홈에는 진단 진입과 행정사 필요성 안내가 있다', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByText(/셀프 진단/).length).toBeGreaterThan(0);
    expect(screen.getByText(/행정사가 필요한 이유/)).toBeInTheDocument();
  });

  it('없는 주소는 404와 복구 경로를 보여준다', () => {
    renderAt('/no-such-page');
    expect(screen.getByText(/페이지를 찾을 수 없습니다/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /홈으로/ })).toHaveAttribute('href', '/');
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `npx vitest run src/test/routing.test.tsx` → FAIL

- [ ] **Step 3: AppRouter.tsx 구현** (이후 Task에서 라우트가 추가될 뼈대)

```tsx
// src/app/AppRouter.tsx
import { Route, Routes } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';

export function AppRouter() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
```

App.tsx 교체:

```tsx
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './app/AppRouter';

export function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
```

- [ ] **Step 4: HomePage.tsx 구현** — 섹션 순서와 핵심 카피:

```tsx
// src/pages/HomePage.tsx
import { Link } from 'react-router-dom';
import { services } from '../data/services';
import { homeFaqs } from '../data/faq';
import { checks } from '../data/checks';
import { ConsultCta } from '../components/ConsultCta';

export function HomePage() {
  return (
    <>
      <section className="hero page-shell">
        <p className="eyebrow">정명(正明) 행정사사무소</p>
        <h1>영업정지 통지, 면허 취소, 반려된 신청 —<br />행정 문제는 기한 싸움입니다.</h1>
        <p className="hero__intro">
          처분을 다툴 수 있는 기간은 법으로 정해져 있습니다. 내 상황에서 무엇을,
          언제까지 확인해야 하는지 셀프 진단으로 먼저 정리해 보세요.
        </p>
        <div className="button-row">
          <Link className="button button--accent" to="/check">셀프 진단 시작 →</Link>
          <Link className="button button--ghost" to="/why">행정사가 필요한 이유</Link>
        </div>
        <ul className="trust-list">
          <li>✓ 결과는 처분·인용 여부에 대한 판단이 아닌 일반 정보입니다</li>
          <li>✓ 답변은 브라우저에만 저장되며 서버로 전송하지 않습니다</li>
        </ul>
      </section>

      <section className="section page-shell" aria-labelledby="check-heading">
        <h2 id="check-heading">3분 셀프 진단</h2>
        <p>지금 확인이 급한 대표 3개 분야입니다.</p>
        <div className="grid-3">
          {Object.values(checks).map((def) => (
            <article className="card" key={def.domain}>
              <h3>{def.title}</h3>
              <p>{def.intro}</p>
              <Link className="button button--primary" to={`/check/${def.domain}`}>진단 시작 →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section page-shell" id="services" aria-labelledby="services-heading">
        <h2 id="services-heading">업무 분야</h2>
        <div className="grid-3">
          {services.map((s) => (
            <article className="card" key={s.slug}>
              <h3>{s.name}</h3>
              <p>{s.short}</p>
              <Link to={`/services/${s.slug}`}>자세히 보기 →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--tinted">
        <div className="page-shell">
          <h2>왜 전문가와 함께해야 하나요?</h2>
          <p>
            행정 절차는 한 번 기한을 놓치거나 요건을 잘못 짚으면 되돌리기 어렵습니다.
            행정사가 하는 일과, 혼자 진행할 때와의 차이를 정리했습니다.
          </p>
          <Link className="button button--ghost" to="/why">행정사가 필요한 이유 보기 →</Link>
        </div>
      </section>

      <section className="section page-shell" aria-labelledby="process-heading">
        <h2 id="process-heading">진행 절차</h2>
        <ol className="process-grid">
          <li><span>1</span><h3>셀프 진단·상담</h3><p>상황과 기한을 확인하고 진행 방향을 정합니다.</p></li>
          <li><span>2</span><h3>서류 준비·작성</h3><p>요건에 맞는 증빙을 수집하고 서류를 작성합니다.</p></li>
          <li><span>3</span><h3>제출·결과 확인</h3><p>제출을 대행하고 보완 요구와 결과에 대응합니다.</p></li>
        </ol>
      </section>

      <section className="section page-shell faq-section" aria-labelledby="faq-heading">
        <h2 id="faq-heading">자주 묻는 질문</h2>
        <div className="faq-list">
          {homeFaqs.map((faq) => (
            <details key={faq.q}>
              <summary>{faq.q}</summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section page-shell">
        <ConsultCta />
      </section>
    </>
  );
}
```

- [ ] **Step 5: NotFoundPage.tsx 구현**

```tsx
// src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="page-shell section narrow-page">
      <h1>페이지를 찾을 수 없습니다</h1>
      <p>주소가 바뀌었거나 잘못 입력되었을 수 있습니다.</p>
      <div className="button-row">
        <Link className="button button--primary" to="/">홈으로 돌아가기</Link>
        <Link className="button button--ghost" to="/check">셀프 진단</Link>
        <Link className="button button--ghost" to="/consult">상담 안내</Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: 테스트 통과 확인** — Run: `npx vitest run` (전체) → PASS. 금지 표현 테스트가 pages 폴더도 검사하기 시작하는 시점이다.

- [ ] **Step 7: `npm run dev`로 홈 화면 수동 확인** (레이아웃·모바일 메뉴), checklist.md 체크, memory.md 기록

---

### Task 8: 행정사 필요성 페이지와 업무분야 상세 페이지

**Files:**
- Create: `src/pages/WhyPage.tsx`, `src/pages/ServicePage.tsx`
- Modify: `src/app/AppRouter.tsx`
- Test: `src/test/infoPages.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

```tsx
// src/test/infoPages.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from '../app/AppRouter';
import { services } from '../data/services';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRouter />
    </MemoryRouter>,
  );
}

describe('정보 페이지', () => {
  it('/why는 업무 범위·비교표·오해 바로잡기를 보여준다', () => {
    renderAt('/why');
    expect(screen.getByText(/행정사법 제2조/)).toBeInTheDocument();
    expect(screen.getByText(/변호사/)).toBeInTheDocument();
    expect(screen.getByText(/흔한 오해/)).toBeInTheDocument();
  });

  it.each(services.map((s) => s.slug))('/services/%s 상세 페이지가 열린다', (slug) => {
    renderAt(`/services/${slug}`);
    const service = services.find((s) => s.slug === slug)!;
    expect(screen.getByRole('heading', { level: 1, name: service.headline })).toBeInTheDocument();
  });

  it('진단이 연결된 분야는 진단 버튼, 출입국은 외부 링크를 보여준다', () => {
    renderAt('/services/dui');
    expect(screen.getByRole('link', { name: /진단/ })).toHaveAttribute('href', '/check/dui');
    renderAt('/services/immigration');
    expect(screen.getByRole('link', { name: /비자 진단센터/ })).toBeInTheDocument();
  });

  it('없는 분야 slug는 404를 보여준다', () => {
    renderAt('/services/nope');
    expect(screen.getByText(/페이지를 찾을 수 없습니다/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `npx vitest run src/test/infoPages.test.tsx` → FAIL

- [ ] **Step 3: WhyPage.tsx 구현** — `why.ts` 데이터 렌더링: intro, duties 리스트, when 카드 4개, comparison 표(`<table>`, caption 포함), diy 비교 표, misconceptions(myth/fact), 마지막에 `<ConsultCta />`.

```tsx
// src/pages/WhyPage.tsx
import { why } from '../data/why';
import { ConsultCta } from '../components/ConsultCta';

export function WhyPage() {
  return (
    <div className="page-shell section">
      <header className="page-header">
        <h1>{why.headline}</h1>
        <p>{why.intro}</p>
      </header>

      <section aria-labelledby="duties">
        <h2 id="duties">{why.duties.title}</h2>
        <ul className="check-list">
          {why.duties.items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section aria-labelledby="when">
        <h2 id="when">{why.when.title}</h2>
        <div className="grid-2">
          {why.when.items.map((item) => (
            <article className="card" key={item.situation}>
              <h3>{item.situation}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="comparison">
        <h2 id="comparison">{why.comparison.title}</h2>
        <div className="table-scroll">
          <table>
            <caption className="sr-only">행정사·변호사·법무사 역할 비교</caption>
            <thead><tr><th scope="col">자격</th><th scope="col">주요 영역</th></tr></thead>
            <tbody>
              {why.comparison.rows.map((row) => (
                <tr key={row.role}><th scope="row">{row.role}</th><td>{row.focus}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note">{why.comparison.note}</p>
      </section>

      <section aria-labelledby="diy">
        <h2 id="diy">{why.diy.title}</h2>
        <div className="table-scroll">
          <table>
            <caption className="sr-only">혼자 진행과 전문가 조력 비교</caption>
            <thead><tr><th scope="col">항목</th><th scope="col">혼자 진행</th><th scope="col">전문가와 진행</th></tr></thead>
            <tbody>
              {why.diy.rows.map((row) => (
                <tr key={row.aspect}><th scope="row">{row.aspect}</th><td>{row.diy}</td><td>{row.pro}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note">{why.diy.note}</p>
      </section>

      <section aria-labelledby="myths">
        <h2 id="myths">{why.misconceptions.title}</h2>
        {why.misconceptions.items.map((item) => (
          <details key={item.myth}>
            <summary>{item.myth}</summary>
            <p>{item.fact}</p>
          </details>
        ))}
      </section>

      <ConsultCta />
    </div>
  );
}
```

- [ ] **Step 4: ServicePage.tsx 구현** — `useParams`로 slug 조회, 없으면 `<NotFoundPage />` 렌더. 섹션: headline(h1) → 이런 분께(target) → 진행 절차(process, ol) → 법정 기한(deadlines가 있으면 경고 스타일 card) → 필요 서류(documents) → FAQ(details) → 하단 CTA(checkDomain 있으면 `/check/${checkDomain}`으로 "내 상황 진단하기", externalLink 있으면 해당 `<a>`, 둘 다 없으면 `<ConsultCta />`).

```tsx
// src/pages/ServicePage.tsx
import { Link, useParams } from 'react-router-dom';
import { findService } from '../data/services';
import { ConsultCta } from '../components/ConsultCta';
import { NotFoundPage } from './NotFoundPage';

export function ServicePage() {
  const { slug } = useParams();
  const service = slug ? findService(slug) : undefined;
  if (!service) return <NotFoundPage />;

  return (
    <div className="page-shell section">
      <header className="page-header">
        <p className="eyebrow">{service.name}</p>
        <h1>{service.headline}</h1>
      </header>

      <section aria-labelledby="target">
        <h2 id="target">이런 분께 필요합니다</h2>
        <ul className="check-list">{service.target.map((t) => <li key={t}>{t}</li>)}</ul>
      </section>

      {service.deadlines && (
        <section className="card level-urgent" aria-labelledby="deadlines">
          <h2 id="deadlines">법정 기한 — 지나면 다툴 수 없습니다</h2>
          <ul>{service.deadlines.map((d) => <li key={d}>{d}</li>)}</ul>
        </section>
      )}

      <section aria-labelledby="process">
        <h2 id="process">진행 절차</h2>
        <ol className="process-list">{service.process.map((p) => <li key={p}>{p}</li>)}</ol>
      </section>

      <section aria-labelledby="documents">
        <h2 id="documents">필요 서류 예시</h2>
        <ul>{service.documents.map((d) => <li key={d}>{d}</li>)}</ul>
      </section>

      <section aria-labelledby="faq">
        <h2 id="faq">자주 묻는 질문</h2>
        {service.faqs.map((faq) => (
          <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>
        ))}
      </section>

      {service.checkDomain ? (
        <div className="center-actions">
          <Link className="button button--accent" to={`/check/${service.checkDomain}`}>
            내 상황 셀프 진단하기 →
          </Link>
        </div>
      ) : service.externalLink ? (
        <div className="center-actions">
          <a className="button button--accent" href={service.externalLink.url}>
            {service.externalLink.label} →
          </a>
        </div>
      ) : (
        <ConsultCta />
      )}
    </div>
  );
}
```

- [ ] **Step 5: AppRouter에 라우트 추가**

```tsx
<Route path="/why" element={<WhyPage />} />
<Route path="/services/:slug" element={<ServicePage />} />
```

- [ ] **Step 6: 테스트 통과 확인** — Run: `npx vitest run` → 전체 PASS

- [ ] **Step 7: checklist.md 체크, memory.md 기록**

---

### Task 9: 셀프 진단 흐름 (선택 → 질문 → 결과)

**Files:**
- Create: `src/pages/CheckSelectPage.tsx`, `src/pages/CheckPage.tsx`, `src/pages/CheckResultPage.tsx`
- Modify: `src/app/AppRouter.tsx`
- Test: `src/test/checkFlow.test.tsx`

- [ ] **Step 1: 실패하는 흐름 테스트 작성**

```tsx
// src/test/checkFlow.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from '../app/AppRouter';
import { checks } from '../data/checks';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRouter />
    </MemoryRouter>,
  );
}

describe('진단 흐름', () => {
  beforeEach(() => sessionStorage.clear());

  it('/check에서 3개 진단을 고를 수 있다', () => {
    renderAt('/check');
    for (const def of Object.values(checks)) {
      expect(screen.getByRole('link', { name: new RegExp(def.title) })).toBeInTheDocument();
    }
  });

  it('질문에 모두 답하면 결과 페이지로 이동한다', async () => {
    const user = userEvent.setup();
    renderAt('/check/dui');
    const total = checks.dui.questions.length;
    for (let i = 0; i < total; i += 1) {
      const options = await screen.findAllByRole('radio');
      await user.click(options[0]);
      await user.click(screen.getByRole('button', { name: /다음|결과 보기/ }));
    }
    expect(await screen.findByText(/진단 결과/)).toBeInTheDocument();
  });

  it('긴급 답변이 있으면 결과 상단에 긴급 확인과 110 안내가 나온다', async () => {
    const user = userEvent.setup();
    renderAt('/check/dui');
    // 3번째 질문(dui-elapsed)에서 '90일이 지남' 선택, 나머지는 첫 선택지
    const total = checks.dui.questions.length;
    for (let i = 0; i < total; i += 1) {
      const question = checks.dui.questions[i];
      if (question.id === 'dui-elapsed') {
        await user.click(await screen.findByRole('radio', { name: /90일이 지남/ }));
      } else {
        const options = await screen.findAllByRole('radio');
        await user.click(options[0]);
      }
      await user.click(screen.getByRole('button', { name: /다음|결과 보기/ }));
    }
    expect(await screen.findByText(/긴급 확인/)).toBeInTheDocument();
    expect(screen.getByText(/110/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /상담/ })).toHaveAttribute('href', '/consult');
  });

  it('답변 없이 결과 주소로 직행하면 진단 시작을 안내한다', () => {
    renderAt('/check/dui/result');
    expect(screen.getByText(/진단을 먼저 진행해 주세요/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `npx vitest run src/test/checkFlow.test.tsx` → FAIL

- [ ] **Step 3: CheckSelectPage.tsx 구현**

```tsx
// src/pages/CheckSelectPage.tsx
import { Link } from 'react-router-dom';
import { checks } from '../data/checks';

export function CheckSelectPage() {
  return (
    <div className="page-shell section">
      <header className="page-header">
        <h1>셀프 진단</h1>
        <p>
          답변을 바탕으로 확인이 필요한 항목을 4단계(긴급 확인 · 서류 보완 · 공식 확인 · 확인됨)로
          정리합니다. 결과는 일반 정보이며 법률 자문이 아닙니다. 답변은 브라우저에만 저장됩니다.
        </p>
      </header>
      <div className="grid-3">
        {Object.values(checks).map((def) => (
          <article className="card" key={def.domain}>
            <h2>{def.title}</h2>
            <p>{def.intro}</p>
            <p className="note">{def.questions.length}개 문항 · 약 3분</p>
            <Link className="button button--primary" to={`/check/${def.domain}`}>{def.title} 시작 →</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: CheckPage.tsx 구현** — 핵심 동작: 한 화면에 한 문항, 라디오 그룹(`fieldset`/`legend`), 진행률 표시(`aria-valuenow`), 이전/다음, 마지막 문항에서 "결과 보기" → 답변을 `sessionStorage`(`check:{domain}` 키)에 저장하고 `/check/{domain}/result`로 navigate. 없는 domain이면 NotFoundPage.

```tsx
// src/pages/CheckPage.tsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { checks } from '../data/checks';
import type { CheckDomain } from '../types/content';
import { safeSessionSet } from '../lib/browserStorage';
import { NotFoundPage } from './NotFoundPage';

export function CheckPage() {
  const { domain } = useParams();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const definition = domain && domain in checks ? checks[domain as CheckDomain] : undefined;
  if (!definition) return <NotFoundPage />;

  const question = definition.questions[index];
  const total = definition.questions.length;
  const selected = answers[question.id];
  const isLast = index === total - 1;

  function goNext() {
    if (!selected) return;
    if (isLast) {
      safeSessionSet(`check:${definition.domain}`, JSON.stringify(answers));
      navigate(`/check/${definition.domain}/result`);
    } else {
      setIndex((i) => i + 1);
    }
  }

  return (
    <div className="page-shell section narrow-page">
      <h1>{definition.title}</h1>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
        aria-label={`전체 ${total}문항 중 ${index + 1}번째`}
        className="progress"
      >
        <span style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>

      <fieldset className="question-card card">
        <legend>{index + 1}. {question.text}</legend>
        {question.help && <p className="note">{question.help}</p>}
        {question.options.map((option) => (
          <label key={option.id} className="option-row">
            <input
              type="radio"
              name={question.id}
              value={option.id}
              checked={selected === option.id}
              onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: option.id }))}
            />
            {option.label}
          </label>
        ))}
      </fieldset>

      <div className="button-row">
        <button className="button button--ghost" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
          이전
        </button>
        <button className="button button--primary" disabled={!selected} onClick={goNext}>
          {isLast ? '결과 보기' : '다음'}
        </button>
      </div>
    </div>
  );
}
```

`browserStorage.ts`에 `safeSessionSet`/`safeSessionGet`이 없으면(비자진단 원본 함수명이 다르면) 원본 함수명에 맞춰 이 파일의 호출부를 수정한다. 원본에 그대로 있으면 그대로 쓴다.

- [ ] **Step 5: CheckResultPage.tsx 구현** — sessionStorage에서 답변을 읽어 `classifyAnswers` 실행. 답변이 없으면 "진단을 먼저 진행해 주세요" + 시작 링크. 결과 화면 구성: ① 분류별 그룹(긴급 확인이 있으면 최상단, `level-urgent` 스타일, 110·관할기관 안내 문구 포함) ② 각 항목에 answerLabel, note, lawRef ③ 하단 고정 안내("이 결과는 일반 정보이며…") ④ "이 진단 결과로 상담 안내 보기" 버튼(요약을 `consult:summary` 키로 저장 후 `/consult` 링크) ⑤ "다시 진단하기".

```tsx
// src/pages/CheckResultPage.tsx
import { Link, useParams } from 'react-router-dom';
import { checks } from '../data/checks';
import type { CheckDomain, ResultLevel } from '../types/content';
import { classifyAnswers, summarize, LEVEL_ORDER } from '../domain/diagnosis';
import { safeSessionGet, safeSessionSet } from '../lib/browserStorage';
import { NotFoundPage } from './NotFoundPage';

const LEVEL_LABEL: Record<ResultLevel, string> = {
  urgent: '긴급 확인',
  documents: '서류 보완',
  official: '공식 확인',
  ready: '확인됨',
};

export function CheckResultPage() {
  const { domain } = useParams();
  const definition = domain && domain in checks ? checks[domain as CheckDomain] : undefined;
  if (!definition) return <NotFoundPage />;

  const raw = safeSessionGet(`check:${definition.domain}`);
  if (!raw) {
    return (
      <div className="page-shell section narrow-page">
        <h1>진단 결과</h1>
        <p>저장된 답변이 없습니다. 진단을 먼저 진행해 주세요.</p>
        <Link className="button button--primary" to={`/check/${definition.domain}`}>진단 시작 →</Link>
      </div>
    );
  }

  const answers = JSON.parse(raw) as Record<string, string>;
  const result = classifyAnswers(definition, answers);
  const summary = summarize(definition, result);
  const grouped = LEVEL_ORDER.map((level) => ({
    level,
    items: result.items.filter((i) => i.level === level),
  })).filter((g) => g.items.length > 0);

  function saveSummaryForConsult() {
    safeSessionSet('consult:summary', JSON.stringify(summary));
  }

  return (
    <div className="page-shell section narrow-page">
      <h1>진단 결과 — {definition.title}</h1>

      {summary.counts.urgent > 0 && (
        <section className="card level-urgent">
          <h2>지금 바로 확인이 필요합니다</h2>
          <p>
            법정 기한과 관련된 항목이 있습니다. 이 사이트의 개업을 기다리지 마시고
            중앙행정심판위원회(국번 없이 110) 또는 관할 기관에 즉시 확인하세요.
          </p>
        </section>
      )}

      {grouped.map((group) => (
        <section key={group.level} className={`result-group level-${group.level}`}>
          <h2>{LEVEL_LABEL[group.level]} ({group.items.length})</h2>
          {group.items.map((item) => (
            <article className="card" key={item.questionId}>
              <h3>{item.questionText}</h3>
              <p className="answer">내 답변: {item.answerLabel}</p>
              <p>{item.note}</p>
              {item.lawRef && <p className="law-ref">근거: {item.lawRef}</p>}
            </article>
          ))}
        </section>
      ))}

      <p className="note">
        이 결과는 답변을 정리한 일반 정보이며, 처분·인용 여부에 대한 판단이나 법률 자문이 아닙니다.
        최종 판단은 관할 기관이 합니다.
      </p>

      <div className="button-row">
        <Link className="button button--accent" to="/consult" onClick={saveSummaryForConsult}>
          이 진단 결과로 상담 안내 보기 →
        </Link>
        <Link className="button button--ghost" to={`/check/${definition.domain}`}>다시 진단하기</Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: AppRouter에 라우트 추가**

```tsx
<Route path="/check" element={<CheckSelectPage />} />
<Route path="/check/:domain" element={<CheckPage />} />
<Route path="/check/:domain/result" element={<CheckResultPage />} />
```

- [ ] **Step 7: 테스트 통과 확인** — Run: `npx vitest run` → 전체 PASS

- [ ] **Step 8: `npm run dev`에서 3개 진단을 끝까지 눌러보고 긴급 분기 확인**, checklist.md 체크, memory.md 기록

---

### Task 10: 상담 페이지와 고지 페이지

**Files:**
- Create: `src/pages/ConsultPage.tsx`, `src/pages/PrivacyPage.tsx`, `src/pages/DisclaimerPage.tsx`
- Modify: `src/app/AppRouter.tsx`
- Test: `src/test/consultPage.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

```tsx
// src/test/consultPage.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from '../app/AppRouter';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRouter />
    </MemoryRouter>,
  );
}

describe('상담 페이지 (개업 전)', () => {
  beforeEach(() => sessionStorage.clear());

  it('개업 전에는 접수 불가 안내와 비활성 폼을 보여준다', () => {
    renderAt('/consult');
    expect(screen.getByText(/개업 후 시작됩니다/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /상담 신청/ })).toBeDisabled();
    expect(screen.queryByText(/02-1234/)).toBeNull();
  });

  it('진단 요약이 있으면 상담 내용에 미리 채운다', () => {
    sessionStorage.setItem('consult:summary', JSON.stringify({
      domain: 'dui', title: '음주운전 면허 구제 사전 점검',
      counts: { urgent: 1, documents: 2, official: 0, ready: 3 },
    }));
    renderAt('/consult');
    expect(screen.getByLabelText(/상담 내용/)).toHaveValue(
      expect.stringContaining('음주운전') as unknown as string,
    );
  });

  it('긴급 대안 채널(110)을 안내한다', () => {
    renderAt('/consult');
    expect(screen.getByText(/110/)).toBeInTheDocument();
  });
});
```

`toHaveValue`에 stringContaining을 쓸 수 없으면 `(screen.getByLabelText(/상담 내용/) as HTMLTextAreaElement).value`를 직접 검사하는 방식으로 작성한다.

- [ ] **Step 2: 실패 확인** — Run: `npx vitest run src/test/consultPage.test.tsx` → FAIL

- [ ] **Step 3: ConsultPage.tsx 구현** — 구성: ① 개업 준비 중 안내(카드) ② 개업 후 제공 채널 소개(전화·카카오톡·온라인 폼 — `isAcceptingRequests(office)`에 따라 실제 버튼 또는 준비 중 상태) ③ 상담 신청 폼(이름·연락처·분야 select·상담 내용 textarea·개인정보 동의 체크박스; 개업 전엔 전부 disabled + 제출 버튼 disabled; 개업 후엔 `office.formEndpoint`로 POST) ④ 진단 요약 프리필(`consult:summary` 읽어 textarea 초기값에 "[셀프 진단 요약] 음주운전 면허 구제 사전 점검 — 긴급 확인 1, 서류 보완 2 …" 형식) ⑤ 긴급 채널 패널(110, 관할 기관).

```tsx
// src/pages/ConsultPage.tsx
import { useState } from 'react';
import { office, isAcceptingRequests } from '../data/office';
import { safeSessionGet } from '../lib/browserStorage';
import type { ResultLevel } from '../types/content';

const LEVEL_LABEL: Record<ResultLevel, string> = {
  urgent: '긴급 확인', documents: '서류 보완', official: '공식 확인', ready: '확인됨',
};

function buildPrefill(): string {
  const raw = safeSessionGet('consult:summary');
  if (!raw) return '';
  try {
    const summary = JSON.parse(raw) as { title: string; counts: Record<ResultLevel, number> };
    const parts = (Object.keys(summary.counts) as ResultLevel[])
      .filter((level) => summary.counts[level] > 0)
      .map((level) => `${LEVEL_LABEL[level]} ${summary.counts[level]}`);
    return `[셀프 진단 요약] ${summary.title} — ${parts.join(', ')}\n\n추가로 궁금한 내용: `;
  } catch {
    return '';
  }
}

export function ConsultPage() {
  const accepting = isAcceptingRequests(office);
  const [message, setMessage] = useState(buildPrefill);

  return (
    <div className="page-shell section narrow-page">
      <header className="page-header">
        <h1>상담 안내</h1>
      </header>

      {!accepting && (
        <section className="card">
          <h2>상담·수임 접수는 개업 후 시작됩니다</h2>
          <p>
            현재 개업 준비 중으로 접수 중인 상담·대행 서비스가 없습니다.
            개업과 필수 고지(등록번호·연락처 게시) 준비가 끝나면 이 페이지에서 바로 신청하실 수 있습니다.
          </p>
        </section>
      )}

      <section aria-labelledby="channels">
        <h2 id="channels">상담 채널</h2>
        <div className="grid-3">
          <article className="card">
            <h3>전화 상담</h3>
            {accepting && office.phone
              ? <a className="button button--primary" href={`tel:${office.phone}`}>{office.phone}</a>
              : <p className="note">개업 후 공개됩니다.</p>}
          </article>
          <article className="card">
            <h3>카카오톡 채널</h3>
            {accepting && office.kakaoChannelUrl
              ? <a className="button button--primary" href={office.kakaoChannelUrl}>카카오톡으로 문의</a>
              : <p className="note">개업 후 공개됩니다.</p>}
          </article>
          <article className="card">
            <h3>온라인 신청</h3>
            <p className="note">아래 폼으로 신청하시면 연락드립니다. {!accepting && '(개업 후 활성화)'}</p>
          </article>
        </div>
      </section>

      <form
        className="card consult-form"
        onSubmit={(event) => {
          event.preventDefault();
          // 개업 후: office.formEndpoint로 fetch POST. 개업 전에는 제출 자체가 비활성.
        }}
      >
        <h2>상담 신청</h2>
        <label>성함<input type="text" name="name" required disabled={!accepting} /></label>
        <label>연락처<input type="tel" name="phone" required disabled={!accepting} /></label>
        <label>분야
          <select name="topic" disabled={!accepting}>
            <option>음주운전 면허 구제</option>
            <option>영업정지 · 행정심판</option>
            <option>인허가</option>
            <option>출입국 · 비자</option>
            <option>국가보훈</option>
            <option>토지보상 · 내용증명 · 계약서</option>
          </select>
        </label>
        <label>상담 내용
          <textarea
            name="message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!accepting}
          />
        </label>
        <label className="agree">
          <input type="checkbox" required disabled={!accepting} />
          개인정보 수집·이용에 동의합니다 (상담 회신 목적, 회신 후 파기)
        </label>
        <button className="button button--accent" type="submit" disabled={!accepting}>
          상담 신청하기
        </button>
        {!accepting && <p className="note">개업 전에는 신청이 접수되지 않습니다.</p>}
      </form>

      <section className="card level-urgent">
        <h2>기한이 임박했다면 기다리지 마세요</h2>
        <p>
          행정심판 기한 등 긴급한 사안은 중앙행정심판위원회(국번 없이 110) 또는
          해당 처분을 한 기관에 바로 확인하실 수 있습니다.
        </p>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: PrivacyPage.tsx 구현** — 실제 동작과 일치하는 내용만: 진단 답변·진단 요약은 브라우저 세션 저장소에만 보관, 서버 전송 없음, 쿠키·분석 도구 미사용, 상담 폼은 개업 후 활성화되며 그 시점에 수집 항목·보관 기간을 고지하고 동의를 받음. DisclaimerPage.tsx — 일반 정보 제공 목적, 법률 자문 아님, 결과 미보장, 최종 판단은 관할 기관, 긴급 시 110 안내(`tel:110` 링크).

- [ ] **Step 5: AppRouter에 라우트 추가**

```tsx
<Route path="/consult" element={<ConsultPage />} />
<Route path="/privacy" element={<PrivacyPage />} />
<Route path="/disclaimer" element={<DisclaimerPage />} />
```

- [ ] **Step 6: 테스트 통과 확인** — Run: `npx vitest run` → 전체 PASS

- [ ] **Step 7: checklist.md 체크, memory.md 기록**

---

### Task 11: 접근성·배포 설정·최종 검증

**Files:**
- Create: `public/_redirects`, `vercel.json`, `scripts/verify-dist.mjs`
- Create: `src/test/accessibility.test.tsx`
- Modify: 필요 시 각 페이지 (경로 변경 시 문서 제목·포커스)

- [ ] **Step 1: 경로 변경 시 제목·포커스 처리 추가** — `Layout.tsx`에 라우트 변경 감지:

```tsx
// Layout.tsx에 추가
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const TITLES: Record<string, string> = {
  '/': '정명 행정사사무소 | 정확함으로 길을 밝히다',
  '/why': '행정사가 필요한 이유 | 정명 행정사사무소',
  '/check': '셀프 진단 | 정명 행정사사무소',
  '/consult': '상담 안내 | 정명 행정사사무소',
};

// Layout 컴포넌트 안:
const { pathname } = useLocation();
const mainRef = useRef<HTMLElement>(null);
useEffect(() => {
  document.title = TITLES[pathname] ?? '정명 행정사사무소';
  mainRef.current?.focus();
  window.scrollTo(0, 0);
}, [pathname]);
// <main id="main" ref={mainRef} tabIndex={-1}>
```

- [ ] **Step 2: 접근성 테스트 작성·통과**

```tsx
// src/test/accessibility.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from '../app/AppRouter';

describe('접근성', () => {
  it.each(['/', '/why', '/check', '/check/dui', '/consult'])('%s: h1이 정확히 1개 있다', (path) => {
    render(<MemoryRouter initialEntries={[path]}><AppRouter /></MemoryRouter>);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('진단 화면의 진행률에 ARIA 값이 있다', () => {
    render(<MemoryRouter initialEntries={['/check/dui']}><AppRouter /></MemoryRouter>);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '1');
  });
});
```

Run: `npx vitest run src/test/accessibility.test.tsx` → PASS (홈 hero의 h1과 Navbar 로고가 heading으로 겹치지 않는지 확인)

- [ ] **Step 3: 배포 설정 파일 작성**

public/_redirects:

```
/* /index.html 200
```

vercel.json:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 4: verify-dist.mjs 작성** — dist에 index.html과 assets가 존재하고, legacy 원본 HTML이 포함되지 않았는지 검사:

```js
// scripts/verify-dist.mjs
import { existsSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, '../dist');

if (!existsSync(resolve(dist, 'index.html'))) {
  console.error('[verify-dist] dist/index.html이 없습니다.');
  process.exit(1);
}
const entries = readdirSync(dist);
if (entries.some((name) => name === 'legacy' || name === 'styles.css' || name === 'script.js')) {
  console.error('[verify-dist] 배포 산출물에 legacy 파일이 섞여 있습니다.');
  process.exit(1);
}
console.log('[verify-dist] 배포 산출물 검증 통과');
```

주의: `legacy/`가 프로젝트 루트에 있으므로 Vite가 복사하지 않지만, 실수로 `public/` 아래 두면 섞인다. 검사로 방지한다.

- [ ] **Step 5: 전체 검증 실행**

Run: `npm run check`
Expected: typecheck 통과 → 전체 테스트 통과 → 프로덕션 빌드 성공(연속 2회 실행해 Windows rmdir 문제 없음 확인) → verify-dist 통과

- [ ] **Step 6: 브라우저 수동 검증** — `npm run preview`로: 데스크톱·모바일(390×844) 홈/why/서비스 상세/진단 3종 완주/결과→상담 프리필/404 직접 접속/새로고침, 키보드만으로 진단 완주, 콘솔 오류 0건 확인.

- [ ] **Step 7: 리뷰 에이전트 호출** — superpowers:requesting-code-review 스킬로 전체 구현 리뷰를 받고 Critical·Important를 반영한다.

- [ ] **Step 8: checklist.md 전체 체크 완료, memory.md에 최종 경과 기록, 사용자에게 결과 보고** (커밋은 사용자 지시 대기)

---

## Self-Review 결과

- **스펙 커버리지:** 페이지 16종(§3) → Task 7~10. 진단 4단계·긴급 기한(§4.2) → Task 4~5, 9. 상담 프리필(§4.3) → Task 9~10. office 안전장치(§4.4) → Task 3. 콘텐츠 원칙 7항(§5) → Task 6 금지 표현 테스트 + 가상 후기·챗봇 부재(새 코드에 애초에 없음, legacy로만 보존). `/why` 구성(§5) → Task 6, 8. 기술 구조(§6) → Task 1~2, 11. 검증(§7) → 각 Task + Task 11. 작업 규칙(§8) → 각 Task 마지막 스텝. 갭 없음.
- **플레이스홀더:** suspension.ts·veterans.ts(Task 4 Step 5~6)는 문항·선택지·분류·lawRef를 지시문으로 명세했고 dui.ts 전체 코드가 동일 패턴의 완전한 예시로 존재한다. PrivacyPage·DisclaimerPage(Task 10 Step 4)는 포함할 내용을 문장 수준으로 명세했다.
- **타입 일관성:** `CheckDomain`/`ResultLevel`/`Question`(Task 4) ↔ `classifyAnswers`/`summarize`(Task 5) ↔ 페이지 사용부(Task 9~10) 시그니처 일치 확인. `safeSessionGet/Set`은 비자진단 원본 함수명 확인 후 호출부를 맞추도록 명시(Task 9 Step 4).
