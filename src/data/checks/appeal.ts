import type { CheckDefinition } from '../../types/content';

export const appeal: CheckDefinition = {
  domain: 'appeal',
  title: '일반 행정심판 사전 점검',
  summary: '기관에서 받은 거절·취소 등 통지나 답을 기다리는 신청에 대해 날짜와 자료를 정리합니다.',
  intro: '최근에 받은 문서나 접수 기록을 떠올려 보세요. 법률 용어를 몰라도 답할 수 있습니다.',
  questions: [
    {
      id: 'appeal-stage',
      text: '기관에 신청하거나 기관에서 연락받은 뒤, 지금 어떤 상황인가요?',
      options: [
        { id: 'decision', label: '거절·취소·환수 등 결정이 적힌 통지를 받았어요', level: 'documents', note: '통지 첫 장과 끝 장을 포함해 받은 문서 전체를 챙기세요.' },
        { id: 'before', label: '결정 전에 의견이나 추가 자료를 내라는 안내를 받았어요', level: 'documents', note: '안내에서 요구한 내용과 답을 보낼 곳을 표시해 두세요.' },
        { id: 'waiting', label: '신청했는데 아직 답을 받지 못했어요', level: 'ready', note: '신청한 내용과 접수 날짜부터 적어 두세요.' },
        { id: 'spoken', label: '전화나 방문으로만 설명을 들었어요', level: 'official', note: '어느 기관에서 언제 어떤 설명을 들었는지 적고, 발송된 문서가 있는지 문의하세요.' },
        { id: 'unknown', label: '어디에 해당하는지 모르겠어요', level: 'ready', note: '최근에 한 신청이나 받은 연락 중 가장 기억나는 일부터 한 줄로 적으세요.' },
      ],
    },
    {
      id: 'appeal-delivery',
      showWhen: { 'appeal-stage': ['decision', 'before'] },
      text: '그 통지나 안내를 언제 받았는지 확인할 수 있나요?',
      options: [
        { id: 'record', label: '등기·전자통지·수령 기록에 날짜가 있어요', level: 'ready', note: '받은 날짜가 보이는 기록과 통지서를 함께 보관하세요.' },
        { id: 'memory', label: '대략 언제인지 기억해요', level: 'documents', note: '기억나는 날짜를 적고, 우편 봉투나 수신 알림에서 기록을 찾아보세요.' },
        { id: 'unknown', label: '언제 받았는지 모르겠어요', level: 'official', note: '보낸 기관에 발송 방법과 수령 기록을 확인할 수 있는지 물어보세요.' },
      ],
    },
    {
      id: 'appeal-reasons',
      showWhen: { 'appeal-stage': ['decision', 'before'] },
      text: '문서에서 기관이 이유를 설명한 부분을 찾으셨나요?',
      options: [
        { id: 'found', label: '찾았고 어느 부분인지 표시할 수 있어요', level: 'ready', note: '해당 문장 옆에 본인이 겪은 일과 같거나 다른 점을 적으세요.' },
        { id: 'unclear', label: '이유가 적혀 있지만 뜻이 어려워요', level: 'documents', note: '이해하기 어려운 문장을 표시해 상담 때 함께 살펴보세요.' },
        { id: 'unknown', label: '찾지 못했거나 전체 문서가 없어요', level: 'official', note: '별첨이나 뒷면이 있는지 확인하고, 누락된 쪽이 있으면 보낸 기관에 요청하세요.' },
      ],
    },
    {
      id: 'appeal-receipt',
      showWhen: { 'appeal-stage': ['waiting'] },
      text: '신청했다는 기록이 남아 있나요?',
      options: [
        { id: 'receipt', label: '접수번호·접수증·접수 알림이 있어요', level: 'ready', note: '접수번호로 처리 상황을 확인하고 마지막으로 확인한 날짜를 적으세요.' },
        { id: 'sent', label: '우편이나 온라인으로 보낸 기록만 있어요', level: 'official', note: '보낸 기록을 찾아 기관에 실제 접수 여부와 담당 부서를 확인하세요.' },
        { id: 'unknown', label: '기록이 없거나 잘 모르겠어요', level: 'official', note: '신청한 곳과 대략적인 시기를 떠올려 접수 내역을 문의하세요.' },
      ],
    },
    {
      id: 'appeal-contacts',
      text: '이 일로 기관에 의견을 내거나 다시 문의한 적이 있나요?',
      options: [
        { id: 'filed', label: '서류나 온라인으로 제출했어요', level: 'documents', note: '보낸 내용과 접수 기록, 이후에 온 답이 있으면 함께 챙기세요.' },
        { id: 'spoken', label: '전화하거나 방문해서 이야기했어요', level: 'ready', note: '연락한 날짜와 담당 부서, 들은 답을 기억나는 대로 적으세요.' },
        { id: 'none', label: '아직 없어요', level: 'ready', note: '기관에 확인하고 싶은 내용을 한 줄로 적어 두세요.' },
        { id: 'unknown', label: '기억나지 않아요', level: 'documents', note: '기관 이름으로 문자나 메일을 검색해 보세요.' },
      ],
    },
    {
      id: 'appeal-evidence',
      text: '당시 상황을 보여 줄 자료가 있나요?',
      options: [
        { id: 'held', label: '신청서 사본·문자·사진·거래 기록 등이 있어요', level: 'ready', note: '가장 관련 있는 자료부터 날짜순으로 모으세요.' },
        { id: 'elsewhere', label: '다른 사람이나 기관이 가지고 있어요', level: 'documents', note: '자료 이름과 보관하는 곳을 적고 사본을 받을 수 있는지 확인하세요.' },
        { id: 'unknown', label: '없거나 무엇을 찾아야 할지 모르겠어요', level: 'documents', note: '중요했던 날 한 번을 떠올려 누가 어떤 일을 했는지 적어 보세요.' },
      ],
    },
    {
      id: 'appeal-impact',
      showWhen: { 'appeal-stage': ['decision'] },
      text: '그 결정으로 실제 달라진 일이 있나요?',
      options: [
        { id: 'already', label: '지급이 끊기거나 하던 일을 멈추는 등 변화가 생겼어요', level: 'documents', note: '변화가 시작된 날과 이를 보여 줄 지급 내역이나 연락 기록을 챙기세요.' },
        { id: 'scheduled', label: '앞으로 달라지는 날짜가 적혀 있어요', level: 'documents', note: '어떤 일이 언제부터 달라지는지 통지서에 표시하세요.' },
        { id: 'none', label: '당장 달라진 일은 없어요', level: 'ready', note: '결정에서 다시 확인받고 싶은 점을 한 문장으로 정리하세요.' },
        { id: 'unknown', label: '어떤 영향이 있을지 모르겠어요', level: 'official', note: '통지를 보낸 기관에 결정 내용이 언제, 어떻게 적용되는지 문의하세요.' },
      ],
    },
    {
      id: 'appeal-date',
      showWhen: { 'appeal-stage': ['decision', 'before'] },
      text: '받은 문서에서 의견을 내거나 결정에 이의를 제기할 기한을 확인하셨나요?',
      options: [
        { id: 'near', label: '마감이 오늘·내일이거나 이미 지났어요', level: 'urgent', note: '문서와 수령 기록을 챙겨 안내된 접수처에 오늘 가능한 절차를 확인하세요.' },
        { id: 'later', label: '모레 이후 날짜가 적혀 있어요', level: 'ready', note: '어떤 절차의 날짜인지 표시하고 접수처·제출 방법을 함께 기록하세요.' },
        { id: 'period', label: '‘받은 날부터 며칠 이내’처럼 기간만 적혀 있어요', level: 'official', note: '문서에 적힌 표현과 받은 날짜를 함께 놓고 해당 절차의 마감일을 확인하세요.' },
        { id: 'unknown', label: '기한을 찾지 못했거나 잘 모르겠어요', level: 'official', note: '보낸 기관에 통지 제목과 수령일을 알려 주고 이후 절차와 기한을 확인하세요.' },
      ],
    },
  ],
};
