import type { CheckDefinition } from '../../types/content';

export const land: CheckDefinition = {
  domain: 'land',
  title: '토지개발·보상·문서 사전 점검',
  summary: '토지 이용 계획, 보상 통지, 내용증명이나 계약서 중 내 일에 맞는 자료를 정리합니다.',
  intro: '지금 도움이 필요한 일을 고르세요. 기억나는 내용과 가지고 있는 자료만으로 답할 수 있습니다.',
  questions: [
    {
      id: 'land-topic',
      text: '지금 가장 먼저 준비하려는 일은 무엇인가요?',
      options: [
        { id: 'development', label: '땅을 사거나 용도를 바꾸거나 나누려 해요', level: 'ready', note: '살펴보는 땅의 위치와 그곳에서 하려는 일을 적어 두세요.' },
        { id: 'compensation', label: '토지나 건물 보상에 관해 안내를 받았어요', level: 'ready', note: '안내한 기관과 사업 이름을 적어 두세요.' },
        { id: 'notice', label: '상대방에게 내용증명을 보내려 해요', level: 'ready', note: '상대방에게 요청할 일과 그 이유를 한 문장씩 적어 보세요.' },
        { id: 'contract', label: '계약서를 작성하거나 살펴보려 해요', level: 'ready', note: '계약할 때 서로 맡기로 한 일과 금액을 적어 두세요.' },
        { id: 'unknown', label: '다른 일이거나 어디에 해당하는지 모르겠어요', level: 'ready', note: '최근에 있었던 일과 지금 도움받고 싶은 일을 한 줄씩 적어 두세요.' },
      ],
    },
    {
      id: 'land-use',
      showWhen: { 'land-topic': ['development'] },
      text: '그 땅에서 무엇을 하려 하시나요?',
      options: [
        { id: 'build', label: '주택·창고 등 건물이나 시설을 지으려 해요', level: 'ready', note: '시설을 어디에, 얼마나 크게 지으려는지 대략 표시해 보세요.' },
        { id: 'ground', label: '흙을 메우거나 주차장·야적장 등으로 쓰려 해요', level: 'ready', note: '손대려는 부분과 지금 땅의 모습을 사진이나 그림에 표시하세요.' },
        { id: 'split', label: '땅을 여러 필지로 나누려 해요', level: 'ready', note: '지도에 나누려는 경계를 대략 그려 두세요.' },
        { id: 'unknown', label: '다른 용도이거나 아직 정하지 않았어요', level: 'ready', note: '후보 용도와 계약 전에 알고 싶은 점을 적어 두세요.' },
      ],
    },
    {
      id: 'land-location',
      showWhen: { 'land-topic': ['development'] },
      text: '후보지를 어떤 자료에서 찾을 수 있나요?',
      options: [
        { id: 'parcel', label: '지번이 적힌 자료가 있어요', level: 'ready', note: '자료에서 시·군·구부터 지번까지 표시해 두세요.' },
        { id: 'map', label: '지번은 모르지만 지도에서 찾을 수 있어요', level: 'documents', note: '지도에 후보지를 표시해 두면 지번을 함께 찾을 수 있습니다.' },
        { id: 'unknown', label: '아직 후보지가 없거나 위치를 잘 모르겠어요', level: 'ready', note: '생각 중인 지역과 필요한 면적부터 적어 보세요.' },
      ],
    },
    {
      id: 'land-compensation-paper',
      showWhen: { 'land-topic': ['compensation'] },
      text: '가장 최근 받은 보상 관련 문서에 어떤 말이 있나요?',
      options: [
        { id: 'inventory', label: '보상계획 열람·토지조서·물건조서', level: 'documents', note: '목록에서 내 토지·건물·나무 등이 적힌 부분을 찾아 표시하세요.' },
        { id: 'offer', label: '보상금액·협의 요청', level: 'documents', note: '금액이 적힌 페이지와 협의 일정을 함께 챙기세요.' },
        { id: 'decision', label: '수용재결·이의재결', level: 'official', note: '재결서 전체와 받은 날을 확인할 등기 기록을 함께 두고 후속 일정을 확인하세요.' },
        { id: 'unknown', label: '다른 문서이거나 말로만 안내받았어요', level: 'official', note: '안내한 곳에 문서 제목과 사본을 어디서 받을 수 있는지 물어보세요.' },
      ],
    },
    {
      id: 'land-compensation-list',
      showWhen: { 'land-topic': ['compensation'], 'land-compensation-paper': ['inventory', 'offer'] },
      text: '받은 목록과 실제 현장을 비교해 보셨나요?',
      options: [
        { id: 'difference', label: '빠진 물건이나 다르게 적힌 부분이 보여요', level: 'documents', note: '해당 줄을 표시하고 현장 사진과 나란히 놓아 보세요.' },
        { id: 'compared', label: '살펴봤고 눈에 띄는 차이는 없어요', level: 'ready', note: '확인한 목록 옆에 비교한 날짜를 적어 두세요.' },
        { id: 'unknown', label: '아직 비교하지 않았거나 목록이 없어요', level: 'documents', note: '받은 자료 중 토지와 물건을 적은 목록이 있는지 살펴보세요.' },
      ],
    },
    {
      id: 'land-notice',
      showWhen: { 'land-topic': ['notice'] },
      text: '상대방에게 같은 요청을 한 적이 있나요?',
      options: [
        { id: 'record', label: '문자·이메일·우편으로 보냈어요', level: 'ready', note: '마지막으로 보낸 내용과 날짜, 받은 답장을 함께 정리하세요.' },
        { id: 'spoken', label: '전화나 대면으로 이야기했어요', level: 'documents', note: '대화한 날과 서로 한 말을 기억나는 범위에서 적어 두세요.' },
        { id: 'first', label: '이번이 처음이에요', level: 'ready', note: '요청할 내용과 관련된 계약서나 거래 내역을 찾아 두세요.' },
        { id: 'unknown', label: '기억나지 않아요', level: 'documents', note: '문자나 이메일에서 상대방 이름과 거래 날짜로 찾아보세요.' },
      ],
    },
    {
      id: 'land-contract',
      showWhen: { 'land-topic': ['contract'] },
      text: '계약서는 어느 단계에 있나요?',
      options: [
        { id: 'draft', label: '초안이 있고 아직 서명 전이에요', level: 'documents', note: '최신 초안에서 금액·날짜·해지 조건 중 묻고 싶은 부분에 표시하세요.' },
        { id: 'signed', label: '이미 서명한 계약서가 있어요', level: 'documents', note: '서명본과 이후에 내용을 바꾸기로 한 문자나 메일을 함께 챙기세요.' },
        { id: 'verbal', label: '아직 말로만 내용을 정했어요', level: 'ready', note: '합의한 내용과 아직 정하지 않은 내용을 나누어 적으세요.' },
        { id: 'unknown', label: '계약서가 어디 있는지 모르겠어요', level: 'documents', note: '계약서를 주고받은 사람에게 최신 사본을 요청하세요.' },
      ],
    },
    {
      id: 'land-schedule',
      text: '받은 안내에 제출하거나 회신할 날짜가 적혀 있나요?',
      help: '직접 정한 계약 희망일이나 착공 예정일만 있으면 ‘받은 기한은 없어요’를 고르세요.',
      options: [
        { id: 'due', label: '오늘·내일이거나 이미 지났어요', level: 'urgent', note: '날짜가 적힌 문서를 꺼내 안내한 곳에 지금 가능한 제출·회신 방법을 확인하세요.' },
        { id: 'later', label: '모레 이후 날짜가 적혀 있어요', level: 'ready', note: '안내에 적힌 날짜와 제출·회신 방법을 같이 기록하세요.' },
        { id: 'none', label: '받은 기한은 없어요', level: 'ready', note: '계약이나 현장 방문 등 따로 잡아 둔 일정이 있으면 상담 때 알려주세요.' },
        { id: 'unknown', label: '날짜가 있는지 잘 모르겠어요', level: 'official', note: '최근 받은 안내에서 기한이나 회신 날짜가 적힌 부분을 찾아보세요.' },
      ],
    },
  ],
};
