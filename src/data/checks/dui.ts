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
        { id: 'revoke', label: '면허 취소', level: 'official', note: '취소 처분도 이의신청·행정심판으로 감경을 다툴 수 있는 대상입니다. 결과는 사안별로 다르므로 관할 기관 절차를 확인하세요.' },
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
        { id: 'mid', label: '0.08% 이상 ~ 0.1% 이하', level: 'official', note: '취소 기준 구간입니다. 이의신청 감경은 생계 등 감경 사유가 있고, 감경 제외 사유(최근 5년 안 음주운전 전력, 인적 피해 사고, 측정 불응 등)가 없을 때 검토됩니다.', lawRef: '도로교통법 시행규칙 별표 28' },
        // 옛 'high'(0.1% 이상)는 정확히 0.1%를 포함해 뜻이 달라 새 id를 쓴다. 옛 답은 회신 초안에서 다시 묻는다.
        { id: 'over01', label: '0.1% 초과', level: 'official', note: '혈중알코올농도 0.1% 초과는 이의신청 감경 제외 사유입니다. 행정심판은 위원회가 처분이 지나치게 무거운지 따로 판단하지만, 같은 결과를 약속할 수는 없습니다.', lawRef: '도로교통법 시행규칙 별표 28' },
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
        { id: 'over90', label: '90일이 지남', level: 'urgent', note: '원칙적으로 행정심판 청구 기한이 지났습니다. 예외 인정 여부는 국민권익위원회 상담전화(국번 없이 110) 또는 관할 기관에서 확인하세요.', lawRef: '행정심판법 제27조' },
        { id: 'unknown', label: '모름', level: 'urgent', note: '기한 계산의 기준일을 모르는 상태가 가장 위험합니다. 통지서 수령일부터 확인하세요.', lawRef: '행정심판법 제27조' },
      ],
    },
    {
      id: 'dui-procedure',
      text: '이의신청 또는 행정심판을 이미 진행 중인가요?',
      options: [
        { id: 'no', label: '아니오', level: 'ready', note: '아직 절차를 시작하지 않았습니다. 기한 안에 어떤 절차를 선택할지 정해야 합니다.' },
        { id: 'objection', label: '이의신청을 하고 결과를 기다리는 중', level: 'official', note: '이의신청 결과를 통보받으면 그 날부터 90일 안에 행정심판을 청구할 수 있습니다. 결과 통지서를 받은 날을 꼭 기록하세요. 결과를 기다리지 않고 행정심판을 먼저 청구할 수도 있는데, 그러면 이 90일 특례는 적용되지 않습니다.', lawRef: '도로교통법 제94조' },
        { id: 'objection-result', label: '이의신청 결과를 통보받음', level: 'official', note: '이의신청 결과를 통보받은 날부터 90일 안에 행정심판을 청구할 수 있습니다. 처분 통지일이 아니라 결과 통보일부터 셉니다. 다만 결과를 받기 전에 이미 행정심판을 청구했다면 이 특례가 아니고, 이미 낸 사건에서 보충서면으로 다툽니다.', lawRef: '도로교통법 제94조' },
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
        { id: 'none', label: '최근 5년 안에는 없음 (그 전 전력은 있을 수 있음)', level: 'ready', note: '최근 5년 안 음주운전 전력은 이의신청 감경 제외 사유인데, 여기에는 해당하지 않습니다. 다만 5년보다 전의 음주운전 전력도 처분 단계에서 면허 취소 사유로 쓰일 수 있으니 전체 이력을 확인하세요.', lawRef: '도로교통법 제93조' },
        { id: 'once', label: '1회 있음', level: 'official', note: '최근 5년 안 음주운전 전력은 이의신청 감경 제외 사유입니다. 행정심판은 위원회가 따로 판단하지만, 같은 결과를 약속할 수는 없습니다.', lawRef: '도로교통법 시행규칙 별표 28' },
        { id: 'multi', label: '2회 이상', level: 'official', note: '최근 5년 안 음주운전 전력은 이의신청 감경 제외 사유입니다. 행정심판은 위원회가 따로 판단하지만, 같은 결과를 약속할 수는 없습니다.', lawRef: '도로교통법 시행규칙 별표 28' },
      ],
    },
    {
      id: 'dui-accident',
      text: '적발 당시 사고가 있었나요?',
      options: [
        { id: 'none', label: '사고 없음', level: 'ready', note: '단순 적발은 사고 동반 사안보다 감경 검토 폭이 넓습니다.' },
        { id: 'property', label: '물적 피해 사고', level: 'official', note: '피해 회복(합의·변제) 여부가 중요합니다. 관련 서류를 정리하세요.' },
        { id: 'injury', label: '인적 피해 사고', level: 'official', note: '음주운전 중 인적 피해 교통사고는 이의신청 감경 제외 사유입니다. 행정심판은 위원회가 따로 판단하지만, 같은 결과를 약속할 수는 없습니다.', lawRef: '도로교통법 시행규칙 별표 28' },
      ],
    },
    {
      id: 'dui-refusal',
      text: '음주 측정을 거부했나요?',
      options: [
        { id: 'no', label: '아니오', level: 'ready', note: '측정에 응한 경우 수치 기준으로 처분이 정해집니다.' },
        { id: 'yes', label: '예', level: 'official', note: '측정 거부는 별도의 취소 사유이고(도로교통법 제93조), 이의신청 감경 제외 사유이기도 합니다(시행규칙 별표 28). 처분 근거를 정확히 확인하세요.' },
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
  // 이의신청을 했거나 행정심판을 이미 냈으면 처분 통지일 기준 기한 안내가 달라진다(도로교통법 제94조 제3항).
  // 결과 통보 전에 행정심판을 먼저 청구한 사람은 결과 통보일부터 90일 특례 대상이 아니다.
  overrides: [
    {
      questionId: 'dui-elapsed',
      when: { 'dui-elapsed': ['d30to60', 'd60to90', 'over90'], 'dui-procedure': ['objection'] },
      note: '이의신청을 이미 하셨다면, 결과를 통보받은 날부터 90일 안에 행정심판을 청구할 수 있습니다. 처분 통지일 기준 기한이 지나도 이 기한은 따로 남습니다(결과 전에 행정심판을 먼저 청구하면 이 특례는 적용되지 않습니다). 결과 통지서를 받은 날을 꼭 기록하세요.',
      lawRef: '도로교통법 제94조',
    },
    {
      questionId: 'dui-elapsed',
      when: { 'dui-elapsed': ['none'], 'dui-procedure': ['objection-result'] },
      note: '처분 통지서는 받지 않았는데 이의신청 결과는 받으셨다면, 받은 문서가 처분 통지서인지 결과 통지서인지 먼저 확인하세요. 행정심판 기한은 이의신청 결과를 통보받은 날부터 90일입니다(결과 전에 이미 행정심판을 청구한 경우는 제외).',
      lawRef: '도로교통법 제94조',
    },
    {
      questionId: 'dui-elapsed',
      when: { 'dui-elapsed': ['within30', 'd30to60', 'd60to90', 'over90', 'unknown'], 'dui-procedure': ['objection-result'] },
      note: '이의신청 결과를 통보받으셨다면, 행정심판 기한은 처분 통지일이 아니라 결과를 통보받은 날부터 90일입니다(결과 전에 이미 행정심판을 청구한 경우는 제외). 결과 통지서를 받은 날부터 며칠이 지났는지 먼저 확인하세요.',
      lawRef: '도로교통법 제94조',
    },
    {
      questionId: 'dui-elapsed',
      when: { 'dui-elapsed': ['d30to60', 'd60to90', 'over90'], 'dui-procedure': ['appeal'] },
      note: '이미 행정심판을 청구하셨다면, 기한 안에 냈는지는 청구한 날을 기준으로 봅니다. 지금은 위원회가 정하는 보정·보충 서면 기한을 확인하세요.',
      lawRef: '행정심판법 제27조',
    },
  ],
};
