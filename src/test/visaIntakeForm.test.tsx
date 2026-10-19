import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../data/office', () => ({
  office: {
    isOpen: true,
    phone: '02-000-0000',
    kakaoChannelUrl: 'https://pf.kakao.com/_test',
    address: '테스트 주소',
    registrationNumber: '제0000-00호',
    businessNumber: '000-00-00000',
    formEndpoint: 'https://example.test/api/consult',
  },
  isAcceptingRequests: () => true,
}));

import { ConsultPage } from '../pages/ConsultPage';

function renderPage(entry: string) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <ConsultPage />
    </MemoryRouter>,
  );
}

function mockFetch(handoff?: unknown) {
  const fetchMock = vi.fn().mockImplementation(async (url: string) => {
    if (url === '/api/visa-handoff') return { ok: true, status: 200, json: async () => ({ ok: true, visaDiagnosis: handoff }) };
    if (url === '/api/funnel') return { ok: true, status: 202 };
    return { ok: true, json: async () => ({ ok: true, id: 'JM-VISA-1' }) };
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function consultBody(fetchMock: ReturnType<typeof vi.fn>) {
  const call = fetchMock.mock.calls.find(([url]) => url === 'https://example.test/api/consult');
  return JSON.parse((call?.[1] as RequestInit).body as string);
}

async function fillContact(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/성함/), '홍길동');
  await user.type(screen.getByLabelText(/연락처/), '01012345678');
  await user.click(screen.getByLabelText(/개인정보 수집·이용에 동의/));
}

describe('출입국·비자 상담 접수 질문', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('출입국·비자 분야에서만 질문을 보여 준다', async () => {
    mockFetch();
    const user = userEvent.setup();
    renderPage('/consult?topic=permit');
    expect(screen.queryByRole('region', { name: '비자 상담에 필요한 질문' })).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('분야'), '출입국 · 비자');
    expect(screen.getByRole('region', { name: '비자 상담에 필요한 질문' })).toBeInTheDocument();
  });

  it('국내 본인 문의는 필수 답을 visaIntake로 보내고 국적은 묻지 않는다', async () => {
    const fetchMock = mockFetch();
    const user = userEvent.setup();
    renderPage('/consult?topic=visa');
    await fillContact(user);
    await user.click(screen.getByLabelText('제 비자 문제입니다'));
    await user.click(screen.getByLabelText(/만료가 임박함/));
    expect(screen.getByLabelText(/체류기간 만료일/)).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(/지금 가지고 있는 체류자격/), 'study');
    await user.click(screen.getByLabelText('지금 체류기간 늘리기(연장)'));
    await user.click(screen.getByLabelText('아직 신청 전'));
    expect(screen.queryByLabelText(/국적은 어디인가요/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /상담 신청하기/ }));
    await screen.findByText(/JM-VISA-1/);
    expect(consultBody(fetchMock).visaIntake).toEqual({
      requester: 'self',
      stayStatus: 'near-expiry',
      currentStatus: 'study',
      goal: 'extend',
      stage: 'not-applied',
      language: 'ko',
    });
  });

  it('회사 문의는 직원 기준 문구와 대표 직원 안내, 당사자 확인을 보여 준다', async () => {
    const fetchMock = mockFetch();
    const user = userEvent.setup();
    renderPage('/consult?topic=visa');
    await fillContact(user);
    await user.click(screen.getByLabelText('회사에서 외국인 직원을 채용하거나 관리합니다'));
    expect(screen.getByText(/대표적인 한 명 기준으로 답하고, 나머지는 상담 내용 칸에/)).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /직원은 지금 어디에 있나요/ })).toBeInTheDocument();
    await user.click(screen.getByLabelText('2~5명'));
    await user.click(screen.getByLabelText('현재 해외에 있음'));
    expect(screen.queryByLabelText(/체류자격\(비자 종류\)/)).not.toBeInTheDocument();
    await user.click(screen.getByLabelText('처음 한국에 오기(비자 받기·초청)'));
    expect(screen.getByLabelText(/언제부터 근무해야 하나요/)).toBeInTheDocument();
    await user.type(screen.getByLabelText(/비자를 받을 분의 국적/), '베트남');
    await user.click(screen.getByLabelText('아직 신청 전'));

    await user.click(screen.getByRole('button', { name: /상담 신청하기/ }));
    expect(fetchMock.mock.calls.some(([url]) => url === 'https://example.test/api/consult')).toBe(false);
    await user.click(screen.getByLabelText(/이 상담 신청 사실을 알렸습니다/));
    await user.click(screen.getByRole('button', { name: /상담 신청하기/ }));
    await screen.findByText(/JM-VISA-1/);
    expect(consultBody(fetchMock).visaIntake).toMatchObject({
      requester: 'company',
      subjectNotified: true,
      staffCount: '2-5',
      stayStatus: 'overseas',
      goal: 'first-entry',
      nationality: '베트남',
    });
  });

  it('불허·출국 안내를 고르면 받은 날짜와 마감일을 묻고 업무 범위를 안내한다', async () => {
    mockFetch();
    const user = userEvent.setup();
    renderPage('/consult?topic=visa');
    await user.click(screen.getByLabelText('출국하라는 안내(출국기한·출국명령)를 받음'));
    const alert = screen.getAllByRole('alert').find((el) => el.textContent?.includes('행정심판·소송의 청구와 대리는 행정사 업무가 아니어서'));
    expect(alert).toBeDefined();
    expect(screen.getByLabelText('받은 날짜')).toBeRequired();
    expect(within(screen.getByRole('group', { name: /문서에 적힌 마감일/ })).getAllByRole('radio')).toHaveLength(3);
  });

  it('이미 만료됨을 고르면 1345 확인을 바로 안내한다', async () => {
    mockFetch();
    const user = userEvent.setup();
    renderPage('/consult?topic=visa');
    await user.click(screen.getByLabelText('한국에 있음 · 이미 만료됨'));
    expect(screen.getByText(/외국인종합안내센터 1345\(해외 \+82-2-1345\)/)).toBeInTheDocument();
  });

  it('비자 진단에서 넘어오면 체류 상태·위반 이력은 다시 묻지 않고 목적은 네 가지만, 언어는 진단 언어로 고른다', async () => {
    mockFetch({
      schemaVersion: 1,
      visaSlug: 'e7',
      language: 'vi',
      answers: { stayStatus: 'valid', violationStatus: 'none', e7Occupation: 'confirmed', e7Contract: 'ready', e7Wage: 'meets' },
      level: 'checked',
      questionCount: 5,
      consent: true,
    });
    renderPage('/consult?topic=visa&visa=e7&handoff=abcdefghijklmnopqrstuvwx');
    expect(await screen.findByText(/체류 상태는 비자 진단에서 답하신 내용을 사용합니다/)).toBeInTheDocument();
    expect(screen.queryByLabelText('현재 해외에 있음')).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: /출국명령·과태료·범칙금/ })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('영주(F-5) 또는 귀화')).not.toBeInTheDocument();
    await waitFor(() => expect((screen.getByLabelText(/어떤 언어로 연락받기/) as HTMLSelectElement).value).toBe('vi'));
  });

  it('상담 내용 칸은 식별번호를 적지 말라고 안내하고 대상별 예시를 보여 준다', async () => {
    mockFetch();
    const user = userEvent.setup();
    renderPage('/consult?topic=visa');
    expect(screen.getByText(/주민등록번호·외국인등록번호·여권번호·운전면허번호,\s*계좌번호,\s*신분증·여권 사진,\s*병명 같은 진단 내용은\s*적거나 보내지 마세요/)).toBeInTheDocument();
    await user.click(screen.getByLabelText('한국에 사는 가족(배우자 등)을 초청하거나 함께 살려고 합니다'));
    expect(screen.getByLabelText(/상담 내용/)).toHaveAttribute('placeholder', expect.stringContaining('F-6'));
  });
});
