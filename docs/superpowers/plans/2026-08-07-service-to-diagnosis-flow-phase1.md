# 업무분야 설명 → 진단 동선 재정렬 Phase 1 (구조) 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 업무 분야 6개 전부가 `설명 → 진단(또는 확인 목록) → 상담` 한 흐름으로 이어지도록 인허가 진단을 신설하고 홈·메뉴·분야 상세의 순서를 재정렬한다.

**Architecture:** 기존 `CheckDefinition` 자료 구조와 4단계 레벨(`urgent`/`documents`/`official`/`ready`)을 그대로 재사용해 인허가 도메인(`permit`)을 추가한다. 분야 상세 상단에 4단계 진행 표시 컴포넌트를 새로 두고, 3단계 링크를 서비스 데이터(내부 진단 / 외부 비자 사이트 / 페이지 내 확인 목록)에 따라 분기시킨다. 홈은 업무 분야를 진단보다 위로 올리고, 상단 메뉴에서 `셀프 진단`을 내려 분야 안으로 편입한다.

**Tech Stack:** React 19 · react-router-dom 7 · TypeScript · Vite 8 · Vitest 4 · @testing-library/react

**설계 문서:** `docs/superpowers/specs/2026-08-07-service-to-diagnosis-flow-design.md`

**베이스라인 (2026-08-07 실측):** 42파일 289테스트 전량 통과, 작업 트리 깨끗함(`e4383ab`)

---

## 사전 확인 사항

- 이 저장소의 `master` push는 Vercel Production 자동 배포다. **커밋·푸시는 주인님 승인 후에만 한다.** 각 Task의 커밋 단계는 로컬 커밋까지만이며, push는 Task 7 이후 승인을 받는다.
- `api/_check-levels.mjs`는 `scripts/gen-check-levels.ts`가 생성하는 파일이다. 직접 편집하지 말고 스크립트를 실행한다. `src/test/checkLevels.sync.test.ts`가 불일치를 잡는다.
- 진단 문구의 법령 근거는 아래 두 건만 사용한다 (2026-08-07 국가법령정보센터 원문 확인):
  - `민원 처리에 관한 법률 제22조` — 민원문서의 보완·취하 등 (제1항: 보완이 필요한 경우 상당한 기간을 정하여 지체 없이 보완 요구)
  - `행정절차법 제19조` — 처리기간의 설정·공표
- 인허가 진단 문구는 **주인님 검수 대상**이다. Task 1 완료 후 Task 2로 넘어가기 전에 문구를 보고하고 확인을 받는다.

---

## 파일 구조

| 파일 | 책임 |
|---|---|
| `src/types/content.ts` | `CheckDomain` 유니온에 `permit` 추가 (수정) |
| `src/data/checks/permit.ts` | 인허가 진단 문항 정의 (신설) |
| `src/data/checks/index.ts` | permit 등록 (수정) |
| `src/data/services.ts` | `license` 서비스에 `checkDomain: 'permit'` 연결 (수정) |
| `src/data/serviceFlow.ts` | 4단계 문구 상수 — 비자 사이트와 공유하는 표현 (신설) |
| `src/components/ServiceFlowSteps.tsx` | 4단계 진행 표시 + 3단계 링크 분기 (신설) |
| `src/pages/ServicePage.tsx` | 스텝 배치·확인 목록 anchor·비자 이동 안내 (수정) |
| `src/pages/HomePage.tsx` | 섹션 순서·히어로 버튼 (수정) |
| `src/components/Navbar.tsx` | 메뉴 정리 + 상시 상담 버튼 (수정) |
| `src/styles/app.css` | 스텝 표시 스타일 (수정) |
| `api/_check-levels.mjs` | 생성물 — 스크립트로 갱신 |

---

## Task 1: 인허가 진단 데이터 (permit)

**Files:**
- Modify: `src/types/content.ts:1`
- Create: `src/data/checks/permit.ts`
- Modify: `src/data/checks/index.ts`
- Modify: `src/test/checkData.test.ts:9`
- Generated: `api/_check-levels.mjs`

- [ ] **Step 1: 실패하는 테스트로 바꾼다**

`src/test/checkData.test.ts:8-10`의 도메인 목록을 4개로 수정한다.

```ts
  it('4개 도메인이 모두 존재한다', () => {
    expect(domains.sort()).toEqual(['dui', 'permit', 'suspension', 'veterans']);
  });
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run src/test/checkData.test.ts`
Expected: FAIL — `expected [ 'dui', 'suspension', 'veterans' ] to deeply equal [ 'dui', 'permit', 'suspension', 'veterans' ]`

- [ ] **Step 3: `CheckDomain`에 permit을 추가한다**

`src/types/content.ts:1`을 다음으로 교체한다.

```ts
export type CheckDomain = 'dui' | 'suspension' | 'veterans' | 'permit';
```

- [ ] **Step 4: 진단 문항 파일을 만든다**

`src/data/checks/permit.ts`를 다음 내용으로 새로 만든다.

