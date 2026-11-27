import type { CheckDefinition } from '../../types/content';

export const suspension: CheckDefinition = {
  domain: 'suspension',
  title: '영업정지 처분 대응 사전 점검',
  intro: '최근 받은 문서를 기준으로 의견을 낼 날짜, 영업정지 일정, 준비할 자료를 확인합니다.',
  summary: '영업정지 통지서의 날짜와 설명에 필요한 자료를 정리합니다.',
  questions: [
    {
      id: 'susp-business',
      text: '이번 안내를 받은 사업장은 어떤 업종인가요?',
      options: [
        { id: 'restaurant', label: '음식점·주점이에요', level: 'ready', note: '영업신고증이나 허가증에 적힌 업종명을 확인하세요.' },
        { id: 'karaoke', label: '노래연습장·게임장이에요', level: 'ready', note: '등록증에 적힌 업종명과 실제 영업 내용을 확인하세요.' },
        { id: 'academy', label: '학원·교습소예요', level: 'ready', note: '등록증이나 신고증과 교육지원청에서 받은 문서를 함께 보관하세요.' },
        { id: 'other', label: '그 밖의 업종이에요', level: 'official', note: '영업 관련 증서와 이번 통지서에 적힌 사업장 이름을 확인하세요.' },
        { id: 'unknown', label: '정확한 업종명을 모르겠어요', level: 'ready', note: '신고증·등록증·허가증의 업종란을 확인해 주세요.' },
      ],
    },
    {
      id: 'susp-stage',
      text: '영업정지에 관해 가장 최근 받은 안내는 무엇인가요?',
      help: '문서 제목이나 첫 장을 보세요. ‘사전통지’와 ‘처분통지’는 이후 할 일이 다릅니다.',
      options: [
        { id: 'prior-notice', label: '사전통지서나 의견을 내라는 안내가 왔어요', level: 'documents', note: '의견을 어디로 언제까지 내야 하는지 먼저 확인하세요.', lawRef: '행정절차법 제21조' },
        { id: 'confirmed', label: '영업정지를 명하는 최종 처분서를 받았어요', level: 'official', note: '처분 사유와 영업정지 기간, 불복 방법이 적힌 부분을 확인하세요.' },
        { id: 'investigating', label: '점검이나 조사만 받았어요', level: 'ready', note: '조사 날짜와 당시 설명한 내용을 메모하고 받은 서류를 모아 두세요.' },
        { id: 'none', label: '아직 점검이나 통지를 받은 적이 없어요', level: 'ready', note: '걱정되는 상황이 생긴 날짜와 내용을 적어 두세요.' },
        { id: 'unknown', label: '연락은 받았지만 어떤 단계인지 모르겠어요', level: 'official', note: '연락한 부서에 문서 제목과 예정된 절차를 문의하세요.' },
      ],
    },
    {
      id: 'susp-opinion-deadline',
      text: '의견을 내라는 안내에 적힌 마감일은 언제인가요?',
      showWhen: { 'susp-stage': ['prior-notice'] },
      options: [
        { id: 'four-plus', label: '4일 이상 남았어요', level: 'documents', note: '설명할 사실과 제출할 자료를 정리해 안내된 기한까지 내세요.' },
        { id: 'soon', label: '오늘이 마감이거나 1~3일 남았어요', level: 'urgent', note: '오늘 제출 방법과 마감 시간을 확인하고 설명할 사실부터 정리하세요.', lawRef: '행정절차법 제27조' },
        { id: 'passed', label: '마감일이 지났어요', level: 'urgent', note: '최종 처분이 나왔는지, 지금이라도 의견을 받을 수 있는지 담당 부서에 바로 물어보세요.', lawRef: '행정절차법 제27조' },
        { id: 'unknown', label: '마감일을 찾지 못했어요', level: 'urgent', note: '문서에 적힌 담당 부서에 연락해 의견을 낼 날짜와 방법을 확인하세요.', lawRef: '행정절차법 제27조' },
      ],
    },
    {
      id: 'susp-elapsed',
      text: '영업정지 처분서를 받은 지 얼마나 됐나요?',
      help: '문서를 실제 받은 날을 기준으로 골라 주세요. 행정심판 기한은 처분을 알게 된 날과 처분일도 함께 봅니다.',
      showWhen: { 'susp-stage': ['confirmed'] },
      options: [
        { id: 'within30', label: '받은 지 30일 이내예요', level: 'official', note: '처분을 처음 안 날과 받은 날을 적어 두세요. 취소를 구하는 행정심판은 원칙적으로 안 날부터 90일, 처분이 있은 날부터 180일 이내입니다.', lawRef: '행정심판법 제27조' },
        { id: 'd31to60', label: '받은 지 31~60일 됐어요', level: 'official', note: '통지서와 수령 내역을 함께 보관하고, 다투려는 절차의 마감일을 확인하세요.' },
        { id: 'd61to90', label: '받은 지 61~90일 됐어요', level: 'urgent', note: '처분을 처음 안 날과 처분일을 확인해 행정심판을 언제까지 청구할 수 있는지 바로 확인하세요.', lawRef: '행정심판법 제27조' },
        { id: 'over90', label: '받은 지 90일이 넘었어요', level: 'urgent', note: '불복 방법을 어떻게 안내받았는지와 이후 밟은 절차를 알려 가능한 대응을 바로 확인하세요.', lawRef: '행정심판법 제27조' },
        { id: 'unknown', label: '언제 받았는지 모르겠어요', level: 'urgent', note: '등기 수령 내역이나 전자문서 기록을 확인하고 문서를 보낸 부서에 송달일을 문의하세요.', lawRef: '행정심판법 제27조' },
      ],
    },
    {
      id: 'susp-reason',
      text: '문서나 조사에서 어떤 일을 지적받으셨나요?',
      help: '여러 사유가 있다면 처음 적힌 사유를 골라 주세요.',
      options: [
        { id: 'youth', label: '청소년에게 술이나 유해물을 제공한 일이에요', level: 'official', note: '당시 상황과 나이를 어떻게 확인했는지 기록이 있다면 정리하세요.' },
        { id: 'hygiene', label: '위생이나 시설 상태를 지적받았어요', level: 'documents', note: '점검 당시 사진과 지적받은 내용, 이후 고친 내역을 구분해 보관하세요.' },
        { id: 'unlicensed', label: '허가를 받지 않았거나 변경 신고를 하지 않았다는 내용이에요', level: 'official', note: '기존 증서, 실제 영업·변경 날짜, 신고 내역을 함께 확인하세요.' },
        { id: 'other', label: '다른 사유예요', level: 'official', note: '문서에서 문제가 된 행동이나 날짜가 적힌 부분을 표시하세요.' },
        { id: 'unknown', label: '아직 사유를 듣지 못했거나 잘 모르겠어요', level: 'official', note: '연락한 기관에 어떤 일에 대한 조사나 통지인지 물어보세요.' },
      ],
    },
    {
      id: 'susp-count',
      text: '이번과 같은 일로 전에 처분받은 적이 있나요?',
      help: '이번 건을 제외한 예전 처분만 세어 주세요.',
      options: [
        { id: 'first', label: '전에는 없었어요', level: 'ready', note: '이번 점검일과 처분서에 적힌 내용을 기록하세요.' },
        { id: 'second', label: '전에 한 번 있었어요', level: 'official', note: '그때 받은 처분서에서 날짜와 사유를 확인하세요.' },
        { id: 'third', label: '전에 두 번 이상 있었어요', level: 'official', note: '이전 처분서를 날짜순으로 모아 이번에 지적된 내용과 비교하세요.' },
        { id: 'unknown', label: '기억나지 않거나 같은 사유인지 모르겠어요', level: 'official', note: '과거 문서에서 지적된 내용과 처분 날짜를 확인하세요.' },
      ],
    },
    {
      id: 'susp-livelihood',
      text: '사업장 수입이 생활비에서 어느 정도를 차지하나요?',
      options: [
        { id: 'only', label: '생활비가 모두 이 사업장에서 나와요', level: 'documents', note: '매출과 매달 나가는 비용을 보여 줄 자료를 정리하세요.' },
        { id: 'main', label: '다른 수입도 있지만 이 사업장 수입이 가장 커요', level: 'documents', note: '최근 매출과 생활비에 쓰는 금액을 설명할 자료를 모아 두세요.' },
        { id: 'side', label: '이 사업장 수입은 부수입이에요', level: 'ready', note: '영업정지로 영향을 받을 계약이나 직원 근무 일정이 있으면 정리하세요.' },
        { id: 'other', label: '해당되지 않거나 잘 모르겠어요', level: 'ready', note: '확인되는 매출, 임차료, 임금 등 사업장에 생길 영향을 적어 보세요.' },
      ],
    },
    {
      id: 'susp-execution',
      text: '처분서에 적힌 영업정지 기간은 언제인가요?',
      showWhen: { 'susp-stage': ['confirmed'] },
      options: [
        { id: 'scheduled', label: '시작일이 정해졌고 아직 시작 전이에요', level: 'urgent', note: '행정심판을 청구해도 영업정지 효력은 자동으로 멈추지 않습니다. 시작일 전에 집행정지를 신청할 필요가 있는지 확인하세요.', lawRef: '행정심판법 제30조' },
        { id: 'ongoing', label: '이미 시작됐고 아직 끝나지 않았어요', level: 'urgent', note: '남은 기간과 예상 손해를 정리해 집행정지 등 가능한 절차를 바로 확인하세요.', lawRef: '행정심판법 제30조' },
        { id: 'finished', label: '정지 기간이 끝났어요', level: 'official', note: '처분서와 실제 정지 기간을 보관하고 이후 영업에 미치는 영향을 확인하세요.' },
        { id: 'no-date', label: '시작일이 정해지지 않았다고 안내받았어요', level: 'official', note: '일정을 어떻게 통보받는지 처분서를 보낸 부서에 확인하세요.' },
        { id: 'unknown', label: '날짜를 모르겠어요', level: 'official', note: '처분서에 적힌 담당 부서에 시작일과 종료일을 바로 물어보세요.' },
      ],
    },
    {
      id: 'susp-evidence',
      text: '당시 상황을 설명할 자료를 얼마나 모으셨나요?',
      help: '예를 들면 점검표, 영수증, 현장 사진, CCTV 영상입니다.',
      options: [
        { id: 'collected', label: '설명에 쓸 자료를 모두 모았어요', level: 'ready', note: '자료마다 날짜와 어떤 사실을 보여 주는지 짧게 적어 두세요.' },
        { id: 'partial', label: '일부만 모았어요', level: 'documents', note: '남은 자료 중 영상처럼 보관 기간이 짧은 것부터 확인하세요.' },
        { id: 'none', label: '아직 모은 자료가 없어요', level: 'documents', note: '당시 근무자, 현장 기록, 제출한 서류 중 확보할 수 있는 것을 적어 보세요.' },
        { id: 'unknown', label: '무엇을 찾아야 할지 모르겠어요', level: 'official', note: '지적받은 내용을 먼저 확인하고 그날 상황을 보여 줄 자료를 찾아보세요.' },
      ],
    },
    {
      id: 'susp-fine-advice',
      text: '영업정지 대신 과징금을 내는 방법을 안내받으셨나요?',
      help: '받은 문서나 담당자의 안내를 기준으로 골라 주세요.',
      showWhen: { 'susp-stage': ['prior-notice', 'confirmed'] },
      options: [
        { id: 'available', label: '검토할 수 있다고 안내받았어요', level: 'official', note: '요청 서류와 신청 방법을 담당 부서에 확인하세요.' },
        { id: 'unavailable', label: '이번 건은 대상이 아니라고 안내받았어요', level: 'official', note: '안내받은 이유와 문서에 적힌 처분 내용을 함께 확인하세요.' },
        { id: 'none', label: '그런 안내를 받지 않았어요', level: 'ready', note: '과징금이 가능한지 알고 싶다면 담당 부서에 업종과 지적 사유를 알려 문의하세요.' },
        { id: 'unknown', label: '안내받았는지 기억나지 않아요', level: 'ready', note: '처분서에 과징금 관련 안내가 있는지 살펴보세요.' },
      ],
    },
  ],
};
