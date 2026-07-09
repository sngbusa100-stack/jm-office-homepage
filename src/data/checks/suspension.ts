import type { CheckDefinition } from '../../types/content';

export const suspension: CheckDefinition = {
  domain: 'suspension',
  title: '영업정지 처분 대응 사전 점검',
  intro: '처분이 어느 단계에 있는지, 남은 기한과 소명 준비는 무엇인지 정리합니다. 결과는 일반 정보이며 처분 결과에 대한 판단이 아닙니다.',
  questions: [
    {
      id: 'susp-business',
      text: '어떤 업종을 운영하고 계신가요?',
      options: [
        { id: 'restaurant', label: '음식점 · 주점', level: 'ready', note: '식품위생법상 처분 기준(별표)에 따라 위반 유형별 정지 일수가 정해집니다. 처분 근거 조항을 확인하세요.' },
        { id: 'karaoke', label: '노래방 · 게임장', level: 'ready', note: '음악산업진흥법·게임산업진흥법상 처분 기준이 적용됩니다. 어떤 조항으로 처분되었는지 확인하세요.' },
        { id: 'academy', label: '학원 · 교습소', level: 'ready', note: '학원의 설립·운영 및 과외교습에 관한 법률상 처분 기준을 확인해야 합니다.' },
        { id: 'other', label: '기타', level: 'official', note: '업종별 근거 법령이 다릅니다. 처분서에 기재된 근거 조항부터 확인하세요.' },
      ],
    },
    {
      id: 'susp-stage',
      text: '처분이 어느 단계에 있나요?',
      options: [
        { id: 'prenotice', label: '사전통지(의견제출 기간 중)', level: 'urgent', note: '처분 확정 전 소명 기회입니다. 정해진 기한 안에 의견제출을 하는 것이 무엇보다 중요합니다.', lawRef: '행정절차법 제21조' },
        { id: 'confirmed', label: '처분 확정 통지를 받음', level: 'official', note: '처분이 확정된 단계입니다. 이의신청·행정심판 등 불복 절차와 각각의 기한을 검토해야 합니다.' },
        { id: 'investigating', label: '아직 조사 중', level: 'ready', note: '조사 단계입니다. 사실관계를 정리하고 소명 자료를 미리 준비해 두면 이후 대응에 도움이 됩니다.' },
      ],
    },
    {
      id: 'susp-opinion-deadline',
      text: '의견제출 기한은 어떻게 되나요?',
      help: '행정청은 처분 전 당사자에게 의견제출 기회를 주어야 합니다.',
      options: [
        { id: 'remaining', label: '아직 기한이 남음', level: 'documents', note: '의견서와 이를 뒷받침할 증빙을 정리해 기한 안에 제출할 준비를 하세요.' },
        { id: 'soon', label: '3일 이내로 임박', level: 'urgent', note: '의견제출 기한이 임박했습니다. 지금 바로 의견서와 핵심 증빙을 준비해야 합니다.', lawRef: '행정절차법 제27조' },
        { id: 'passed', label: '이미 지남', level: 'official', note: '의견제출 기한이 지났다면 처분 확정 이후의 불복 절차와 그 기한을 확인해야 합니다.' },
        { id: 'na', label: '해당 없음', level: 'ready', note: '아직 사전통지 단계가 아니라면 통지가 오는 즉시 기한을 확인할 수 있도록 준비해 두세요.' },
      ],
    },
    {
      id: 'susp-elapsed',
      text: '확정 처분 통지를 받은 지 얼마나 되었나요?',
      help: '행정심판은 처분이 있음을 안 날부터 90일 이내에 청구해야 합니다.',
      options: [
        { id: 'within30', label: '30일 이내', level: 'ready', note: '행정심판 청구 기한(90일)이 남아 있습니다. 지금이 절차를 준비하기 좋은 시점입니다.', lawRef: '행정심판법 제27조' },
        { id: 'd30to60', label: '30일 ~ 60일', level: 'official', note: '남은 기한이 줄어들고 있습니다. 절차별 기한을 정리해 일정을 관리하세요.' },
        { id: 'd60to90', label: '60일 ~ 90일', level: 'urgent', note: '행정심판 청구 기한(90일)이 임박했습니다. 지금 바로 기한을 확인해야 합니다.', lawRef: '행정심판법 제27조' },
        { id: 'over90', label: '90일이 지남', level: 'urgent', note: '원칙적으로 행정심판 청구 기한이 지났습니다. 예외 인정 여부는 국민권익위원회 상담전화(국번 없이 110) 또는 관할 기관에서 확인하세요.', lawRef: '행정심판법 제27조' },
        { id: 'na', label: '해당 없음', level: 'ready', note: '아직 확정 통지를 받지 않았다면 통지 수령일을 기록해 기한 계산의 기준으로 삼으세요.' },
      ],
    },
    {
      id: 'susp-reason',
      text: '처분 사유는 무엇인가요?',
      options: [
        { id: 'youth', label: '청소년 주류 · 유해물 제공', level: 'official', note: '신분증 확인 여부와 확인 정황이 핵심 소명 포인트입니다. 관련 기록을 정리하세요.' },
        { id: 'hygiene', label: '위생 · 시설 기준 위반', level: 'documents', note: '지적 사항에 대한 시정 조치와 개선 내역을 증빙으로 정리해 두세요.' },
        { id: 'unlicensed', label: '무허가 · 변경 미신고', level: 'official', note: '누락된 허가·신고 요건을 확인하고 보완 가능 여부를 검토해야 합니다.' },
        { id: 'other', label: '기타', level: 'official', note: '처분서에 기재된 구체적 사유와 근거 조항을 먼저 확인하세요.' },
      ],
    },
    {
      id: 'susp-count',
      text: '같은 위반으로 처분받은 것은 몇 번째인가요?',
      options: [
        { id: 'first', label: '최초(1차)', level: 'ready', note: '1차 위반 처분 기준이 적용됩니다. 처분 일수가 기준에 맞는지 확인하세요.' },
        { id: 'second', label: '2차', level: 'official', note: '반복 위반은 가중 처분 대상이 될 수 있습니다. 이전 처분 이력과 함께 확인하세요.' },
        { id: 'third', label: '3차 이상', level: 'official', note: '가중 처분이나 허가 취소로 이어질 위험이 있습니다. 사안 전반을 검토해야 합니다.' },
      ],
    },
    {
      id: 'susp-livelihood',
      text: '이 영업이 생계에 어느 정도 비중을 차지하나요?',
      options: [
        { id: 'only', label: '유일한 생계수단', level: 'documents', note: '매출 자료와 부양 가족 증빙 등 생계 영향에 관한 자료를 준비하세요.' },
        { id: 'main', label: '주요 수입원', level: 'documents', note: '영업 의존도를 보여줄 수 있는 소득·거래 자료를 정리해 두세요.' },
        { id: 'side', label: '부수입', level: 'ready', note: '생계 영향 주장은 제한적이지만 처분의 적법성과 감경 요소는 별도로 검토할 수 있습니다.' },
      ],
    },
    {
      id: 'susp-execution',
      text: '영업정지 집행 일정은 어떻게 되나요?',
      options: [
        { id: 'imminent', label: '시작일이 지정됨 · 임박', level: 'urgent', note: '집행이 임박했다면 행정심판과 함께 집행정지 신청을 검토해야 합니다. 즉시 확인이 필요합니다.', lawRef: '행정심판법 제30조' },
        { id: 'notyet', label: '아직 시작 전', level: 'ready', note: '집행 전 단계입니다. 불복 절차와 집행정지 신청 가능성을 함께 준비할 수 있습니다.' },
        { id: 'ongoing', label: '이미 정지 중', level: 'official', note: '남은 정지 기간과 그에 따른 손실을 정리하고 대응 방향을 검토하세요.' },
      ],
    },
    {
      id: 'susp-evidence',
      text: '소명에 쓸 증빙(CCTV · 신분증 확인 기록 등)은 준비되어 있나요?',
      options: [
        { id: 'ready', label: '있음', level: 'ready', note: 'CCTV 등은 보존 기간이 짧을 수 있으니 원본 보존과 백업을 서둘러 확보하세요.' },
        { id: 'partial', label: '일부만 있음', level: 'documents', note: '부족한 자료 목록을 만들어 확보 가능한 것부터 정리하세요.' },
        { id: 'none', label: '없음', level: 'documents', note: '소명을 뒷받침할 자료가 없으면 불리합니다. 지금부터 확보를 시작하세요.' },
      ],
    },
    {
      id: 'susp-fine',
      text: '영업정지를 과징금으로 전환하는 제도를 알고 계신가요?',
      help: '일부 업종은 영업정지에 갈음하여 과징금을 부과받을 수 있습니다.',
      options: [
        { id: 'known', label: '알고 있고 검토를 원함', level: 'official', note: '과징금 전환은 업종·위반 유형별로 요건이 다릅니다. 해당 여부를 확인해야 합니다.' },
        { id: 'unknown', label: '모름', level: 'official', note: '업종에 따라 과징금 전환이 가능한 경우가 있습니다. 해당 여부를 확인해 볼 수 있습니다.' },
      ],
    },
  ],
};