```ts
import type { CheckDefinition } from '../../types/content';

export const permit: CheckDefinition = {
  domain: 'permit',
  title: '인허가 신청 사전 점검',
  intro: '어떤 인허가가 필요한지, 요건과 관할은 확인되었는지, 보완·반려에 대응할 준비가 되었는지 정리합니다. 결과는 일반 정보이며 허가 여부에 대한 판단이 아닙니다.',
  questions: [
    {
      id: 'permit-type',
      text: '어떤 인허가를 준비하고 계신가요?',
      options: [
        { id: 'corporation', label: '법인 · 사단법인 설립', level: 'ready', note: '설립 허가는 목적사업에 따라 주무관청이 나뉩니다. 정관과 사업계획서의 목적사업부터 정리하세요.' },
        { id: 'factory', label: '공장 등록 · 설립 승인', level: 'official', note: '공장은 입지(용도지역)와 업종 제한을 함께 봅니다. 소재지 관할 시·군·구의 기준을 확인하세요.' },
        { id: 'business', label: '영업 허가 · 등록 · 신고', level: 'ready', note: '업종마다 근거 법령과 요건이 다릅니다. 하려는 영업의 정확한 명칭부터 확인하세요.' },
        { id: 'other', label: '기타 또는 아직 모름', level: 'official', note: '인허가 명칭이 특정되지 않으면 요건 확인이 시작되지 않습니다. 하려는 사업과 시설 위치를 한 문장으로 정리하세요.' },
      ],
    },
    {
      id: 'permit-stage',
      text: '지금 어느 단계인가요?',
      options: [
        { id: 'reviewing', label: '알아보는 중', level: 'ready', note: '가장 여유 있는 단계입니다. 요건을 먼저 확인하면 보완 요구를 줄일 수 있습니다.' },
        { id: 'preparing', label: '서류 준비 중', level: 'documents', note: '구비서류 목록을 관할 기관 기준으로 확정한 뒤 수집하는 것이 순서입니다.' },
        { id: 'submitted', label: '신청서를 제출함', level: 'official', note: '처리기간과 보완 요구 여부를 확인할 시점입니다. 접수증과 담당 부서를 확인해 두세요.' },
        { id: 'supplement', label: '보완 요구를 받음', level: 'urgent', note: '보완 요구에는 정해진 기한이 있습니다. 요구서에 적힌 기한과 보완 항목을 지금 확인하세요.', lawRef: '민원 처리에 관한 법률 제22조' },
        { id: 'rejected', label: '반려됨', level: 'official', note: '반려 사유를 해소하지 않고 다시 신청하면 같은 사유로 반려될 수 있습니다. 반려 통지서 원문을 확보하세요.' },
      ],
    },
    {
      id: 'permit-authority',
      text: '관할 기관을 확인하셨나요?',
      options: [
        { id: 'confirmed', label: '담당 부서까지 확인함', level: 'ready', note: '관할이 확정되면 구비서류와 처리기간도 그 기관 기준으로 확인할 수 있습니다.' },
        { id: 'guessing', label: '대략만 알고 있음', level: 'official', note: '같은 인허가도 사업장 소재지와 규모에 따라 관할이 갈립니다. 담당 부서까지 특정하세요.' },
        { id: 'unknown', label: '모름', level: 'official', note: '관할 기관을 모르면 요건 확인이 시작되지 않습니다. 정부24 또는 사업장 소재지 시·군·구에서 확인하세요.' },
      ],
    },
    {
      id: 'permit-location',
      text: '사업장 위치와 용도지역을 확인하셨나요?',
      help: '같은 업종도 용도지역과 건축물 용도에 따라 가능 여부가 달라집니다.',
      options: [
        { id: 'checked', label: '확인함', level: 'ready', note: '입지 요건을 넘었다면 시설·인력 요건 확인으로 넘어갈 수 있습니다.' },
        { id: 'contracted', label: '계약은 했지만 확인은 안 함', level: 'official', note: '입지 제한에 걸리면 계약을 되돌리기 어렵습니다. 건축물대장과 용도지역을 지금 조회하세요.' },
        { id: 'notyet', label: '아직 정하지 않음', level: 'ready', note: '위치를 정하기 전에 용도지역 기준을 확인하면 선택 폭이 넓어집니다.' },
      ],
    },
    {
      id: 'permit-facility',
      text: '시설 · 장비 기준을 확인하셨나요?',
      options: [
        { id: 'meets', label: '확인했고 충족함', level: 'ready', note: '기준 충족을 보여줄 도면·사진·계약서를 신청 서류와 함께 정리해 두세요.' },
        { id: 'partial', label: '일부만 갖춤', level: 'documents', note: '부족한 항목 목록을 만들어 신청 전에 갖출 수 있는 것부터 처리하세요.' },
        { id: 'unknown', label: '기준을 모름', level: 'official', note: '시설 기준은 근거 법령의 별표에 있는 경우가 많습니다. 관할 기관에 기준표를 요청하세요.' },
      ],
    },
    {
      id: 'permit-staff',
      text: '자격증 · 경력을 갖춘 인력이 필요한 인허가인가요?',
      options: [
        { id: 'secured', label: '필요하고 확보함', level: 'ready', note: '자격증 사본과 재직·고용 관계 증빙을 함께 준비하세요.' },
        { id: 'needed', label: '필요하지만 아직 없음', level: 'documents', note: '인력 요건은 채용에 시간이 걸립니다. 신청 일정과 함께 계획하세요.' },
        { id: 'none', label: '필요 없음', level: 'ready', note: '인력 요건이 없다면 시설·입지 요건에 집중할 수 있습니다.' },
        { id: 'unknown', label: '모름', level: 'official', note: '업종에 따라 필수 인력 기준이 있습니다. 근거 법령의 요건을 확인하세요.' },
      ],
    },
    {
      id: 'permit-disqualification',
      text: '대표자 · 법인의 결격사유를 확인하셨나요?',
      help: '많은 인허가는 일정한 전과나 행정처분 이력을 결격사유로 정하고 있습니다.',
      options: [
        { id: 'checked', label: '확인했고 해당 없음', level: 'ready', note: '결격사유가 없다면 신청 요건의 큰 장애물은 넘은 것입니다.' },
        { id: 'possible', label: '해당될 수 있음', level: 'official', note: '결격사유는 기간 제한이 붙는 경우가 많습니다. 해당 조항과 기산일을 확인해야 합니다.' },
        { id: 'unknown', label: '확인하지 않음', level: 'official', note: '결격사유는 신청 후 발견되면 반려로 이어집니다. 근거 법령의 결격사유 조항을 먼저 확인하세요.' },
      ],
    },
    {
      id: 'permit-supplement-deadline',
      text: '보완 요구를 받았다면 기한은 어떻게 되나요?',
      help: '행정기관은 보완이 필요하면 상당한 기간을 정해 보완을 요구합니다.',
      options: [
        { id: 'remaining', label: '아직 기한이 남음', level: 'documents', note: '보완 항목별로 필요한 서류를 정리해 기한 안에 제출할 준비를 하세요.' },
        { id: 'soon', label: '3일 이내로 임박', level: 'urgent', note: '보완 기한이 임박했습니다. 지금 바로 보완 항목과 제출 방법을 확인해야 합니다.', lawRef: '민원 처리에 관한 법률 제22조' },
        { id: 'passed', label: '이미 지남', level: 'urgent', note: '보완 기한이 지나면 신청이 종결 처리될 수 있습니다. 관할 기관에 처리 상태를 즉시 확인하세요.', lawRef: '민원 처리에 관한 법률 제22조' },
        { id: 'na', label: '해당 없음', level: 'ready', note: '보완 요구가 오면 기한부터 확인할 수 있도록 접수증과 담당자 연락처를 보관해 두세요.' },
      ],
    },
    {
      id: 'permit-rejection',
      text: '이전에 반려 · 불허를 받은 적이 있나요?',
      options: [
        { id: 'none', label: '없음', level: 'ready', note: '첫 신청이라면 사전 검토로 반려 사유를 줄이는 것이 가장 효과적입니다.' },
        { id: 'hasdoc', label: '있고 통지서를 갖고 있음', level: 'documents', note: '반려 사유 원문이 다음 신청의 출발점입니다. 사유별로 해소 방법을 정리하세요.' },
        { id: 'nodoc', label: '있지만 통지서가 없음', level: 'official', note: '반려 사유를 모르면 같은 결과가 반복될 수 있습니다. 관할 기관에 처분 문서를 다시 요청하세요.' },
      ],
    },
    {
      id: 'permit-opening',
      text: '사업 개시 예정일까지 얼마나 남았나요?',
      help: '행정청은 처분의 처리기간을 종류별로 미리 정해 공표합니다.',
      options: [
        { id: 'over3m', label: '3개월 이상', level: 'ready', note: '요건 검토와 서류 준비에 여유가 있습니다. 사전 검토를 먼저 하세요.' },
        { id: 'm1to3', label: '1 ~ 3개월', level: 'official', note: '보완 요구가 있으면 기간이 늘어납니다. 공표된 처리기간을 확인해 일정을 잡으세요.' },
        { id: 'within1m', label: '1개월 이내', level: 'urgent', note: '공표된 처리기간보다 개시 예정일이 빠를 수 있습니다. 관할 기관의 처리기간을 지금 확인하세요.', lawRef: '행정절차법 제19조' },
        { id: 'undecided', label: '아직 정하지 않음', level: 'ready', note: '처리기간을 먼저 확인한 뒤 개시일을 정하면 무리한 일정을 피할 수 있습니다.' },
      ],
    },
  ],
};
```

