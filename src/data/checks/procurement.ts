import type { CheckDefinition } from '../../types/content';

export const procurement: CheckDefinition = {
  domain: 'procurement',
  title: '공공조달·기업인증 사전 점검',
  summary: '직접생산확인·여성기업확인·나라장터 등록을 준비할 때 챙길 자료와 일정을 정리합니다.',
  intro: '참여하려는 공고나 거래처에서 들은 말부터 떠올려 보세요. 아직 무엇을 신청할지 몰라도 시작할 수 있습니다.',
  questions: [
    {
      id: 'procurement-topic',
      text: '어떤 일을 준비하고 계세요?',
      options: [
        { id: 'production', label: '우리 공장에서 만든 제품이라는 확인을 받고 싶어요(직접생산확인)', level: 'ready', note: '신청할 제품 이름과 실제로 만드는 장소를 적어 두세요.' },
        { id: 'women', label: '여성기업 확인서를 발급받고 싶어요(여성기업확인)', level: 'ready', note: '사업자등록증에서 사업자 이름과 대표자 표기를 확인하세요.' },
        { id: 'registration', label: '나라장터 입찰에 처음 참여하려고 해요(입찰참가자격 등록)', level: 'ready', note: '공급할 물품이나 제공할 용역·공사의 이름을 적어 두세요.' },
        { id: 'unknown', label: '무엇부터 해야 할지 모르겠어요', level: 'documents', note: '공고나 거래처 요청에서 준비해 달라는 서류 이름을 그대로 적어 두세요.' },
      ],
    },
    {
      id: 'procurement-notice',
      text: '참여하려는 입찰 공고가 있나요?',
      options: [
        { id: 'saved', label: '공고문이나 공고번호가 있어요', level: 'ready', note: '공고번호와 참가 자격이 적힌 부분을 표시해 두세요.' },
        { id: 'heard', label: '공고가 있다는 말만 들었어요', level: 'documents', note: '알려준 곳에 공고번호나 공고 링크를 요청하세요.' },
        { id: 'none', label: '정해진 공고 없이 미리 준비하고 있어요', level: 'ready', note: '앞으로 납품할 제품이나 참여하고 싶은 사업부터 정리하세요.' },
        { id: 'unknown', label: '공고가 있는지 모르겠어요', level: 'ready', note: '요청받은 서류나 거래처에서 받은 메시지가 있으면 챙겨 두세요.' },
      ],
    },
    {
      id: 'procurement-production',
      showWhen: { 'procurement-topic': ['production'] },
      text: '신청할 제품을 누가 만드나요?',
      options: [
        { id: 'own', label: '우리 사업장에서 전 과정을 맡아요', level: 'documents', note: '제품 하나가 완성될 때까지 쓰는 설비와 작업 순서를 적으세요.' },
        { id: 'partial', label: '일부는 우리 사업장에서 하고 일부는 맡겨요', level: 'documents', note: '직접 하는 작업과 외부에 맡기는 작업을 나누어 적으세요.' },
        { id: 'purchased', label: '다른 업체가 만든 완제품을 공급해요', level: 'official', note: '공고에 적힌 물품명과 제조·공급 구분을 확인하세요.' },
        { id: 'unknown', label: '아직 제품이나 생산 방식을 정하지 않았어요', level: 'ready', note: '후보 제품이 여러 개라면 먼저 신청하려는 제품부터 정하세요.' },
      ],
    },
    {
      id: 'procurement-business',
      showWhen: { 'procurement-topic': ['women'] },
      text: '어떤 형태의 사업체를 운영하시나요?',
      options: [
        { id: 'individual', label: '개인사업자예요', level: 'ready', note: '사업자등록증과 대표가 평소 맡는 일을 보여 줄 자료를 찾아 두세요.' },
        { id: 'company', label: '주식회사 등 회사예요', level: 'documents', note: '법인 등기사항증명서와 현재 출자 내역을 확인할 자료를 챙기세요.' },
        { id: 'cooperative', label: '협동조합이에요', level: 'documents', note: '최근 조합원·임원 명단과 출자 내역을 찾아 두세요.' },
        { id: 'unknown', label: '다른 형태이거나 잘 모르겠어요', level: 'ready', note: '사업자등록증에 적힌 이름과 대표자부터 확인하세요.' },
      ],
    },
    {
      id: 'procurement-supply',
      showWhen: { 'procurement-topic': ['registration'] },
      text: '나라장터에서 무엇을 공급하려 하시나요?',
      options: [
        { id: 'manufacture', label: '직접 만든 물품', level: 'documents', note: '제조할 물품명과 사업장 주소가 적힌 자료를 챙기세요.' },
        { id: 'goods', label: '매입한 물품', level: 'ready', note: '공급하려는 물품의 이름과 규격을 적어 두세요.' },
        { id: 'services', label: '용역이나 공사', level: 'documents', note: '하려는 일의 이름을 적고, 이미 보유한 면허·등록증이 있으면 함께 챙기세요.' },
        { id: 'unknown', label: '그 밖의 업무이거나 아직 정하지 않았어요', level: 'ready', note: '공고가 있다면 제목과 실제 맡으려는 일을 적어 두세요.' },
      ],
    },
    {
      id: 'procurement-stage',
      text: '선택한 확인이나 등록을 어디까지 진행하셨나요?',
      options: [
        { id: 'new', label: '처음 준비하고 있어요', level: 'ready', note: '먼저 신청할 업무와 공고가 정해졌는지 상담 때 알려주세요.' },
        { id: 'filed', label: '신청했고 답을 기다리고 있어요', level: 'ready', note: '접수일과 접수번호를 기록해 두세요.' },
        { id: 'requested', label: '보완이나 현장 확인 연락을 받았어요', level: 'documents', note: '요청한 자료, 방문 장소와 담당자 연락처를 받은 안내에서 표시하세요.' },
        { id: 'existing', label: '이미 받은 확인서나 등록 내역이 있어요', level: 'ready', note: '최근 확인서나 등록 화면에서 품목·업종과 유효기간 표시를 살펴보세요.' },
        { id: 'unknown', label: '진행한 적이 있는지 모르겠어요', level: 'documents', note: '이전 담당자나 업무용 메일에서 접수 알림과 발급 기록을 찾아보세요.' },
      ],
    },
    {
      id: 'procurement-changes',
      showWhen: { 'procurement-stage': ['filed', 'requested', 'existing'] },
      text: '신청하거나 등록한 뒤 회사 정보가 바뀌었나요?',
      options: [
        { id: 'changed', label: '대표자·상호·사업장·공장 등에 변경이 있어요', level: 'documents', note: '바뀐 항목과 날짜를 적고, 이전 등록 내역과 현재 자료를 함께 챙기세요.' },
        { id: 'same', label: '기억하는 변경 사항이 없어요', level: 'ready', note: '최근 신청서나 확인서의 대표자·주소를 현재 정보와 대조하세요.' },
        { id: 'unknown', label: '잘 모르겠어요', level: 'documents', note: '최근 사업자등록증과 신청 당시 자료를 나란히 놓고 확인하세요.' },
      ],
    },
    {
      id: 'procurement-date',
      text: '공고나 기관 안내에 적힌 가장 가까운 마감은 언제인가요?',
      options: [
        { id: 'near', label: '오늘·내일이거나 이미 지났어요', level: 'urgent', note: '공고나 보완 안내의 마감 시각을 확인하고, 안내한 곳에 지금 가능한 절차를 문의하세요.' },
        { id: 'later', label: '모레 이후예요', level: 'ready', note: '각 마감의 이름과 날짜·시각을 함께 기록하세요.' },
        { id: 'none', label: '정해진 마감이 없어요', level: 'ready', note: '공고가 정해지면 참가등록과 입찰서 제출 날짜를 각각 확인하세요.' },
        { id: 'unknown', label: '마감이 있는지 모르겠어요', level: 'official', note: '받은 공고나 안내에서 마감 시각과 문의처를 찾아보세요.' },
      ],
    },
  ],
};
