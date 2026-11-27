import type { CheckDefinition } from '../../types/content';

export const veterans: CheckDefinition = {
  domain: 'veterans',
  title: '국가유공자 등록 사전 점검',
  intro: '누구의 어떤 일을 계기로 신청하는지와 보유한 기록을 정리합니다. 신청 유형을 몰라도 답할 수 있습니다.',
  summary: '신청 경위와 보유한 기록, 최근 받은 보훈관서 안내를 정리합니다.',
  questions: [
    {
      id: 'vet-applicant',
      text: '누구의 일로 등록을 알아보고 계신가요?',
      options: [
        { id: 'self', label: '제 일로 알아보고 있어요', level: 'ready', note: '근무했던 기관과 사건이 있었던 때를 적어 두세요.' },
        { id: 'family', label: '가족의 일로 알아보고 있어요', level: 'ready', note: '당사자와의 관계를 알려 주면 누가 신청할 수 있는지 확인하는 데 도움이 됩니다.' },
        { id: 'other', label: '그 밖의 관계이거나 잘 모르겠어요', level: 'official', note: '당사자와의 관계를 설명하고 신청 방법을 관할 보훈관서에 물어보세요.' },
      ],
    },
    {
      id: 'vet-event',
      text: '등록을 알아보게 된 일은 무엇인가요?',
      help: '같은 일로 다치거나 병이 난 뒤 돌아가셨다면 ‘사망’을 골라 주세요.',
      options: [
        { id: 'injury', label: '복무·근무·훈련 중 다치거나 병이 생겼어요', level: 'ready', note: '언제 어디에서 어떤 일을 하던 중 다쳤거나 증상이 시작됐는지 적어 두세요.' },
        { id: 'death', label: '사망과 관련해 알아보고 있어요', level: 'ready', note: '돌아가신 날짜와 당시 소속, 가족이 들은 경위를 정리하세요.' },
        { id: 'other', label: '참전·공적 등 다른 일로 알아보고 있어요', level: 'ready', note: '참전 시기와 소속 등 이번 신청과 관련해 알고 있는 사실을 적어 두세요.' },
        { id: 'unknown', label: '경위를 아직 잘 몰라요', level: 'official', note: '당시 소속이나 대략적인 시기처럼 확인되는 사실부터 적어 두세요.' },
      ],
    },
    {
      id: 'vet-stage',
      text: '이번 신청에서 가장 최근에 한 일은 무엇인가요?',
      help: '결정 뒤 이미 이의신청이나 행정심판을 냈다면 ‘결정에 이의를 제기했어요’를 골라 주세요.',
      options: [
        { id: 'before', label: '아직 등록을 신청하지 않았어요', level: 'ready', note: '신청하려는 내용과 당사자의 소속을 관할 보훈관서에 알려 준비할 자료를 확인하세요.' },
        { id: 'reviewing', label: '등록을 신청했고 결정을 기다려요', level: 'ready', note: '접수번호와 최근 받은 안내를 보관하세요. 보완이나 검사 일정이 있다면 날짜를 확인하세요.' },
        { id: 'rejected', label: '등록 대상이 아니라는 결정서를 받았어요', level: 'official', note: '결정서에 적힌 사유와 받은 날짜를 확인하세요. 어떤 절차로 언제까지 다툴 수 있는지 함께 살펴보세요.' },
        { id: 'filed', label: '결정에 이의를 제기했어요', level: 'official', note: '제출한 서류 이름과 날짜, 접수번호를 확인하세요.' },
        { id: 'accepted', label: '등록됐다는 안내를 받았어요', level: 'ready', note: '발급 안내와 추가로 신청할 수 있는 지원을 확인하세요.' },
        { id: 'other', label: '다른 결정을 받았거나 진행 상태를 몰라요', level: 'official', note: '최근 문서 제목이나 접수번호로 관할 보훈관서에 현재 상태를 확인하세요.' },
      ],
    },
    {
      id: 'vet-elapsed',
      text: '등록 대상이 아니라는 결정서를 받은 지 얼마나 됐나요?',
      help: '결정서에 인쇄된 날짜와 실제 받은 날짜를 구분해 주세요.',
      showWhen: { 'vet-stage': ['rejected'] },
      options: [
        { id: 'within30', label: '받은 지 30일 이내예요', level: 'official', note: '일부 결정은 받은 날부터 30일 이내에 이의신청할 수 있습니다. 결정서에서 대상과 기한을 바로 확인하세요.', lawRef: '국가유공자 등 예우 및 지원에 관한 법률 제74조의18' },
        { id: 'd31to90', label: '받은 지 31~90일 됐어요', level: 'urgent', note: '취소를 구하는 행정심판은 원칙적으로 처분을 안 날부터 90일, 처분이 있은 날부터 180일 이내입니다. 이의신청 여부도 알려 기한을 확인하세요.', lawRef: '행정심판법 제27조' },
        { id: 'over90', label: '받은 지 90일이 넘었어요', level: 'urgent', note: '첫 결정과 이후 이의신청 결과가 있다면 두 문서를 함께 보세요. 받은 날짜와 불복 안내를 바탕으로 가능한 절차를 바로 확인하세요.', lawRef: '행정심판법 제27조' },
        { id: 'unknown', label: '언제 받았는지 모르겠어요', level: 'urgent', note: '등기 수령 내역이나 전자통지를 확인하고 관할 보훈관서에 발송·송달 내역을 문의하세요.', lawRef: '행정심판법 제27조' },
      ],
    },
    {
      id: 'vet-connection',
      text: '당시 무슨 일이 있었는지 보여 줄 자료를 갖고 계신가요?',
      help: '예를 들어 당시 소속에서 작성한 보고서, 사고 기록, 목격자 진술이 있습니다.',
      options: [
        { id: 'collected', label: '확인하려던 자료를 모두 갖고 있어요', level: 'ready', note: '자료에 적힌 시기·장소·소속을 확인해 사건 순서대로 모아 두세요.' },
        { id: 'partial', label: '일부만 있고 더 찾을 자료가 있어요', level: 'documents', note: '찾는 자료가 무엇인지, 누가 작성했는지 적어 두세요.' },
        { id: 'not-collected', label: '어떤 자료인지 알지만 가진 것이 없어요', level: 'documents', note: '당시 소속 기관에 어떤 기록이 남아 있고 어떻게 요청하는지 물어보세요.' },
        { id: 'unsure', label: '어떤 자료를 찾아야 할지 모르겠어요', level: 'official', note: '기억나는 경위를 적어 보훈관서에 문의하면 필요한 자료를 좁힐 수 있습니다.' },
      ],
    },
    {
      id: 'vet-records',
      text: '당시 진료받은 병원 기록을 갖고 계신가요?',
      help: '군 병원과 민간 병원의 진료·입원·검사 기록을 포함합니다.',
      showWhen: { 'vet-event': ['injury', 'death'] },
      options: [
        { id: 'collected', label: '찾으려던 진료기록을 모두 갖고 있어요', level: 'ready', note: '처음 진료받은 날짜와 병원 이름을 표시해 두세요.' },
        { id: 'partial', label: '일부만 있고 빠진 병원이나 기간이 있어요', level: 'documents', note: '빠진 병원과 진료 시기를 적어 기록 발급 방법을 문의하세요.' },
        { id: 'no-copies', label: '진료는 받았지만 가진 기록이 없어요', level: 'documents', note: '병원 이름과 대략적인 진료 시기를 정리해 기록이 남아 있는지 문의하세요.' },
        { id: 'no-treatment', label: '당시 진료받은 적이 없어요', level: 'ready', note: '처음 치료받은 시기나 당시 상태를 기억하는 사람이 있는지 적어 두세요.' },
        { id: 'unknown', label: '진료 여부나 기록 보유 여부를 모르겠어요', level: 'official', note: '당시 소속이나 가족에게 기억나는 병원과 시기를 확인해 보세요.' },
      ],
    },
    {
      id: 'vet-current',
      text: '지금 몸 상태를 보여 주는 진료·검사 기록이 있나요?',
      help: '최근 진료받은 병원의 진단서나 검사 결과가 예입니다.',
      showWhen: { 'vet-event': ['injury'] },
      options: [
        { id: 'yes', label: '갖고 있어요', level: 'ready', note: '가장 최근 진료일을 확인하고 이전 기록과 함께 정리하세요.' },
        { id: 'none', label: '갖고 있지 않아요', level: 'documents', note: '최근 진료받은 곳이 있다면 기록을 발급받을 수 있는지 물어보세요.' },
        { id: 'unknown', label: '어떤 기록이 있는지 모르겠어요', level: 'official', note: '최근 진료받은 병원과 시기를 먼저 적어 보세요.' },
      ],
    },
    {
      id: 'vet-history',
      text: '이번 건과 같은 일로 예전에 등록을 신청했나요?',
      help: '이번에 진행 중인 첫 신청은 ‘이번이 처음이에요’를 골라 주세요.',
      options: [
        { id: 'first', label: '이번이 처음이에요', level: 'ready', note: '처음 신청하는 경위와 당시 소속을 적어 두세요.' },
        { id: 'once', label: '예전에 한 번 등록 대상이 아니라는 결정을 받았어요', level: 'official', note: '이전 결정서의 사유를 확인하고 그때 냈던 자료를 함께 준비하세요.' },
        { id: 'multi', label: '예전에 두 번 이상 등록 대상이 아니라는 결정을 받았어요', level: 'official', note: '각 결정서를 받은 순서대로 놓고 사유와 제출 자료를 비교해 보세요.' },
        { id: 'other', label: '예전 신청은 있지만 위 경우와 달라요', level: 'official', note: '이전 접수번호나 결과 문서를 찾아 어떤 절차였는지 확인하세요.' },
        { id: 'unknown', label: '신청한 적이 있는지 모르겠어요', level: 'official', note: '당사자나 가족이 보관한 접수증·결정서부터 확인해 보세요.' },
      ],
    },
    {
      id: 'vet-consult',
      text: '이번 일로 보훈청이나 보훈지청에 문의한 적이 있나요?',
      options: [
        { id: 'yes', label: '문의한 적이 있어요', level: 'ready', note: '안내받은 서류 이름과 제출할 곳을 적어 두세요.' },
        { id: 'none', label: '아직 문의한 적이 없어요', level: 'official', note: '당시 소속과 신청하려는 일을 알려 관할 보훈관서와 준비할 자료를 확인하세요.' },
        { id: 'unknown', label: '문의했는지 기억나지 않아요', level: 'ready', note: '보관한 문자나 안내문이 있다면 상담 때 함께 확인하세요.' },
      ],
    },
  ],
};