- [ ] **Step 5: 진단 목록에 등록한다**

`src/data/checks/index.ts`를 다음으로 교체한다.

```ts
import type { CheckDefinition, CheckDomain } from '../../types/content';
import { dui } from './dui';
import { suspension } from './suspension';
import { veterans } from './veterans';
import { permit } from './permit';

export const checks: Record<CheckDomain, CheckDefinition> = { dui, suspension, veterans, permit };

export function findCheck(domain: string | undefined): CheckDefinition | undefined {
  if (!domain || !Object.hasOwn(checks, domain)) return undefined;
  return checks[domain as CheckDomain];
}
```

- [ ] **Step 6: 서버 검증 정의를 다시 생성한다**

Run: `npx vite-node scripts/gen-check-levels.ts`
Expected: `api/_check-levels.mjs 갱신 완료`

- [ ] **Step 7: 테스트가 통과하는지 확인한다**

Run: `npx vitest run src/test/checkData.test.ts src/test/checkLevels.sync.test.ts src/test/forbiddenPhrases.test.ts`
Expected: PASS — 3파일 전부 통과. `checkData`의 `permit: 문항 8~12개…`, `permit: 기한 관련 긴급 선택지에는 근거 법령이 있다`가 새로 통과해야 한다.

- [ ] **Step 8: 타입 검사와 전체 테스트**

