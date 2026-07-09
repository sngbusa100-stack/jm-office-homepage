import type { CheckDefinition } from '../../types/content';

export const veterans: CheckDefinition = {
  domain: 'veterans',
  title: '국가유공자 등록 사전 점검',
  intro: '신청 유형과 필요한 기록, 절차 단계를 정리합니다. 결과는 일반 정보이며 등록 결과에 대한 판단이 아닙니다.',
  questions: [
    {
      id: 'vet-applicant',
      text: '누구를 위한 신청인가요?',
      options: [
        { id: 'self', label: '본인', level: 'ready', note: '본인 신청입니다. 상이 경위와 현재 상태를 정리하는 것부터 시작하면 좋습니다.' },
        { id: 'family', label: '가족 · 유족', level: 'ready', note: '유족 신청은 신청 자격(유족 요건)과 선순위 여부 확인이 먼저 필요합니다.' },
      ],
    },
    {
      id: 'vet-type',
      text: '어떤 유형으로 신청하려 하시나요?',
      options: [
        { id: 'combat', label: '전상 · 공상 군경', level: 'ready', note: '국가유공자법상 전상·공상 요건(직무 수행·교육훈련 중 상이 등)에 해당하는지 확인해야 합니다.' },
        { id: 'died', label: '순직 관련', level: 'ready', note: '순직 유형은 사망 경위 확인과 유족 등록 절차를 함께 검토해야 합니다.' },
        { id: 'compensation', label: '보훈보상대상자', level: 'ready', note: '보훈보상대상자는 국가유공자와 요건·예우가 다릅니다. 어느 쪽에 해당하는지 확인이 필요합니다.' },
        { id: 'unknown', label: '모름', level: 'official', note: '국가유공자법과 보훈보상자법은 요건이 달라 어떤 유형에 해당하는지 판단하는 것이 출발점입니다.' },
      ],
    },
    {
      id: 'vet-stage',
      text: '현재 진행 단계는 어디인가요?',
      options: [
        { id: 'before', label: '아직 신청 전', level: 'ready', note: '신청 전 단계입니다. 필요한 기록과 서류를 미리 정리해 두면 심사 준비에 도움이 됩니다.' },
        { id: 'reviewing', label: '신청 후 심사 중', level: 'official', note: '심사 중 보완 요구가 올 수 있습니다. 요구 사항에 신속히 대응할 수 있도록 준비하세요.' },
        { id: 'rejected', label: '비해당 결정을 받음', level: 'official', note: '비해당 결정에 대해서는 재심의·행정심판 등 불복 절차와 각각의 기한을 검토해야 합니다.' },
        { id: 'appealing', label: '재심의 · 행정심판 검토 중', level: 'official', note: '불복 절차는 기한이 정해져 있습니다. 남은 기한과 필요한 입증 자료를 확인하세요.' },
      ],
    },
    {
      id: 'vet-elapsed',
      text: '비해당 결정 통지를 받은 지 얼마나 되었나요?',
      help: '행정심판은 처분이 있음을 안 날부터 90일 이내에 청구해야 합니다.',
      options: [
        { id: 'na', label: '해당 없음', level: 'ready', note: '아직 비해당 결정을 받지 않았다면 통지 수령일을 기록해 기한 계산의 기준으로 삼으세요.' },
        { id: 'within30', label: '30일 이내', level: 'ready', note: '행정심판 청구 기한(90일)이 남아 있습니다. 지금이 자료를 정리하기 좋은 시점입니다.', lawRef: '행정심판법 제27조' },
        { id: 'd30to90', label: '30일 ~ 90일', level: 'urgent', note: '행정심판 청구 기한(90일)이 임박했습니다. 지금 바로 기한을 확인해야 합니다.', lawRef: '행정심판법 제27조' },
        { id: 'over90', label: '90일이 지남', level: 'urgent', note: '원칙적으로 행정심판 청구 기한이 지났습니다. 예외 인정 여부는 국민권익위원회 상담전화(국번 없이 110) 또는 관할 기관에서 확인하세요.', lawRef: '행정심판법 제27조' },
      ],
    },
    {
      id: 'vet-connection',
      text: '공무 관련성을 입증할 자료(병상일지 · 사고경위서 등)가 있나요?',
      options: [
        { id: 'yes', label: '있음', level: 'ready', note: '확보한 자료가 상이 경위와 공무 관련성을 어떻게 뒷받침하는지 정리해 두세요.' },
        { id: 'partial', label: '일부만 있음', level: 'documents', note: '부족한 자료 목록을 만들어 발급 기관별로 확보 계획을 세우세요.' },
        { id: 'none', label: '없음', level: 'documents', note: '공무 관련성 입증 자료가 핵심입니다. 소속 기관·의무기록 등 발급 신청부터 시작하세요.' },
        { id: 'unsure', label: '무엇이 필요한지 모름', level: 'official', note: '유형별로 필요한 입증 자료가 다릅니다. 어떤 자료가 필요한지 확인하는 것이 우선입니다.' },
      ],
    },
    {
      id: 'vet-records',
      text: '의무기록(군 병원 · 민간 진료 기록)은 확보하셨나요?',
      options: [
        { id: 'yes', label: '확보함', level: 'ready', note: '확보한 의무기록이 상이 시점·경위와 어떻게 연결되는지 정리해 두세요.' },
        { id: 'partial', label: '일부만 있음', level: 'documents', note: '빠진 기간의 기록을 확인하고 추가 발급을 신청하세요.' },
        { id: 'none', label: '없음', level: 'documents', note: '의무기록은 국가기록원·병무청·해당 의료기관 등에서 발급받을 수 있습니다. 발급 경로부터 확인하세요.' },
      ],
    },
    {
      id: 'vet-current',
      text: '현재 상이 · 치료 상태를 보여줄 기록이 있나요?',
      options: [
        { id: 'yes', label: '있음', level: 'ready', note: '현재 상태 기록이 신체검사·상이등급 판정 자료로 어떻게 쓰일지 확인해 두세요.' },
        { id: 'none', label: '없음', level: 'documents', note: '현재 상태를 보여줄 진단서·검사 기록을 확보하는 것이 필요합니다.' },
      ],
    },
    {
      id: 'vet-history',
      text: '과거에 등록 신청을 한 적이 있나요?',
      options: [
        { id: 'first', label: '이번이 처음', level: 'ready', note: '첫 신청입니다. 요건과 필요한 서류를 처음부터 꼼꼼히 정리하는 것이 좋습니다.' },
        { id: 'once', label: '기각 1회', level: 'official', note: '이전 기각 사유를 분석하는 것이 재신청 준비의 출발점입니다. 결정 통지서를 확인하세요.' },
        { id: 'multi', label: '기각 2회 이상', level: 'official', note: '반복 기각의 경우 이전과 다른 새로운 입증 자료가 필요합니다. 무엇이 부족했는지 정리하세요.' },
      ],
    },
    {
      id: 'vet-consult',
      text: '보훈(지)청에 상담한 적이 있나요?',
      options: [
        { id: 'yes', label: '있음', level: 'ready', note: '상담에서 안내받은 필요 서류와 요건을 정리해 준비 상황과 대조해 보세요.' },
        { id: 'none', label: '없음', level: 'official', note: '관할 보훈(지)청 사전 상담을 통해 필요한 서류와 신청 유형을 먼저 확정하는 것이 좋습니다.' },
      ],
    },
  ],
};