Run: `npm run typecheck && npm run test:run`
Expected: 타입 오류 0건, 42파일 291테스트 통과 (`checkData.test.ts`의 `it.each(domains)` 두 블록에 `permit`이 추가되어 289 → 291)

- [ ] **Step 9: 커밋**

```bash
git add src/types/content.ts src/data/checks/permit.ts src/data/checks/index.ts src/test/checkData.test.ts api/_check-levels.mjs
git commit -m "feat: 인허가 진단(permit) 문항 신설"
```

- [ ] **Step 10: 문구 검수 보고**

주인님께 인허가 진단 10문항의 문구와 법령 근거 2건을 보고하고 확인을 받는다. 수정 요청이 있으면 반영 후 Step 6~9를 다시 실행한다. **확인 전에는 Task 2로 넘어가지 않는다.**

---

## Task 2: 인허가 서비스 연결 + 진단 공백 방지 테스트

**Files:**
- Modify: `src/data/services.ts:116-117`
- Modify: `src/test/routing.test.tsx`
- Create: `src/test/serviceFlowCoverage.test.ts`

- [ ] **Step 1: 실패하는 커버리지 테스트를 만든다**

`src/test/serviceFlowCoverage.test.ts`를 새로 만든다. 이 테스트가 "진단 공백" 재발을 막는다.

```ts
import { services } from '../data/services';
import { checks } from '../data/checks';

describe('업무분야 → 진단 경로 커버리지', () => {
  it('모든 분야가 내부 진단 · 외부 진단 · 확인 목록 중 하나를 갖는다', () => {
    for (const service of services) {
      const hasPath = Boolean(service.checkDomain) || Boolean(service.externalLink) || service.selfService.length > 0;
      expect(hasPath, `${service.slug}에 3단계 경로가 없음`).toBe(true);
    }
  });

  it('checkDomain은 실제 존재하는 진단을 가리킨다', () => {
    for (const service of services) {
      if (!service.checkDomain) continue;
      expect(checks[service.checkDomain], `${service.slug}의 진단 정의 없음`).toBeDefined();
    }
  });

  it('인허가 분야는 permit 진단에 연결된다', () => {
    const license = services.find((s) => s.slug === 'license');
    expect(license?.checkDomain).toBe('permit');
  });

  it('출입국 비자 분야는 외부 진단센터로 연결된다', () => {
    const immigration = services.find((s) => s.slug === 'immigration');
    expect(immigration?.checkDomain).toBeUndefined();
    expect(immigration?.externalLink?.url).toContain('jm-visa-precheck');
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run src/test/serviceFlowCoverage.test.ts`
Expected: FAIL — `인허가 분야는 permit 진단에 연결된다`에서 `expected undefined to be 'permit'`

- [ ] **Step 3: 서비스 데이터를 연결한다**

`src/data/services.ts`의 `license` 항목에서 `funnelDomain: 'permit',` 아래 `consultTopic: 'permit',` 다음 줄에 `checkDomain`을 추가한다. 수정 후 해당 부분은 다음과 같다.

```ts
    funnelDomain: 'permit',
    consultTopic: 'permit',
    checkDomain: 'permit',
  },
```

- [ ] **Step 4: 라우팅 테스트를 추가한다**

`src/test/routing.test.tsx`의 `describe('라우팅', …)` 블록 안, `it('없는 주소는 404와 복구 경로를 보여준다', …)` 앞에 다음을 넣는다.

```tsx
  it('인허가 진단 경로가 열린다', () => {
    renderAt('/check/permit');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('인허가 신청 사전 점검');
  });
```

- [ ] **Step 5: 통과를 확인한다**

Run: `npx vitest run src/test/serviceFlowCoverage.test.ts src/test/routing.test.tsx`
Expected: PASS — 두 파일 전부 통과

- [ ] **Step 6: 커밋**

```bash
git add src/data/services.ts src/test/serviceFlowCoverage.test.ts src/test/routing.test.tsx
git commit -m "feat: 인허가 분야를 permit 진단에 연결 + 진단 공백 방지 테스트"
```

---

## Task 3: 4단계 진행 표시 컴포넌트

**Files:**
- Create: `src/data/serviceFlow.ts`
- Create: `src/components/ServiceFlowSteps.tsx`
- Create: `src/test/serviceFlowSteps.test.tsx`
- Modify: `src/styles/app.css` (파일 끝에 추가)

- [ ] **Step 1: 실패하는 테스트를 만든다**

`src/test/serviceFlowSteps.test.tsx`를 새로 만든다.

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ServiceFlowSteps } from '../components/ServiceFlowSteps';
import { SERVICE_FLOW_STEPS } from '../data/serviceFlow';
import { findService } from '../data/services';

function renderFor(slug: string) {
  const service = findService(slug)!;
  return render(
    <MemoryRouter>
      <ServiceFlowSteps service={service} />
    </MemoryRouter>,
  );
}

describe('업무분야 4단계 진행 표시', () => {
  it('비자 사이트와 같은 문구를 쓴다', () => {
    expect(SERVICE_FLOW_STEPS).toEqual(['설명', '요건·서류 조회', '내 상황 진단', '상담 준비']);
  });

  it('내부 진단이 있는 분야는 3단계가 진단 경로를 가리킨다', () => {
    renderFor('dui');
    expect(screen.getByRole('link', { name: /내 상황 진단/ })).toHaveAttribute('href', '/check/dui');
  });

  it('인허가 분야도 3단계가 진단 경로를 가리킨다', () => {
    renderFor('license');
    expect(screen.getByRole('link', { name: /내 상황 진단/ })).toHaveAttribute('href', '/check/permit');
  });

  it('비자 분야는 외부 이동임을 알린다', () => {
    renderFor('immigration');
    const link = screen.getByRole('link', { name: /내 상황 진단/ });
    expect(link.getAttribute('href')).toContain('jm-visa-precheck');
    expect(screen.getByText(/다국어 진단센터로 이동합니다/)).toBeInTheDocument();
  });

  it('진단이 없는 분야는 페이지 안의 확인 목록을 가리킨다', () => {
    renderFor('documents');
    expect(screen.getByRole('link', { name: /상담 전 확인 목록/ })).toHaveAttribute('href', '#preparation-review');
  });

  it('현재 단계를 접근성 속성으로 알린다', () => {
    renderFor('dui');
    expect(screen.getByText('설명').closest('li')).toHaveAttribute('aria-current', 'step');
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run src/test/serviceFlowSteps.test.tsx`
Expected: FAIL — `Failed to resolve import "../components/ServiceFlowSteps"`

- [ ] **Step 3: 4단계 문구 상수를 만든다**

`src/data/serviceFlow.ts`를 새로 만든다.

```ts
// 비자 진단 사이트(`행정사 비자진단 홈페이지/src/pages/VisaDetailPage.tsx`의 flowSteps)와
// 같은 표현을 쓴다. 두 사이트를 오가는 방문자가 같은 단계 이름을 보게 하기 위한 것이므로
// 한쪽을 고치면 다른 쪽도 함께 고쳐야 한다. serviceFlowSteps.test.tsx가 문구를 고정한다.
export const SERVICE_FLOW_STEPS = ['설명', '요건·서류 조회', '내 상황 진단', '상담 준비'] as const;

export const FLOW_STEP_INTRO =
  '필요한 단계만 선택할 수 있습니다. 기한이 급하면 진단을 건너뛰고 상담 준비로 바로 이동하세요.';

export const VISA_EXTERNAL_NOTE = '3단계는 다국어 진단센터로 이동합니다.';
```

- [ ] **Step 4: 컴포넌트를 만든다**

`src/components/ServiceFlowSteps.tsx`를 새로 만든다.

```tsx
import { Link } from 'react-router-dom';
import type { Service } from '../data/services';
import { attributedExternalUrl, type Attribution } from '../lib/funnel';
import { FLOW_STEP_INTRO, SERVICE_FLOW_STEPS, VISA_EXTERNAL_NOTE } from '../data/serviceFlow';

interface StepTarget {
  label: string;
  href: string;
  external: boolean;
}

// 3단계(진단)는 분야마다 목적지가 다르다.
// 내부 진단 → /check/:domain, 비자 → 외부 진단센터, 진단이 없는 분야 → 페이지 안 확인 목록
function diagnosisTarget(service: Service, attribution?: Attribution): StepTarget {
  if (service.checkDomain) {
    return { label: SERVICE_FLOW_STEPS[2], href: `/check/${service.checkDomain}`, external: false };
  }
  if (service.externalLink) {
    return {
      label: SERVICE_FLOW_STEPS[2],
      href: attributedExternalUrl(service.externalLink.url, 'jm_main', attribution ?? {}),
      external: true,
    };
  }
  return { label: '상담 전 확인 목록', href: '#preparation-review', external: false };
}

export function ServiceFlowSteps({
  service,
  attribution,
}: {
  service: Service;
  attribution?: Attribution;
}) {
  const diagnosis = diagnosisTarget(service, attribution);
  const steps: StepTarget[] = [
    { label: SERVICE_FLOW_STEPS[0], href: '#target', external: false },
    { label: SERVICE_FLOW_STEPS[1], href: '#quick-checks', external: false },
    diagnosis,
    { label: SERVICE_FLOW_STEPS[3], href: `/consult?topic=${service.consultTopic}`, external: false },
  ];

  return (
    <nav className="flow-steps" aria-label="진행 단계">
      <p className="flow-steps__intro">{FLOW_STEP_INTRO}</p>
      <ol className="flow-steps__list">
        {steps.map((step, index) => (
          <li key={step.label} aria-current={index === 0 ? 'step' : undefined}>
            <span className="flow-steps__number" aria-hidden="true">{index + 1}</span>
            {index === 0 ? (
              <span className="flow-steps__label">{step.label}</span>
            ) : step.external ? (
              <a className="flow-steps__label" href={step.href}>{step.label}</a>
            ) : step.href.startsWith('#') ? (
              <a className="flow-steps__label" href={step.href}>{step.label}</a>
            ) : (
              <Link className="flow-steps__label" to={step.href}>{step.label}</Link>
            )}
          </li>
        ))}
      </ol>
      {diagnosis.external && <p className="note flow-steps__note">{VISA_EXTERNAL_NOTE}</p>}
    </nav>
  );
}
```

- [ ] **Step 5: 스타일을 추가한다**

`src/styles/app.css` 파일 끝(마지막 `@media (max-width: 520px)` 블록 뒤)에 다음을 덧붙인다.

```css
/* --- 업무분야 4단계 진행 표시 --- */
.flow-steps {
  background: var(--surface-muted);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 20px 22px;
  margin: 24px 0 8px;
}
.flow-steps__intro { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 14px; }
.flow-steps__list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}
.flow-steps__list li {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
}
.flow-steps__list li[aria-current='step'] {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.flow-steps__number {
  flex: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.flow-steps__list li[aria-current='step'] .flow-steps__number { background: var(--accent); }
.flow-steps__label { font-weight: 700; font-size: 0.95rem; text-decoration: none; color: var(--primary); }
.flow-steps__list li[aria-current='step'] .flow-steps__label { color: var(--text); }
.flow-steps__note { margin-top: 12px; }
@media (max-width: 768px) {
  .flow-steps__list { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 380px) {
  .flow-steps__list { grid-template-columns: 1fr; }
}
```

- [ ] **Step 6: 통과를 확인한다**

Run: `npx vitest run src/test/serviceFlowSteps.test.tsx`
Expected: PASS — 6개 테스트 전부 통과

- [ ] **Step 7: 커밋**

```bash
git add src/data/serviceFlow.ts src/components/ServiceFlowSteps.tsx src/test/serviceFlowSteps.test.tsx src/styles/app.css
git commit -m "feat: 업무분야 4단계 진행 표시 컴포넌트"
```

---

## Task 4: 분야 상세에 스텝 배치 + 확인 목록 연결

**Files:**
- Modify: `src/pages/ServicePage.tsx`
- Modify: `src/test/serviceFlowSteps.test.tsx` (페이지 통합 테스트 추가)

- [ ] **Step 1: 실패하는 통합 테스트를 추가한다**

`src/test/serviceFlowSteps.test.tsx` 파일 끝에 다음 describe 블록을 덧붙인다. 상단 import에 `ServicePage` · `Routes` · `Route`를 추가한다.

```tsx
import { Route, Routes } from 'react-router-dom';
import { ServicePage } from '../pages/ServicePage';

function renderPage(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/services/${slug}`]}>
      <Routes>
        <Route path="/services/:slug" element={<ServicePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('분야 상세의 단계 안내', () => {
  it('상세 페이지 상단에 진행 단계를 보여준다', () => {
    renderPage('dui');
    expect(screen.getByRole('navigation', { name: '진행 단계' })).toBeInTheDocument();
  });

  it('확인 목록 섹션에 앵커 대상이 있다', () => {
    renderPage('documents');
    expect(document.querySelector('#preparation-review')).not.toBeNull();
  });

  it('진단이 없는 분야의 주 버튼은 확인 목록으로 간다', () => {
    renderPage('documents');
    expect(screen.getByRole('link', { name: /상담 전 확인 목록 보기/ })).toHaveAttribute('href', '#preparation-review');
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run src/test/serviceFlowSteps.test.tsx`
Expected: FAIL — `Unable to find an accessible element with the role "navigation" and name "진행 단계"`

- [ ] **Step 3: ServicePage에 스텝을 배치한다**

`src/pages/ServicePage.tsx` 상단 import에 다음 한 줄을 추가한다.

```tsx
import { ServiceFlowSteps } from '../components/ServiceFlowSteps';
```

`ServicePage` 함수의 `<header className="page-header">` 블록에서 `<ServiceActions … location="top" …/>` 줄을 다음 두 줄로 교체한다.

```tsx
          <ServiceFlowSteps service={service} attribution={attribution} />
          <ServiceActions service={service} location="top" attribution={attribution} />
```

- [ ] **Step 4: 확인 목록에 앵커 id를 붙인다**

같은 파일에서 `<section aria-labelledby="preparation-review">`를 다음으로 교체한다.

```tsx
      <section id="preparation-review" aria-labelledby="preparation-review-heading">
```

같은 섹션 안의 `<h2 id="preparation-review">직접 준비와 검토가 필요한 부분</h2>`을 다음으로 교체한다.

```tsx
          <h2 id="preparation-review-heading">직접 준비와 검토가 필요한 부분</h2>
```

- [ ] **Step 5: 진단 없는 분야의 주 버튼을 확인 목록으로 바꾼다**

같은 파일의 `ServiceActions` 안, 세 번째 분기(`) : (`) 블록을 다음으로 교체한다.

```tsx
      ) : (
        <a className="button button--accent" href="#preparation-review" onClick={track}>
          상담 전 확인 목록 보기 →
        </a>
      )}
```

- [ ] **Step 6: 통과를 확인한다**

Run: `npx vitest run src/test/serviceFlowSteps.test.tsx src/test/accessibility.test.tsx`
Expected: PASS — 접근성 테스트도 함께 통과해야 한다(제목 id 변경 영향 확인)

- [ ] **Step 7: 전체 테스트**

Run: `npm run test:run`
Expected: 전량 통과. 실패하면 해당 테스트의 기대값이 옛 구조를 가리키는지 확인하고 테스트를 수정한다.

- [ ] **Step 8: 커밋**

```bash
git add src/pages/ServicePage.tsx src/test/serviceFlowSteps.test.tsx
git commit -m "feat: 분야 상세에 4단계 진행 표시와 확인 목록 경로 연결"
```

---

## Task 5: 홈 순서 교체

**Files:**
- Modify: `src/pages/HomePage.tsx:19-22, 41-56, 58-76`
- Modify: `src/test/routing.test.tsx`

- [ ] **Step 1: 실패하는 테스트를 추가한다**

`src/test/routing.test.tsx`의 `describe('라우팅', …)` 안에 다음을 추가한다.

```tsx
  it('홈에서 업무 분야가 셀프 진단보다 먼저 나온다', () => {
    const { container } = renderAt('/');
    const headings = Array.from(container.querySelectorAll('h2')).map((h) => h.textContent ?? '');
    const services = headings.findIndex((t) => t.includes('업무 분야'));
    const check = headings.findIndex((t) => t.includes('셀프 진단'));
    expect(services).toBeGreaterThanOrEqual(0);
    expect(check).toBeGreaterThanOrEqual(0);
    expect(services).toBeLessThan(check);
  });

  it('홈의 주 버튼은 업무 분야로 간다', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: /업무 분야 살펴보기/ })).toHaveAttribute('href', '/services');
  });
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run src/test/routing.test.tsx`
Expected: FAIL — `expected 2 to be less than 1` (업무 분야가 셀프 진단보다 뒤에 있음)

- [ ] **Step 3: 히어로 버튼 순서를 바꾼다**

`src/pages/HomePage.tsx`의 `<div className="button-row">` 블록을 다음으로 교체한다.

```tsx
            <div className="button-row">
              <Link className="button button--accent" to="/services">업무 분야 살펴보기 →</Link>
              <Link className="button button--ghost" to="/check">바로 셀프 진단하기</Link>
            </div>
```

- [ ] **Step 4: 섹션 순서를 바꾼다**

같은 파일에서 `<section className="section page-shell" aria-labelledby="check-heading">…</section>` 블록 전체(진단 섹션)를 잘라내어, `<section className="section page-shell" id="services" …>…</section>` 블록 **뒤로** 옮긴다. 옮긴 뒤 진단 섹션의 `section-heading` 안 문구를 다음으로 교체한다.

```tsx
        <div className="section-heading">
          <p className="eyebrow">분야를 모르겠다면</p>
          <h2 id="check-heading">3분 셀프 진단</h2>
          <p>어느 분야에 해당하는지 애매하다면 진단으로 먼저 확인할 항목을 정리해 보세요.</p>
        </div>
```

- [ ] **Step 5: 통과를 확인한다**

Run: `npx vitest run src/test/routing.test.tsx`
Expected: PASS

- [ ] **Step 6: 전체 테스트**

Run: `npm run test:run`
Expected: 전량 통과

- [ ] **Step 7: 커밋**

```bash
git add src/pages/HomePage.tsx src/test/routing.test.tsx
git commit -m "feat: 홈에서 업무 분야를 셀프 진단보다 먼저 배치"
```

---

## Task 6: 상단 메뉴 정리

**Files:**
- Modify: `src/components/Navbar.tsx:4-9, 41-47`
- Modify: `src/test/components.test.tsx:21-27`
- Modify: `src/styles/app.css` (파일 끝에 추가)

- [ ] **Step 1: 테스트를 새 구조로 바꾼다**

`src/test/components.test.tsx`의 `it('본문 건너뛰기 링크와 주요 메뉴를 제공한다', …)` 블록을 다음으로 교체한다.

```tsx
  it('본문 건너뛰기 링크와 주요 메뉴를 제공한다', () => {
    renderLayout();
    expect(screen.getByText('본문으로 건너뛰기')).toHaveAttribute('href', '#main');
    expect(screen.getByRole('link', { name: '업무분야' })).toHaveAttribute('href', '/services');
    expect(screen.getByRole('link', { name: '행정사가 필요한 이유' })).toHaveAttribute('href', '/why');
  });

  it('상단 메뉴에서 셀프 진단을 분리하고 상담 버튼을 상시 노출한다', () => {
    renderLayout();
    const nav = screen.getByRole('navigation', { name: '주요 메뉴' });
    expect(nav.querySelector('a[href="/check"]')).toBeNull();
    expect(screen.getByRole('link', { name: '상담 문의' })).toHaveAttribute('href', '/consult');
  });
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run src/test/components.test.tsx`
Expected: FAIL — `상단 메뉴에서 셀프 진단을 분리하고…`에서 `expected <a href="/check"> to be null`

- [ ] **Step 3: 메뉴를 정리한다**

`src/components/Navbar.tsx:4-9`의 `menu` 상수를 다음으로 교체한다. `셀프 진단`은 분야 안으로 편입하므로 빼고, `상담 안내`는 아래 상담 버튼과 목적지가 같으므로 중복을 없앤다.

```tsx
const menu = [
  { to: '/why', label: '행정사가 필요한 이유' },
  { to: '/services', label: '업무분야' },
];
```

같은 파일의 `<nav id="global-nav" …>` 블록 안, `menu.map(...)` 뒤에 상담 버튼을 추가한다. `</nav>` 직전에 다음을 넣는다.

```tsx
          <Link className="button button--accent navbar__cta" to="/consult" onClick={() => setOpen(false)}>
            상담 문의
          </Link>
```

- [ ] **Step 4: 버튼 스타일을 추가한다**

`src/styles/app.css` 파일 끝에 다음을 덧붙인다.

```css
.navbar__cta { min-height: 40px; padding: 8px 18px; margin-left: 8px; font-size: 0.95rem; }
@media (max-width: 768px) {
  .navbar__cta { margin-left: 0; margin-top: 8px; width: 100%; }
}
```

- [ ] **Step 5: 통과를 확인한다**

Run: `npx vitest run src/test/components.test.tsx`
Expected: PASS

- [ ] **Step 6: 전체 테스트 — `/check` 진입점이 남아 있는지 확인한다**

Run: `npm run test:run`
Expected: 전량 통과. `routing.test.tsx`의 `홈에는 진단 진입과 …`가 여전히 통과해야 한다(홈의 보조 버튼과 진단 섹션, `ConsultCta`의 `/check` 링크가 진입점으로 남는다).

- [ ] **Step 7: 커밋**

```bash
git add src/components/Navbar.tsx src/test/components.test.tsx src/styles/app.css
git commit -m "feat: 상단 메뉴에서 셀프 진단 분리 + 상시 상담 버튼"
```

---

## Task 7: 전체 검증과 문서 갱신

**Files:**
- Modify: `checklist.md`
- Modify: `memory.md`

- [ ] **Step 1: 전체 검사를 실행한다**

Run: `npm run check`
Expected: typecheck 0건 → 테스트 전량 통과 → 빌드 성공 → `verify:dist` 통과

- [ ] **Step 2: 로컬에서 실제 화면을 확인한다**

Run: `npm run dev`

브라우저에서 다음을 확인한다.
1. `/` — 업무 분야 섹션이 셀프 진단 섹션보다 위에 있는가
2. `/services/license` — 4단계 표시가 뜨고 3단계가 `/check/permit`으로 가는가
3. `/check/permit` — 10문항이 뜨고 결과 화면이 4단계 등급으로 정리되는가
4. `/services/immigration` — 3단계가 외부 진단센터로 가고 "다국어 진단센터로 이동합니다" 안내가 뜨는가
5. `/services/documents` — 3단계와 주 버튼이 페이지 안 확인 목록으로 스크롤되는가
6. 상단 메뉴가 3개 + 상담 버튼인가, 모바일 폭(375px)에서 메뉴가 열리는가

- [ ] **Step 3: `checklist.md`에 기록한다**

`checklist.md` 끝에 다음 섹션을 추가한다.

```markdown
## 2026-08-07 업무분야 설명 → 진단 동선 재정렬 Phase 1 (구조)

기준 문서: `docs/superpowers/specs/2026-08-07-service-to-diagnosis-flow-design.md`
계획 문서: `docs/superpowers/plans/2026-08-07-service-to-diagnosis-flow-phase1.md`

- [ ] 인허가 진단(permit) 10문항 신설 — 법령 근거 2건 원문 확인
- [ ] 인허가 진단 문구 주인님 검수
- [ ] 인허가 분야 ↔ permit 진단 연결 + 진단 공백 방지 테스트
- [ ] 4단계 진행 표시 컴포넌트 (비자 사이트와 문구 일치)
- [ ] 분야 상세에 스텝 배치 + 확인 목록 앵커
- [ ] 홈 섹션 순서 교체 (업무 분야 → 셀프 진단)
- [ ] 상단 메뉴 정리 + 상시 상담 버튼
- [ ] `npm run check` 전량 통과
- [ ] 로컬 6개 화면 육안 확인
- [ ] 커밋·푸시·배포 승인 대기
```

각 항목은 해당 Task를 마칠 때 체크한다.

- [ ] **Step 4: `memory.md`에 경과를 기록한다**

`memory.md` 끝에 작업 경과를 추가한다. 다음 사실을 포함한다.
- 인허가 진단 신설로 업무 분야 6개 중 진단 연결이 4개(내부) + 1개(외부 비자) + 1개(확인 목록)가 되었다는 것
- 사용한 법령 근거 2건과 확인일(2026-08-07)
- `api/_check-levels.mjs`는 `npx vite-node scripts/gen-check-levels.ts`로 재생성했다는 것
- 4단계 문구는 비자 사이트 `VisaDetailPage.tsx`의 `flowSteps`와 같은 표현이며 `src/data/serviceFlow.ts`가 기준이라는 것
- 최종 테스트 파일 수·테스트 수 (실측값 기록)

- [ ] **Step 5: 커밋**

```bash
git add checklist.md memory.md
git commit -m "docs: 업무분야 동선 재정렬 Phase 1 기록"
```

- [ ] **Step 6: 배포 승인 요청**

주인님께 다음을 보고하고 push 승인을 받는다.
- 변경 요약과 커밋 목록 (`git log --oneline e4383ab..HEAD`)
- `npm run check` 결과 (실측 테스트 수)
- 로컬 육안 확인 결과
- **승인 전에는 push하지 않는다.** master push는 Vercel Production 자동 배포다.

---

## Phase 1 완료 후

Phase 2(디자인·가독성)는 별도 계획서로 작성한다. 설계 문서의 "Phase 2 — 디자인·가독성" 항목 7건이 대상이다.

## 이 계획의 범위 제외

- 비자 진단 사이트 저장소 수정 (헤더·색 통일은 Phase 2 이후 별도 작업)
- 문서 분야(토지보상·내용증명·계약서) 진단 신설
- 타이포 토큰·본문 폭·섹션 위계·브레이크포인트 (Phase 2)
- 개업 상태 전환(`CONSULT_OPEN`), 실제 사무소 정보 게시
