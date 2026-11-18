export type BenefitType =
  | "출산장려금"
  | "육아수당"
  | "의료비 지원"
  | "보육 지원"
  | "주거 지원"
  | "기타 지원";

export interface Benefit {
  id: string;
  regionId: string;
  cityId?: string;
  type: BenefitType;
  title: string;
  amount: string;
  description: string;
  eligibility: string;
  period: string;
  contact: string;
  isNational: boolean;
  sourceUrl?: string;
  verifiedAt?: string;
}

export interface Region {
  id: string;
  name: string;
  emoji: string;
  benefitCount: number;
}

export interface City {
  id: string;
  provinceId: string;
  name: string;
  emoji: string;
  benefitCount: number;
}

export const REGIONS: Region[] = [
  { id: "national", name: "전국 공통", emoji: "🇰🇷", benefitCount: 0 },
  { id: "seoul", name: "서울특별시", emoji: "🏙️", benefitCount: 0 },
  { id: "busan", name: "부산광역시", emoji: "🌊", benefitCount: 0 },
  { id: "daegu", name: "대구광역시", emoji: "🌿", benefitCount: 0 },
  { id: "incheon", name: "인천광역시", emoji: "✈️", benefitCount: 0 },
  { id: "gwangju", name: "광주광역시", emoji: "🌸", benefitCount: 0 },
  { id: "daejeon", name: "대전광역시", emoji: "🔬", benefitCount: 0 },
  { id: "ulsan", name: "울산광역시", emoji: "🏭", benefitCount: 0 },
  { id: "sejong", name: "세종특별자치시", emoji: "🏛️", benefitCount: 0 },
  { id: "gyeonggi", name: "경기도", emoji: "🌾", benefitCount: 0 },
  { id: "gangwon", name: "강원특별자치도", emoji: "⛰️", benefitCount: 0 },
  { id: "chungbuk", name: "충청북도", emoji: "🌲", benefitCount: 0 },
  { id: "chungnam", name: "충청남도", emoji: "🌻", benefitCount: 0 },
  { id: "jeonbuk", name: "전북특별자치도", emoji: "🌾", benefitCount: 0 },
  { id: "jeonnam", name: "전라남도", emoji: "🌊", benefitCount: 0 },
  { id: "gyeongbuk", name: "경상북도", emoji: "🍎", benefitCount: 0 },
  { id: "gyeongnam", name: "경상남도", emoji: "🏞️", benefitCount: 0 },
  { id: "jeju", name: "제주특별자치도", emoji: "🍊", benefitCount: 0 },
];

export const CITIES: City[] = [
  // ─── 서울특별시 구 ───
  { id: "seoul-gangnam", provinceId: "seoul", name: "강남구", emoji: "🏢", benefitCount: 0 },
  { id: "seoul-nowon", provinceId: "seoul", name: "노원구", emoji: "📚", benefitCount: 0 },
  { id: "seoul-mapo", provinceId: "seoul", name: "마포구", emoji: "🎨", benefitCount: 0 },
  { id: "seoul-songpa", provinceId: "seoul", name: "송파구", emoji: "🏟️", benefitCount: 0 },
  { id: "seoul-gangseo", provinceId: "seoul", name: "강서구", emoji: "✈️", benefitCount: 0 },
  { id: "seoul-seochogu", provinceId: "seoul", name: "서초구", emoji: "⚖️", benefitCount: 0 },

  // ─── 부산광역시 구 ───
  { id: "busan-haeundae", provinceId: "busan", name: "해운대구", emoji: "🏖️", benefitCount: 0 },
  { id: "busan-busanjin", provinceId: "busan", name: "부산진구", emoji: "🏬", benefitCount: 0 },
  { id: "busan-yeonje", provinceId: "busan", name: "연제구", emoji: "🏛️", benefitCount: 0 },
  { id: "busan-sasang", provinceId: "busan", name: "사상구", emoji: "🏭", benefitCount: 0 },

  // ─── 대구광역시 구 ───
  { id: "daegu-suseong", provinceId: "daegu", name: "수성구", emoji: "🏞️", benefitCount: 0 },
  { id: "daegu-dalseo", provinceId: "daegu", name: "달서구", emoji: "🌳", benefitCount: 0 },
  { id: "daegu-buk", provinceId: "daegu", name: "북구", emoji: "🏘️", benefitCount: 0 },

  // ─── 경기도 시 ───
  { id: "gyeonggi-suwon", provinceId: "gyeonggi", name: "수원시", emoji: "🏯", benefitCount: 0 },
  { id: "gyeonggi-seongnam", provinceId: "gyeonggi", name: "성남시", emoji: "💻", benefitCount: 0 },
  { id: "gyeonggi-yongin", provinceId: "gyeonggi", name: "용인시", emoji: "🌿", benefitCount: 0 },
  { id: "gyeonggi-anyang", provinceId: "gyeonggi", name: "안양시", emoji: "🌆", benefitCount: 0 },
  { id: "gyeonggi-ansan", provinceId: "gyeonggi", name: "안산시", emoji: "🌊", benefitCount: 0 },
  { id: "gyeonggi-pyeongtaek", provinceId: "gyeonggi", name: "평택시", emoji: "🌾", benefitCount: 0 },
  { id: "gyeonggi-hwaseong", provinceId: "gyeonggi", name: "화성시", emoji: "🚀", benefitCount: 0 },
  { id: "gyeonggi-goyang", provinceId: "gyeonggi", name: "고양시", emoji: "🌷", benefitCount: 0 },
  { id: "gyeonggi-namyangju", provinceId: "gyeonggi", name: "남양주시", emoji: "🏡", benefitCount: 0 },
  { id: "gyeonggi-bucheon", provinceId: "gyeonggi", name: "부천시", emoji: "🎭", benefitCount: 0 },

  // ─── 강원특별자치도 시 ───
  { id: "gangwon-chuncheon", provinceId: "gangwon", name: "춘천시", emoji: "🦆", benefitCount: 0 },
  { id: "gangwon-wonju", provinceId: "gangwon", name: "원주시", emoji: "🌄", benefitCount: 0 },
  { id: "gangwon-gangneung", provinceId: "gangwon", name: "강릉시", emoji: "☕", benefitCount: 0 },
  { id: "gangwon-sokcho", provinceId: "gangwon", name: "속초시", emoji: "🦞", benefitCount: 0 },

  // ─── 충청남도 시 ───
  { id: "chungnam-cheonan", provinceId: "chungnam", name: "천안시", emoji: "🌸", benefitCount: 0 },
  { id: "chungnam-asan", provinceId: "chungnam", name: "아산시", emoji: "🏭", benefitCount: 0 },
  { id: "chungnam-seosan", provinceId: "chungnam", name: "서산시", emoji: "🌊", benefitCount: 0 },
  { id: "chungnam-gongju", provinceId: "chungnam", name: "공주시", emoji: "🏰", benefitCount: 0 },

  // ─── 충청북도 시 ───
  { id: "chungbuk-cheongju", provinceId: "chungbuk", name: "청주시", emoji: "🏙️", benefitCount: 0 },
  { id: "chungbuk-chungju", provinceId: "chungbuk", name: "충주시", emoji: "🌳", benefitCount: 0 },
  { id: "chungbuk-jecheon", provinceId: "chungbuk", name: "제천시", emoji: "⛰️", benefitCount: 0 },

  // ─── 전라남도 시 ───
  { id: "jeonnam-suncheon", provinceId: "jeonnam", name: "순천시", emoji: "🦢", benefitCount: 0 },
  { id: "jeonnam-yeosu", provinceId: "jeonnam", name: "여수시", emoji: "⛵", benefitCount: 0 },
  { id: "jeonnam-mokpo", provinceId: "jeonnam", name: "목포시", emoji: "🐟", benefitCount: 0 },

  // ─── 전북특별자치도 시 ───
  { id: "jeonbuk-jeonju", provinceId: "jeonbuk", name: "전주시", emoji: "🏮", benefitCount: 0 },
  { id: "jeonbuk-iksan", provinceId: "jeonbuk", name: "익산시", emoji: "🌾", benefitCount: 0 },
  { id: "jeonbuk-gunsan", provinceId: "jeonbuk", name: "군산시", emoji: "🚢", benefitCount: 0 },

  // ─── 경상북도 시 ───
  { id: "gyeongbuk-pohang", provinceId: "gyeongbuk", name: "포항시", emoji: "⚙️", benefitCount: 0 },
  { id: "gyeongbuk-gyeongju", provinceId: "gyeongbuk", name: "경주시", emoji: "🏛️", benefitCount: 0 },
  { id: "gyeongbuk-gumi", provinceId: "gyeongbuk", name: "구미시", emoji: "📱", benefitCount: 0 },
  { id: "gyeongbuk-andong", provinceId: "gyeongbuk", name: "안동시", emoji: "🎎", benefitCount: 0 },

  // ─── 경상남도 시 ───
  { id: "gyeongnam-changwon", provinceId: "gyeongnam", name: "창원시", emoji: "🏭", benefitCount: 0 },
  { id: "gyeongnam-jinju", provinceId: "gyeongnam", name: "진주시", emoji: "🎆", benefitCount: 0 },
  { id: "gyeongnam-gimhae", provinceId: "gyeongnam", name: "김해시", emoji: "🏺", benefitCount: 0 },
  { id: "gyeongnam-yangsan", provinceId: "gyeongnam", name: "양산시", emoji: "🌲", benefitCount: 0 },
];

export const BENEFITS: Benefit[] = [
  // ─── 전국 공통 ────────────────────────────────
  {
    id: "nat-001",
    regionId: "national",
    type: "출산장려금",
    title: "첫만남이용권",
    amount: "첫째 200만원 · 둘째 이상 300만원 (바우처)",
    description:
      "전국 공통 국민행복카드 바우처입니다. 출생신고 후 아동의 주민등록번호를 부여받아 신청합니다. 2024년 이후 출생아의 바우처 사용기한은 출생일부터 2년입니다.",
    eligibility: "출생신고되어 주민등록번호를 부여받은 아동 (세부 기준은 공식 안내 확인)",
    period: "출생신고 후 신청 · 사용은 출생일로부터 2년 이내",
    contact: "행복출산 원스톱 서비스 (정부24)",
    isNational: true,
    sourceUrl: "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00004656",
    verifiedAt: "2026-09-28",
  },
  {
    id: "nat-002",
    regionId: "national",
    type: "육아수당",
    title: "부모급여 (0세)",
    amount: "월 100만원",
    description:
      "만 0세(0~11개월) 아동을 가정에서 양육하는 경우 매월 100만원을 지급합니다. 어린이집 이용 시 보육료 바우처로 지원됩니다.",
    eligibility: "만 0세 아동을 가정에서 양육하는 부모",
    period: "출생 후 60일 이내 신청, 이후 매월 지급",
    contact: "행복출산 원스톱 서비스 / 읍면동 주민센터",
    isNational: true,
    sourceUrl: "https://www.bokjiro.go.kr/ssis-tbu/cms/pc/customer/notice/1309189_1141.html",
    verifiedAt: "2026-09-28",
  },
  {
    id: "nat-003",
    regionId: "national",
    type: "육아수당",
    title: "부모급여 (1세)",
    amount: "월 50만원",
    description:
      "만 1세(12~23개월) 아동을 가정에서 양육하는 경우 매월 50만원을 지급합니다. 어린이집 이용 시 보육료 바우처로 지원됩니다.",
    eligibility: "만 1세 아동을 가정에서 양육하는 부모",
    period: "만 1세 도달 월부터 자동 전환",
    contact: "읍면동 주민센터",
    isNational: true,
    sourceUrl: "https://www.bokjiro.go.kr/ssis-tbu/cms/pc/customer/notice/1309189_1141.html",
    verifiedAt: "2026-09-28",
  },
  {
    id: "nat-004",
    regionId: "national",
    type: "육아수당",
    title: "아동수당",
    amount: "월 10만~13만원 (거주지역별 상이)",
    description:
      "보건복지부 안내 기준 수도권 10만원, 비수도권 등은 지역별로 상이합니다. 해당 거주지의 지급액과 방식은 공식 안내에서 확인하세요.",
    eligibility: "만 9세 미만 아동 (개인별 적용 조건은 공식 안내 확인)",
    period: "읍면동 주민센터 또는 복지로에서 신청",
    contact: "읍면동 주민센터 / 복지로(bokjiro.go.kr)",
    isNational: true,
    sourceUrl: "https://www.mohw.go.kr/menu.es?mid=a10711030100",
    verifiedAt: "2026-09-28",
  },
  {
    id: "nat-005",
    regionId: "national",
    type: "의료비 지원",
    title: "임신·출산 진료비 지원 (국민행복카드)",
    amount: "100만원 (다태아 140만원)",
    description:
      "임신 확인 후 국민행복카드를 발급받아 산부인과 진료비, 초음파 검사 등에 사용할 수 있습니다. 출산 후 2년까지 사용 가능합니다.",
    eligibility: "건강보험 가입 임산부",
    period: "임신 확인 후 즉시 신청",
    contact: "국민건강보험공단 / 건강보험심사평가원",
    isNational: true,
  },
  {
    id: "nat-006",
    regionId: "national",
    type: "보육 지원",
    title: "육아휴직급여",
    amount: "월 최대 250만원",
    description:
      "육아휴직 기간 동안 통상임금의 80%(상한 150만원, 2024년 개편 후 첫 3개월 250만원)를 지급합니다. 부모 모두 사용 시 추가 혜택이 있습니다.",
    eligibility: "고용보험 가입 근로자로 만 8세 이하 자녀를 둔 부모",
    period: "육아휴직 개시 후 30일 내 신청",
    contact: "고용노동부 고객상담센터 (1350)",
    isNational: true,
  },
  {
    id: "nat-007",
    regionId: "national",
    type: "보육 지원",
    title: "어린이집 보육료 지원",
    amount: "연령별 상이 (최대 월 54만원)",
    description:
      "소득 수준에 따라 어린이집 보육료의 전액 또는 일부를 지원합니다. 만 0~2세는 소득 무관 전액 지원, 만 3~5세는 누리과정으로 지원됩니다.",
    eligibility: "어린이집을 이용하는 만 0~5세 아동",
    period: "상시 신청",
    contact: "읍면동 주민센터 / 복지로",
    isNational: true,
  },
  {
    id: "nat-008",
    regionId: "national",
    type: "의료비 지원",
    title: "영유아 건강검진",
    amount: "무료 (12회)",
    description:
      "생후 14일~71개월 영유아를 대상으로 성장 발달 모니터링, 건강 교육, 예방 접종 확인 등을 위한 건강검진을 무료로 제공합니다.",
    eligibility: "생후 14일~71개월 영유아",
    period: "해당 월령 도달 시 검진 가능",
    contact: "국민건강보험공단 (1577-1000)",
    isNational: true,
  },

  // ─── 서울특별시 ────────────────────────────────
  {
    id: "seoul-001",
    regionId: "seoul",
    type: "의료비 지원",
    title: "서울형 산후조리경비",
    amount: "첫째 100만원 · 둘째 120만원 · 셋째 이상 150만원 (바우처)",
    description:
      "서울시가 산모 명의 협약카드에 산후조리경비를 지원합니다. 전국 공통 첫만남이용권과는 별도 사업이며, 사용처에 제한이 있습니다.",
    eligibility: "신청일 기준 출산모 서울 계속 거주 90일 이상, 아동 서울 거주 및 서울시 출생신고",
    period: "출산일로부터 180일 이내 (예외 조건은 공식 안내 확인)",
    contact: "서울시 탄생육아 몽땅정보통 / 주소지 동주민센터",
    isNational: false,
    sourceUrl: "https://umppa.seoul.go.kr/hmpg/sprt/bzin/bzmgComtDetail.do?biz_mng_no=58D83411277E40D1BFF6255A10CBCDD5",
    verifiedAt: "2026-09-28",
  },
  {
    id: "seoul-002",
    regionId: "seoul",
    type: "보육 지원",
    title: "서울형 어린이집",
    amount: "보육료 추가 지원 (월 5~10만원)",
    description:
      "서울시가 운영하는 서울형 어린이집을 이용하는 경우 국가 보육료 외 추가 지원을 받을 수 있습니다. 보다 나은 보육 서비스를 제공합니다.",
    eligibility: "서울시 거주 만 0~5세 아동 부모",
    period: "상시 신청",
    contact: "서울시 보육포털 서비스",
    isNational: false,
  },
  {
    id: "seoul-003",
    regionId: "seoul",
    type: "주거 지원",
    title: "신혼부부·출산가구 주거 지원",
    amount: "임대주택 우선 공급 / 이자 지원",
    description:
      "자녀 출산 가구에 공공임대주택 우선 입주 기회를 제공합니다. 또한 SH공사의 행복주택·공공임대 신청 시 가점을 부여합니다.",
    eligibility: "서울시 거주 출산 가구",
    period: "입주 모집 공고 시 신청",
    contact: "서울주택도시공사 (SH공사)",
    isNational: false,
  },

  // 서울 강남구
  {
    id: "seoul-gangnam-001",
    regionId: "seoul",
    cityId: "seoul-gangnam",
    type: "출산장려금",
    title: "강남구 출산장려금",
    amount: "첫째 50만원, 둘째 100만원, 셋째 이상 200만원",
    description:
      "강남구 거주 출산 가정에 구비로 추가 출산장려금을 지급합니다. 서울시 지원과 중복 수혜가 가능합니다.",
    eligibility: "출생일 기준 강남구 주민등록 부모",
    period: "출생 후 6개월 이내 신청",
    contact: "강남구청 가정복지과 (02-3423-5620)",
    isNational: false,
  },
  {
    id: "seoul-gangnam-002",
    regionId: "seoul",
    cityId: "seoul-gangnam",
    type: "보육 지원",
    title: "강남구 우리아이 돌봄 서비스",
    amount: "월 20시간 무료 돌봄",
    description:
      "강남구에서 운영하는 공공 아이돌봄 서비스로 만 12세 미만 아동을 대상으로 월 20시간 무료 돌봄 서비스를 제공합니다.",
    eligibility: "강남구 거주 만 12세 미만 아동 가정",
    period: "상시 신청",
    contact: "강남구 아이돌봄센터 (02-3423-5690)",
    isNational: false,
  },
  {
    id: "seoul-gangnam-003",
    regionId: "seoul",
    cityId: "seoul-gangnam",
    type: "의료비 지원",
    title: "강남구 임산부 건강관리 지원",
    amount: "산전 검사비 최대 30만원",
    description:
      "강남구 거주 임산부에게 산전 검사 비용을 지원합니다. 기형아 검사, 정밀 초음파 등 필수 검사 항목을 포함합니다.",
    eligibility: "강남구 거주 임산부",
    period: "임신 확인 후 즉시 신청",
    contact: "강남구보건소 (02-3423-7000)",
    isNational: false,
  },

  // 서울 노원구
  {
    id: "seoul-nowon-001",
    regionId: "seoul",
    cityId: "seoul-nowon",
    type: "출산장려금",
    title: "노원구 출산장려금",
    amount: "첫째 50만원, 둘째 100만원, 셋째 이상 200만원",
    description:
      "노원구 거주 출산 가정에 출산장려금을 지급합니다. 서울시 지원과 별도로 구비 추가 지원이 이루어집니다.",
    eligibility: "출생일 기준 노원구 주민등록 부모",
    period: "출생 후 6개월 이내 신청",
    contact: "노원구청 복지정책과 (02-2116-3762)",
    isNational: false,
  },
  {
    id: "seoul-nowon-002",
    regionId: "seoul",
    cityId: "seoul-nowon",
    type: "보육 지원",
    title: "노원구 공공 산후조리 지원",
    amount: "산후조리 비용 50만원 지원",
    description:
      "노원구 거주 출산 산모를 위해 산후조리 비용을 지원합니다. 저소득 가정을 우선으로 하되 일반 가정도 지원받을 수 있습니다.",
    eligibility: "노원구 거주 출산 산모",
    period: "출산 후 3개월 이내 신청",
    contact: "노원구 보건소 (02-2116-4000)",
    isNational: false,
  },
  {
    id: "seoul-nowon-003",
    regionId: "seoul",
    cityId: "seoul-nowon",
    type: "육아수당",
    title: "노원구 다자녀 가정 문화·교육비 지원",
    amount: "연 20만원 (문화·교육 상품권)",
    description:
      "노원구 내 자녀 2인 이상 가정에 문화 및 교육 활동 비용을 상품권으로 지원합니다.",
    eligibility: "노원구 거주 자녀 2인 이상 가정",
    period: "연 1회 신청",
    contact: "노원구청 가정복지과 (02-2116-3700)",
    isNational: false,
  },

  // 서울 마포구
  {
    id: "seoul-mapo-001",
    regionId: "seoul",
    cityId: "seoul-mapo",
    type: "출산장려금",
    title: "마포구 출산장려금",
    amount: "첫째 50만원, 둘째 100만원, 셋째 이상 200만원",
    description:
      "마포구 거주 출산 가정에 출산장려금을 지급합니다. 서울시 지원과 중복 수혜 가능합니다.",
    eligibility: "출생일 기준 마포구 주민등록 부모",
    period: "출생 후 6개월 이내 신청",
    contact: "마포구청 여성가족과 (02-3153-8964)",
    isNational: false,
  },
  {
    id: "seoul-mapo-002",
    regionId: "seoul",
    cityId: "seoul-mapo",
    type: "보육 지원",
    title: "마포구 공동육아나눔터",
    amount: "무료 이용",
    description:
      "마포구가 운영하는 공동육아나눔터로 육아 공간 제공, 장난감 대여, 부모 커뮤니티 활동을 무료로 지원합니다.",
    eligibility: "마포구 거주 영유아 자녀를 둔 부모",
    period: "상시 이용",
    contact: "마포구 건강가정지원센터 (02-3272-9021)",
    isNational: false,
  },

  // 서울 송파구
  {
    id: "seoul-songpa-001",
    regionId: "seoul",
    cityId: "seoul-songpa",
    type: "출산장려금",
    title: "송파구 출산장려금",
    amount: "첫째 50만원, 둘째 100만원, 셋째 이상 300만원",
    description:
      "송파구 거주 출산 가정에 출산장려금을 지급합니다. 셋째 이상 출산 가정을 특별 우대합니다.",
    eligibility: "출생일 기준 송파구 주민등록 부모",
    period: "출생 후 6개월 이내 신청",
    contact: "송파구청 여성가족과 (02-2147-2690)",
    isNational: false,
  },
  {
    id: "seoul-songpa-002",
    regionId: "seoul",
    cityId: "seoul-songpa",
    type: "의료비 지원",
    title: "송파구 난임 부부 시술비 지원",
    amount: "최대 100만원 추가 지원",
    description:
      "송파구 거주 난임 부부에게 체외수정 시술비 등을 구비로 추가 지원합니다. 정부 지원 외 구비 추가 지원으로 부담을 줄여줍니다.",
    eligibility: "송파구 거주 난임 판정 부부",
    period: "시술 전 신청",
    contact: "송파구 보건소 (02-2147-3000)",
    isNational: false,
  },

  // 서울 강서구
  {
    id: "seoul-gangseo-001",
    regionId: "seoul",
    cityId: "seoul-gangseo",
    type: "출산장려금",
    title: "강서구 출산장려금",
    amount: "첫째 50만원, 둘째 100만원, 셋째 이상 200만원",
    description:
      "강서구 거주 출산 가정에 출산장려금을 지급합니다.",
    eligibility: "출생일 기준 강서구 주민등록 부모",
    period: "출생 후 6개월 이내 신청",
    contact: "강서구청 복지정책과 (02-2600-6640)",
    isNational: false,
  },
  {
    id: "seoul-gangseo-002",
    regionId: "seoul",
    cityId: "seoul-gangseo",
    type: "보육 지원",
    title: "강서구 아이 꿈 키움 지원",
    amount: "연 15만원 (교육비 바우처)",
    description:
      "강서구가 운영하는 아이 꿈 키움 프로그램으로 문화, 예술, 스포츠 등 교육 활동 비용을 바우처로 지원합니다.",
    eligibility: "강서구 거주 만 0~12세 아동",
    period: "연 1회 신청",
    contact: "강서구청 아동청소년과 (02-2600-5800)",
    isNational: false,
  },

  // 서울 서초구
  {
    id: "seoul-seochogu-001",
    regionId: "seoul",
    cityId: "seoul-seochogu",
    type: "출산장려금",
    title: "서초구 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 이상 300만원",
    description:
      "서초구 거주 출산 가정에 출산장려금을 지급합니다. 서울시 내 높은 수준의 구비 지원을 자랑합니다.",
    eligibility: "출생일 기준 서초구 주민등록 부모",
    period: "출생 후 6개월 이내 신청",
    contact: "서초구청 가정복지과 (02-2155-6760)",
    isNational: false,
  },
  {
    id: "seoul-seochogu-002",
    regionId: "seoul",
    cityId: "seoul-seochogu",
    type: "보육 지원",
    title: "서초구 공공 보육 서비스",
    amount: "보육료 추가 지원 월 10만원",
    description:
      "서초구 운영 어린이집 이용 가정에 보육료를 추가 지원합니다. 보다 질 높은 보육 환경을 제공합니다.",
    eligibility: "서초구 거주 만 0~5세 아동 부모",
    period: "상시 신청",
    contact: "서초구 육아종합지원센터 (02-3489-7575)",
    isNational: false,
  },

  // ─── 부산광역시 ────────────────────────────────
  {
    id: "busan-001",
    regionId: "busan",
    type: "출산장려금",
    title: "부산시 둘째 이후 출산지원금",
    amount: "둘째 이후 100만원 (시비 현금, 전국 바우처 별도)",
    description:
      "부산시의 둘째 이후 출생아 추가 현금 지원입니다. 첫만남이용권은 전국 공통 바우처이며 이 금액에 포함하지 않았습니다.",
    eligibility: "부산 출생신고·주민등록된 둘째 이후 아동과 부모 중 한 명이 같은 부산 주소지에 등재·거주",
    period: "출생일로부터 3개월 이내",
    contact: "거주지 읍면동 행정복지센터 / 정부24",
    isNational: false,
    sourceUrl: "https://www.busan.go.kr/childcare/childcare010101",
    verifiedAt: "2026-09-28",
  },
  {
    id: "busan-002",
    regionId: "busan",
    type: "육아수당",
    title: "부산형 아이돌봄 서비스",
    amount: "시간당 지원 (소득 수준별 상이)",
    description:
      "부산시가 운영하는 아이돌봄 서비스로 국가 아이돌봄 서비스 대비 추가 지원을 제공합니다. 맞벌이 가정 등을 위한 시간제 돌봄 서비스입니다.",
    eligibility: "부산시 거주 만 12세 미만 아동 가정",
    period: "상시 신청",
    contact: "부산시 아이돌봄 서비스 (051-120)",
    isNational: false,
  },
  {
    id: "busan-003",
    regionId: "busan",
    type: "의료비 지원",
    title: "고위험 임산부 의료비 지원",
    amount: "최대 300만원",
    description:
      "조기진통, 다태아 등 고위험 임산부에게 입원 치료비의 90%를 지원합니다 (비급여 제외). 건강보험료 하위 80% 이하 가구가 대상입니다.",
    eligibility: "부산시 거주 건강보험료 하위 80% 이하 고위험 임산부",
    period: "분만 후 6개월 이내 신청",
    contact: "부산시 보건소 또는 거주지 구청",
    isNational: false,
  },

  // 부산 해운대구
  {
    id: "busan-haeundae-001",
    regionId: "busan",
    cityId: "busan-haeundae",
    type: "출산장려금",
    title: "해운대구 출산장려금",
    amount: "첫째 50만원, 둘째 100만원, 셋째 이상 200만원",
    description:
      "해운대구 거주 출산 가정에 부산시 지원 외 구비 추가 출산장려금을 지급합니다.",
    eligibility: "출생일 기준 해운대구 주민등록 부모",
    period: "출생 후 6개월 이내 신청",
    contact: "해운대구청 여성가족과 (051-749-4530)",
    isNational: false,
  },
  {
    id: "busan-haeundae-002",
    regionId: "busan",
    cityId: "busan-haeundae",
    type: "보육 지원",
    title: "해운대구 아이 행복 돌봄 서비스",
    amount: "월 10시간 무료 돌봄",
    description:
      "해운대구가 운영하는 공공 돌봄 서비스로 월 10시간 무료 돌봄 서비스를 제공합니다.",
    eligibility: "해운대구 거주 만 12세 미만 아동 가정",
    period: "상시 신청",
    contact: "해운대구 건강가정지원센터 (051-702-0171)",
    isNational: false,
  },

  // 부산 부산진구
  {
    id: "busan-busanjin-001",
    regionId: "busan",
    cityId: "busan-busanjin",
    type: "출산장려금",
    title: "부산진구 출산장려금",
    amount: "첫째 30만원, 둘째 80만원, 셋째 이상 150만원",
    description:
      "부산진구 거주 출산 가정에 출산장려금을 지급합니다.",
    eligibility: "출생일 기준 부산진구 주민등록 부모",
    period: "출생 후 6개월 이내 신청",
    contact: "부산진구청 복지지원과 (051-605-4290)",
    isNational: false,
  },
  {
    id: "busan-busanjin-002",
    regionId: "busan",
    cityId: "busan-busanjin",
    type: "의료비 지원",
    title: "부산진구 산모·신생아 건강관리 지원",
    amount: "표준형 기준 본인부담 10%",
    description:
      "부산진구 거주 출산 산모에게 신생아 건강관리 서비스를 지원합니다. 소득 기준에 따라 지원 수준이 달라집니다.",
    eligibility: "부산진구 거주 출산 산모",
    period: "출산 예정일 40일 전부터 신청",
    contact: "부산진구 보건소 (051-605-6000)",
    isNational: false,
  },

  // 부산 연제구
  {
    id: "busan-yeonje-001",
    regionId: "busan",
    cityId: "busan-yeonje",
    type: "출산장려금",
    title: "연제구 출산장려금",
    amount: "첫째 30만원, 둘째 80만원, 셋째 이상 150만원",
    description:
      "연제구 거주 출산 가정에 출산장려금을 지급합니다.",
    eligibility: "출생일 기준 연제구 주민등록 부모",
    period: "출생 후 6개월 이내 신청",
    contact: "연제구청 복지지원과 (051-665-4000)",
    isNational: false,
  },
  {
    id: "busan-yeonje-002",
    regionId: "busan",
    cityId: "busan-yeonje",
    type: "보육 지원",
    title: "연제구 국공립어린이집 확대 지원",
    amount: "국공립어린이집 우선 배정",
    description:
      "연제구 거주 가정에 국공립어린이집 우선 배정 혜택을 제공합니다. 대기 기간 단축을 위한 지속 확대 운영 중입니다.",
    eligibility: "연제구 거주 만 0~5세 아동 부모",
    period: "상시 신청 (e-보육 신청)",
    contact: "연제구 육아종합지원센터 (051-507-0307)",
    isNational: false,
  },

  // 부산 사상구
  {
    id: "busan-sasang-001",
    regionId: "busan",
    cityId: "busan-sasang",
    type: "출산장려금",
    title: "사상구 출산장려금",
    amount: "첫째 30만원, 둘째 80만원, 셋째 이상 150만원",
    description:
      "사상구 거주 출산 가정에 출산장려금을 지급합니다.",
    eligibility: "출생일 기준 사상구 주민등록 부모",
    period: "출생 후 6개월 이내 신청",
    contact: "사상구청 사회복지과 (051-310-4000)",
    isNational: false,
  },

  // ─── 대구광역시 ────────────────────────────────
  {
    id: "daegu-001",
    regionId: "daegu",
    type: "출산장려금",
    title: "대구시 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 이상 500만원",
    description:
      "대구광역시 거주 출산 가정에 출산장려금을 지급합니다. 셋째 이상 출산 가정을 특별 우대합니다.",
    eligibility: "출생일 기준 대구시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "거주지 구·군청 여성가족과",
    isNational: false,
  },
  {
    id: "daegu-002",
    regionId: "daegu",
    type: "의료비 지원",
    title: "대구 임산부 친환경 농산물 지원",
    amount: "월 4만원 (친환경 농산물 꾸러미)",
    description:
      "대구시 거주 임산부에게 친환경 농산물 꾸러미를 지원합니다. 건강한 임신과 출산을 위한 영양 지원 프로그램입니다.",
    eligibility: "대구시 거주 임신 중인 산모 (소득 무관)",
    period: "임신 확인 후 신청",
    contact: "거주지 보건소",
    isNational: false,
  },

  // 대구 수성구
  {
    id: "daegu-suseong-001",
    regionId: "daegu",
    cityId: "daegu-suseong",
    type: "출산장려금",
    title: "수성구 출산장려금",
    amount: "첫째 50만원, 둘째 100만원, 셋째 이상 200만원",
    description:
      "수성구 거주 출산 가정에 대구시 지원 외 추가 출산장려금을 지급합니다.",
    eligibility: "출생일 기준 수성구 주민등록 부모",
    period: "출생 후 6개월 이내 신청",
    contact: "수성구청 여성가족과 (053-666-4000)",
    isNational: false,
  },
  {
    id: "daegu-suseong-002",
    regionId: "daegu",
    cityId: "daegu-suseong",
    type: "보육 지원",
    title: "수성구 교육특구 아동 학습 지원",
    amount: "연 30만원 학습비 바우처",
    description:
      "교육특구 수성구에서 아동 학습 활동비를 바우처로 지원합니다. 학원비, 교육 활동비 등에 사용 가능합니다.",
    eligibility: "수성구 거주 만 6~12세 아동",
    period: "연 1회 신청",
    contact: "수성구청 교육지원과 (053-666-4100)",
    isNational: false,
  },

  // 대구 달서구
  {
    id: "daegu-dalseo-001",
    regionId: "daegu",
    cityId: "daegu-dalseo",
    type: "출산장려금",
    title: "달서구 출산장려금",
    amount: "첫째 30만원, 둘째 70만원, 셋째 이상 150만원",
    description:
      "달서구 거주 출산 가정에 출산장려금을 지급합니다.",
    eligibility: "출생일 기준 달서구 주민등록 부모",
    period: "출생 후 6개월 이내 신청",
    contact: "달서구청 여성가족과 (053-667-4000)",
    isNational: false,
  },
  {
    id: "daegu-dalseo-002",
    regionId: "daegu",
    cityId: "daegu-dalseo",
    type: "주거 지원",
    title: "달서구 신혼부부 주거 지원",
    amount: "전세 자금 이자 지원 (연 1%)",
    description:
      "달서구 거주 신혼부부에게 전세 자금 대출 이자를 지원합니다. 출산 시 추가 이자 감면 혜택이 있습니다.",
    eligibility: "달서구 거주 혼인 7년 이내 신혼부부",
    period: "상시 신청",
    contact: "달서구청 주택과 (053-667-5000)",
    isNational: false,
  },

  // 대구 북구
  {
    id: "daegu-buk-001",
    regionId: "daegu",
    cityId: "daegu-buk",
    type: "출산장려금",
    title: "북구 출산장려금",
    amount: "첫째 30만원, 둘째 70만원, 셋째 이상 150만원",
    description:
      "북구 거주 출산 가정에 출산장려금을 지급합니다.",
    eligibility: "출생일 기준 북구 주민등록 부모",
    period: "출생 후 6개월 이내 신청",
    contact: "북구청 복지지원과 (053-665-4000)",
    isNational: false,
  },

  // ─── 경기도 ────────────────────────────────
  {
    id: "gyeonggi-001",
    regionId: "gyeonggi",
    type: "출산장려금",
    title: "경기도 산후조리비 지원",
    amount: "50만원 (지역상품권)",
    description:
      "경기도 내 출산 가정에 산후조리원 이용 등을 위한 산후조리비를 지역상품권으로 지원합니다.",
    eligibility: "출생일 기준 경기도 주민등록 부모 (소득 무관)",
    period: "출생 후 90일 이내 신청",
    contact: "거주지 읍면동 주민센터",
    isNational: false,
  },
  {
    id: "gyeonggi-002",
    regionId: "gyeonggi",
    type: "육아수당",
    title: "경기 아이돌봄 지원",
    amount: "월 최대 30만원 추가 지원",
    description:
      "경기도형 아이돌봄 서비스로 국가 지원 외 도비를 추가 지원합니다. 육아 부담 완화를 위해 시간제·종일제 서비스를 확대 운영합니다.",
    eligibility: "경기도 거주 만 12세 미만 아동 가정",
    period: "상시 신청",
    contact: "경기도 아이돌봄 지원센터",
    isNational: false,
  },
  {
    id: "gyeonggi-003",
    regionId: "gyeonggi",
    type: "출산장려금",
    title: "경기도 셋째 이상 출산지원금",
    amount: "셋째 100만원, 넷째 이상 200만원",
    description:
      "경기도 내 셋째 이상 출산 가정에 추가 지원금을 지급합니다. 일부 시·군에서 별도 추가 지원이 있을 수 있습니다.",
    eligibility: "출생일 기준 경기도 주민등록 부모 (셋째 이상)",
    period: "출생 후 1년 이내 신청",
    contact: "거주지 시·군청 여성가족과",
    isNational: false,
  },

  // 경기 수원시
  {
    id: "gyeonggi-suwon-001",
    regionId: "gyeonggi",
    cityId: "gyeonggi-suwon",
    type: "출산장려금",
    title: "수원시 출산장려금",
    amount: "첫째 50만원 · 둘째 100만원 · 셋째 200만원 · 넷째 500만원 · 다섯째 이상 1,000만원",
    description:
      "수원시 자체 출산지원금입니다. 이 금액은 수원시가 안내한 2026년 1월 1일 이후 출생아 기준이며, 경기도 산후조리비 및 전국 공통 바우처와는 별도입니다.",
    eligibility: "수원시 거주 180일 이상인 출산가정 (개별 적용 조건은 시 안내 확인)",
    period: "출생일로부터 1년 이내 · 주소지 동 행정복지센터 또는 정부24",
    contact: "수원시청 / 주소지 동 행정복지센터",
    isNational: false,
    sourceUrl: "https://www.suwon.go.kr/sw-www/deptHome/dep_welfare/welfare14/welfare14-01/welfare14-01-10.jsp",
    verifiedAt: "2026-09-28",
  },
  {
    id: "gyeonggi-suwon-002",
    regionId: "gyeonggi",
    cityId: "gyeonggi-suwon",
    type: "보육 지원",
    title: "수원시 공공 어린이집 우선 이용",
    amount: "보육료 추가 지원 월 5만원",
    description:
      "수원시 운영 공공형 어린이집 이용 가정에 보육료를 추가 지원합니다. 대기 아동에게는 대기 수당도 제공합니다.",
    eligibility: "수원시 거주 만 0~5세 아동 부모",
    period: "상시 신청",
    contact: "수원시 육아종합지원센터 (031-258-3819)",
    isNational: false,
  },
  {
    id: "gyeonggi-suwon-003",
    regionId: "gyeonggi",
    cityId: "gyeonggi-suwon",
    type: "주거 지원",
    title: "수원시 신혼부부 전세 보증금 지원",
    amount: "보증금 이자 지원 연 최대 60만원",
    description:
      "수원시 거주 신혼부부에게 전세 보증금 대출 이자를 지원합니다. 자녀 출산 시 지원 기간을 연장합니다.",
    eligibility: "수원시 거주 혼인 5년 이내 신혼부부",
    period: "상시 신청",
    contact: "수원시청 주거복지과 (031-228-3000)",
    isNational: false,
  },

  // 경기 성남시
  {
    id: "gyeonggi-seongnam-001",
    regionId: "gyeonggi",
    cityId: "gyeonggi-seongnam",
    type: "출산장려금",
    title: "성남시 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 이상 300만원",
    description:
      "성남시 거주 출산 가정에 출산장려금을 지급합니다. 경기도 내 높은 수준의 지원금을 자랑합니다.",
    eligibility: "출생일 기준 성남시 주민등록 부모",
    period: "출생 후 6개월 이내 신청",
    contact: "성남시청 여성가족과 (031-729-3252)",
    isNational: false,
  },
  {
    id: "gyeonggi-seongnam-002",
    regionId: "gyeonggi",
    cityId: "gyeonggi-seongnam",
    type: "육아수당",
    title: "성남 청년 부모 양육수당",
    amount: "월 10만원 (만 2세 미만)",
    description:
      "성남시 거주 만 35세 이하 청년 부모를 위한 양육수당을 지급합니다. 첫 아이를 키우는 청년 부모를 집중 지원합니다.",
    eligibility: "성남시 거주 만 35세 이하 부모, 만 2세 미만 자녀",
    period: "출생 후 신청",
    contact: "성남시청 가정복지과 (031-729-3260)",
    isNational: false,
  },
  {
    id: "gyeonggi-seongnam-003",
    regionId: "gyeonggi",
    cityId: "gyeonggi-seongnam",
    type: "보육 지원",
    title: "성남시 국공립어린이집 우선 배정",
    amount: "국공립어린이집 우선 입소 혜택",
    description:
      "성남시 거주 출산 가정에 국공립어린이집 우선 입소 기회를 제공합니다. 출생 후 빠른 보육 서비스 이용이 가능합니다.",
    eligibility: "성남시 거주 만 0~5세 아동 부모",
    period: "상시 신청",
    contact: "성남시 육아종합지원센터 (031-756-4270)",
    isNational: false,
  },

  // 경기 용인시
  {
    id: "gyeonggi-yongin-001",
    regionId: "gyeonggi",
    cityId: "gyeonggi-yongin",
    type: "출산장려금",
    title: "용인시 출산장려금",
    amount: "첫째 50만원, 둘째 100만원, 셋째 이상 200만원",
    description:
      "용인시 거주 출산 가정에 출산장려금을 지급합니다.",
    eligibility: "출생일 기준 용인시 주민등록 부모",
    period: "출생 후 6개월 이내 신청",
    contact: "용인시청 여성가족과 (031-324-2000)",
    isNational: false,
  },
  {
    id: "gyeonggi-yongin-002",
    regionId: "gyeonggi",
    cityId: "gyeonggi-yongin",
    type: "육아수당",
    title: "용인시 다자녀 가정 지원",
    amount: "셋째 이상 월 10만원 추가 양육수당",
    description:
      "용인시 거주 셋째 이상 자녀 가정에 추가 양육수당을 지급합니다. 다자녀 가정의 경제적 부담 완화를 위한 지원입니다.",
    eligibility: "용인시 거주 셋째 이상 자녀 가정",
    period: "출생 후 신청",
    contact: "용인시청 가정복지과 (031-324-2530)",
    isNational: false,
  },

  // 경기 안양시
  {
    id: "gyeonggi-anyang-001",
    regionId: "gyeonggi",
    cityId: "gyeonggi-anyang",
    type: "출산장려금",
    title: "안양시 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 이상 300만원",
    description:
      "안양시 거주 출산 가정에 출산장려금을 지급합니다. 경기도 지원금과 별도로 시비 추가 지급이 이루어집니다.",
    eligibility: "출생일 기준 안양시 주민등록 부모",
    period: "출생 후 6개월 이내 신청",
    contact: "안양시청 여성가족과 (031-8045-2880)",
    isNational: false,
  },
  {
    id: "gyeonggi-anyang-002",
    regionId: "gyeonggi",
    cityId: "gyeonggi-anyang",
    type: "보육 지원",
    title: "안양시 공공 산후조리원 이용 지원",
    amount: "이용료 50% 감면",
    description:
      "안양시 운영 공공 산후조리원을 저렴하게 이용할 수 있습니다. 쌍둥이 등 다태아 출산 가정에는 추가 감면 혜택이 있습니다.",
    eligibility: "안양시 거주 출산 산모",
    period: "출산 예정일 1개월 전부터 신청",
    contact: "안양시 공공산후조리원 (031-8045-0000)",
    isNational: false,
  },
  {
    id: "gyeonggi-anyang-003",
    regionId: "gyeonggi",
    cityId: "gyeonggi-anyang",
    type: "의료비 지원",
    title: "안양시 임산부 의료비 지원",
    amount: "산전·산후 검사비 최대 30만원",
    description:
      "안양시 거주 임산부에게 산전·산후 검사 비용을 지원합니다. 필수 검사 항목 외 추가 검사도 일부 지원합니다.",
    eligibility: "안양시 거주 임산부",
    period: "임신 확인 후 신청",
    contact: "안양시 보건소 (031-8045-4000)",
    isNational: false,
  },
  {
    id: "gyeonggi-anyang-004",
    regionId: "gyeonggi",
    cityId: "gyeonggi-anyang",
    type: "육아수당",
    title: "안양시 육아용품 지원",
    amount: "유모차, 카시트 등 구입비 30만원",
    description:
      "안양시 거주 출산 가정에 유모차, 카시트, 침대 등 필수 육아용품 구입비를 지원합니다.",
    eligibility: "안양시 거주 출생 후 6개월 이내 가정",
    period: "출생 후 3개월 이내 신청",
    contact: "안양시청 가정복지과 (031-8045-2890)",
    isNational: false,
  },

  // 경기 안산시
  {
    id: "gyeonggi-ansan-001",
    regionId: "gyeonggi",
    cityId: "gyeonggi-ansan",
    type: "출산장려금",
    title: "안산시 출산장려금",
    amount: "첫째 100만원, 둘째 150만원, 셋째 이상 300만원",
    description:
      "안산시 거주 출산 가정에 출산장려금을 지급합니다.",
    eligibility: "출생일 기준 안산시 주민등록 부모",
    period: "출생 후 6개월 이내 신청",
    contact: "안산시청 여성가족과 (031-481-2280)",
    isNational: false,
  },
  {
    id: "gyeonggi-ansan-002",
    regionId: "gyeonggi",
    cityId: "gyeonggi-ansan",
    type: "보육 지원",
    title: "안산시 다문화가정 육아 지원",
    amount: "육아 통역 서비스 무료 + 보육료 추가 지원",
    description:
      "안산시 거주 다문화 가정을 위한 육아 지원 서비스입니다. 육아 통역, 보육 연계, 언어 발달 지원 등이 포함됩니다.",
    eligibility: "안산시 거주 다문화 가정 영유아",
    period: "상시 신청",
    contact: "안산시 다문화가족지원센터 (031-501-9107)",
    isNational: false,
  },
  {
    id: "gyeonggi-ansan-003",
    regionId: "gyeonggi",
    cityId: "gyeonggi-ansan",
    type: "주거 지원",
    title: "안산시 신혼부부 임대주택 지원",
    amount: "시세 70% 수준 공공임대 우선 공급",
    description:
      "안산시 거주 신혼부부 및 출산 가정에 공공임대주택을 시세 70% 수준으로 우선 공급합니다.",
    eligibility: "안산시 거주 혼인 7년 이내 부부 또는 출산 가정",
    period: "모집 공고 시 신청",
    contact: "안산도시공사 (031-481-6000)",
    isNational: false,
  },

  // 경기 평택시
  {
    id: "gyeonggi-pyeongtaek-001",
    regionId: "gyeonggi",
    cityId: "gyeonggi-pyeongtaek",
    type: "출산장려금",
    title: "평택시 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 300만원, 넷째 이상 500만원",
    description:
      "평택시 거주 출산 가정에 출산장려금을 지급합니다. 넷째 이상 출산 가정에 최대 500만원을 지원하는 파격적인 혜택입니다.",
    eligibility: "출생일 기준 평택시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "평택시청 여성가족과 (031-8024-3190)",
    isNational: false,
  },
  {
    id: "gyeonggi-pyeongtaek-002",
    regionId: "gyeonggi",
    cityId: "gyeonggi-pyeongtaek",
    type: "육아수당",
    title: "평택시 영아 양육 수당",
    amount: "월 20만원 (만 0~2세)",
    description:
      "평택시 거주 만 0~2세 영아를 가정에서 양육하는 경우 월 20만원을 추가 지급합니다. 정부 부모급여와 별도로 지원됩니다.",
    eligibility: "평택시 거주 만 0~2세 아동을 가정 양육하는 부모",
    period: "출생 후 신청",
    contact: "평택시청 가정복지과 (031-8024-3200)",
    isNational: false,
  },
  {
    id: "gyeonggi-pyeongtaek-003",
    regionId: "gyeonggi",
    cityId: "gyeonggi-pyeongtaek",
    type: "보육 지원",
    title: "평택시 어린이집 추가 보육료 지원",
    amount: "월 최대 10만원 추가 지원",
    description:
      "평택시 거주 어린이집 이용 가정에 국가 보육료 외 추가 보육료를 지원합니다.",
    eligibility: "평택시 거주 어린이집 이용 만 0~5세 아동",
    period: "상시 신청",
    contact: "평택시 육아종합지원센터 (031-8024-8816)",
    isNational: false,
  },
  {
    id: "gyeonggi-pyeongtaek-004",
    regionId: "gyeonggi",
    cityId: "gyeonggi-pyeongtaek",
    type: "의료비 지원",
    title: "평택시 임산부 검진비 지원",
    amount: "산전 검사비 최대 40만원",
    description:
      "평택시 거주 임산부에게 산전 검사 비용을 지원합니다. 기형아 검사, 정밀 초음파 등 필수 검사 항목을 포함합니다.",
    eligibility: "평택시 거주 임산부",
    period: "임신 확인 후 즉시 신청",
    contact: "평택시 보건소 (031-8024-4000)",
    isNational: false,
  },
  {
    id: "gyeonggi-pyeongtaek-005",
    regionId: "gyeonggi",
    cityId: "gyeonggi-pyeongtaek",
    type: "주거 지원",
    title: "평택시 출산가구 주거 우선 지원",
    amount: "공공임대주택 우선 입주 / 이자 지원",
    description:
      "평택시 거주 출산 가구에 공공임대주택 우선 입주 기회를 제공합니다. 삼성·LG 등 대기업 협력으로 주거 인프라 확충 중입니다.",
    eligibility: "평택시 거주 출산 가구",
    period: "모집 공고 시 신청",
    contact: "평택도시공사 (031-8024-7000)",
    isNational: false,
  },

  // 경기 화성시
  {
    id: "gyeonggi-hwaseong-001",
    regionId: "gyeonggi",
    cityId: "gyeonggi-hwaseong",
    type: "출산장려금",
    title: "화성시 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 300만원, 넷째 이상 500만원",
    description:
      "화성시 거주 출산 가정에 출산장려금을 지급합니다. 경기도 내 최고 수준의 지원을 자랑합니다.",
    eligibility: "출생일 기준 화성시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "화성시청 여성가족과 (031-5189-3340)",
    isNational: false,
  },
  {
    id: "gyeonggi-hwaseong-002",
    regionId: "gyeonggi",
    cityId: "gyeonggi-hwaseong",
    type: "육아수당",
    title: "화성시 다자녀 지원금",
    amount: "셋째 이상 월 20만원 추가 양육수당",
    description:
      "화성시 거주 셋째 이상 자녀 가정에 추가 양육수당을 지급합니다.",
    eligibility: "화성시 거주 셋째 이상 자녀 가정",
    period: "출생 후 신청",
    contact: "화성시청 가정복지과 (031-5189-3350)",
    isNational: false,
  },
  {
    id: "gyeonggi-hwaseong-003",
    regionId: "gyeonggi",
    cityId: "gyeonggi-hwaseong",
    type: "보육 지원",
    title: "화성시 공공 보육 인프라 지원",
    amount: "국공립어린이집 우선 이용 + 보육료 월 5만원",
    description:
      "화성시가 적극 확충 중인 국공립어린이집 우선 이용 혜택을 제공합니다. 기업 도시 특성에 맞게 직장어린이집도 확대 운영 중입니다.",
    eligibility: "화성시 거주 만 0~5세 아동 부모",
    period: "상시 신청",
    contact: "화성시 육아종합지원센터 (031-5189-8816)",
    isNational: false,
  },

  // 경기 고양시
  {
    id: "gyeonggi-goyang-001",
    regionId: "gyeonggi",
    cityId: "gyeonggi-goyang",
    type: "출산장려금",
    title: "고양시 출산장려금",
    amount: "첫째 50만원, 둘째 100만원, 셋째 이상 200만원",
    description:
      "고양시 거주 출산 가정에 출산장려금을 지급합니다.",
    eligibility: "출생일 기준 고양시 주민등록 부모",
    period: "출생 후 6개월 이내 신청",
    contact: "고양시청 여성가족과 (031-8075-3360)",
    isNational: false,
  },
  {
    id: "gyeonggi-goyang-002",
    regionId: "gyeonggi",
    cityId: "gyeonggi-goyang",
    type: "주거 지원",
    title: "고양시 신혼·출산가구 임대주택",
    amount: "시세 60~80% 수준 임대",
    description:
      "고양시 거주 신혼부부 및 출산 가구에 공공임대주택을 시세 대비 저렴하게 제공합니다. GTX 개통 이후 교통 접근성이 크게 향상되었습니다.",
    eligibility: "고양시 거주 혼인 7년 이내 부부 또는 출산 가구",
    period: "모집 공고 시 신청",
    contact: "고양도시관리공사 (031-8075-7000)",
    isNational: false,
  },

  // 경기 남양주시
  {
    id: "gyeonggi-namyangju-001",
    regionId: "gyeonggi",
    cityId: "gyeonggi-namyangju",
    type: "출산장려금",
    title: "남양주시 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 이상 300만원",
    description:
      "남양주시 거주 출산 가정에 출산장려금을 지급합니다.",
    eligibility: "출생일 기준 남양주시 주민등록 부모",
    period: "출생 후 6개월 이내 신청",
    contact: "남양주시청 여성가족과 (031-590-2810)",
    isNational: false,
  },
  {
    id: "gyeonggi-namyangju-002",
    regionId: "gyeonggi",
    cityId: "gyeonggi-namyangju",
    type: "보육 지원",
    title: "남양주시 다자녀 보육료 지원",
    amount: "둘째 이상 보육료 월 5만원 추가",
    description:
      "남양주시 거주 다자녀 가정의 어린이집 보육료를 추가 지원합니다.",
    eligibility: "남양주시 거주 둘째 이상 자녀 가정",
    period: "상시 신청",
    contact: "남양주시 육아종합지원센터 (031-590-8816)",
    isNational: false,
  },

  // 경기 부천시
  {
    id: "gyeonggi-bucheon-001",
    regionId: "gyeonggi",
    cityId: "gyeonggi-bucheon",
    type: "출산장려금",
    title: "부천시 출산장려금",
    amount: "첫째 50만원, 둘째 100만원, 셋째 이상 200만원",
    description:
      "부천시 거주 출산 가정에 출산장려금을 지급합니다.",
    eligibility: "출생일 기준 부천시 주민등록 부모",
    period: "출생 후 6개월 이내 신청",
    contact: "부천시청 여성가족과 (032-625-3360)",
    isNational: false,
  },
  {
    id: "gyeonggi-bucheon-002",
    regionId: "gyeonggi",
    cityId: "gyeonggi-bucheon",
    type: "기타 지원",
    title: "부천시 만화·웹툰 가족 문화 체험",
    amount: "입장료 50% 할인 (부천만화박물관 등)",
    description:
      "부천시 가족 문화 자원을 활용하여 자녀 있는 가정에 문화 체험 할인 혜택을 제공합니다.",
    eligibility: "부천시 거주 자녀 있는 가정",
    period: "상시 이용",
    contact: "부천시 문화관광과 (032-625-3510)",
    isNational: false,
  },

  // ─── 강원특별자치도 ────────────────────────────────
  {
    id: "gangwon-001",
    regionId: "gangwon",
    type: "출산장려금",
    title: "강원도 출산장려금",
    amount: "첫째 50만원, 둘째 100만원, 셋째 200만원, 넷째 이상 300만원",
    description:
      "강원도 인구 유입 및 출생률 제고를 위해 출산장려금을 지급합니다. 지역 내 정착 조건 충족 시 추가 지원이 있습니다.",
    eligibility: "출생일 기준 강원도 주민등록 부모 (6개월 이상 거주)",
    period: "출생 후 1년 이내 신청",
    contact: "거주지 시·군 주민복지과",
    isNational: false,
  },
  {
    id: "gangwon-002",
    regionId: "gangwon",
    type: "주거 지원",
    title: "강원 귀농·귀촌 출산가구 주거 지원",
    amount: "주택 리모델링 비용 최대 500만원",
    description:
      "강원도 농촌 지역 귀농·귀촌 후 출산한 가구에 주거환경 개선을 위한 비용을 지원합니다.",
    eligibility: "강원도 농촌 지역 거주 귀농·귀촌 출산 가구",
    period: "출산 후 1년 이내 신청",
    contact: "강원도 농업기술원 또는 거주지 농업기술센터",
    isNational: false,
  },

  // 강원 춘천시
  {
    id: "gangwon-chuncheon-001",
    regionId: "gangwon",
    cityId: "gangwon-chuncheon",
    type: "출산장려금",
    title: "춘천시 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 이상 500만원",
    description:
      "춘천시 거주 출산 가정에 출산장려금을 지급합니다. 강원도 도청 소재지로 다양한 지원 인프라를 갖추고 있습니다.",
    eligibility: "출생일 기준 춘천시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "춘천시청 여성가족과 (033-250-3930)",
    isNational: false,
  },
  {
    id: "gangwon-chuncheon-002",
    regionId: "gangwon",
    cityId: "gangwon-chuncheon",
    type: "보육 지원",
    title: "춘천시 공공 보육 서비스",
    amount: "국공립어린이집 우선 이용 + 월 5만원",
    description:
      "춘천시가 운영하는 공공형 어린이집 이용 가정에 추가 보육료를 지원합니다.",
    eligibility: "춘천시 거주 만 0~5세 아동 부모",
    period: "상시 신청",
    contact: "춘천시 육아종합지원센터 (033-255-5678)",
    isNational: false,
  },

  // 강원 원주시
  {
    id: "gangwon-wonju-001",
    regionId: "gangwon",
    cityId: "gangwon-wonju",
    type: "출산장려금",
    title: "원주시 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 이상 400만원",
    description:
      "원주시 거주 출산 가정에 출산장려금을 지급합니다. 의료기기 산업도시 특성에 맞게 의료비 관련 추가 지원도 있습니다.",
    eligibility: "출생일 기준 원주시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "원주시청 여성가족과 (033-737-2930)",
    isNational: false,
  },
  {
    id: "gangwon-wonju-002",
    regionId: "gangwon",
    cityId: "gangwon-wonju",
    type: "의료비 지원",
    title: "원주시 출산·육아 의료비 지원",
    amount: "의료비 최대 50만원",
    description:
      "원주시 거주 출산 가정에 출산 및 육아 관련 의료비를 지원합니다. 지역 의료 인프라를 활용한 우수한 지원 프로그램입니다.",
    eligibility: "원주시 거주 출산 산모 및 만 2세 미만 영아",
    period: "출산 후 1년 이내 신청",
    contact: "원주시 보건소 (033-737-4000)",
    isNational: false,
  },

  // 강원 강릉시
  {
    id: "gangwon-gangneung-001",
    regionId: "gangwon",
    cityId: "gangwon-gangneung",
    type: "출산장려금",
    title: "강릉시 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 이상 500만원",
    description:
      "강릉시 거주 출산 가정에 출산장려금을 지급합니다. 해안 도시 특성을 살린 다양한 가족 지원 정책을 운영합니다.",
    eligibility: "출생일 기준 강릉시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "강릉시청 여성가족과 (033-640-5930)",
    isNational: false,
  },

  // 강원 속초시
  {
    id: "gangwon-sokcho-001",
    regionId: "gangwon",
    cityId: "gangwon-sokcho",
    type: "출산장려금",
    title: "속초시 출산장려금",
    amount: "첫째 200만원, 둘째 400만원, 셋째 이상 600만원",
    description:
      "속초시 거주 출산 가정에 높은 수준의 출산장려금을 지급합니다. 인구 감소 도시로서 파격적인 혜택을 제공합니다.",
    eligibility: "출생일 기준 속초시 주민등록 부모 (1년 이상 거주)",
    period: "출생 후 1년 이내 신청",
    contact: "속초시청 복지정책과 (033-639-2340)",
    isNational: false,
  },
  {
    id: "gangwon-sokcho-002",
    regionId: "gangwon",
    cityId: "gangwon-sokcho",
    type: "주거 지원",
    title: "속초시 청년 정착 주거 지원",
    amount: "월세 최대 20만원 지원 (2년)",
    description:
      "속초시에 정착하는 청년 출산 가구에 월세를 지원합니다. 인구 유입 정책의 일환으로 파격적인 혜택을 제공합니다.",
    eligibility: "속초시 거주 만 39세 이하 청년 출산 가구",
    period: "출산 후 신청",
    contact: "속초시청 주거복지과 (033-639-2000)",
    isNational: false,
  },

  // ─── 충청북도 ────────────────────────────────
  {
    id: "chungbuk-001",
    regionId: "chungbuk",
    type: "출산장려금",
    title: "충청북도 출산장려금",
    amount: "첫째 50만원, 둘째 100만원, 셋째 300만원, 넷째 이상 500만원",
    description:
      "충청북도 거주 출산 가정에 출생 순서에 따른 장려금을 지급합니다. 셋째 이상 출산 가정을 특별 우대합니다.",
    eligibility: "출생일 기준 충청북도 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "거주지 시·군·구청 가정복지과",
    isNational: false,
  },

  // 충북 청주시
  {
    id: "chungbuk-cheongju-001",
    regionId: "chungbuk",
    cityId: "chungbuk-cheongju",
    type: "출산장려금",
    title: "청주시 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 이상 400만원",
    description:
      "청주시 거주 출산 가정에 충청북도 지원 외 추가 출산장려금을 지급합니다.",
    eligibility: "출생일 기준 청주시 주민등록 부모",
    period: "출생 후 6개월 이내 신청",
    contact: "청주시청 여성가족과 (043-201-2930)",
    isNational: false,
  },
  {
    id: "chungbuk-cheongju-002",
    regionId: "chungbuk",
    cityId: "chungbuk-cheongju",
    type: "보육 지원",
    title: "청주시 공공 어린이집 운영",
    amount: "보육료 추가 지원 월 5만원",
    description:
      "청주시 운영 공공형 어린이집 이용 가정에 보육료를 추가 지원합니다. 충청북도 도청 소재지로 우수한 보육 인프라를 갖추고 있습니다.",
    eligibility: "청주시 거주 만 0~5세 아동 부모",
    period: "상시 신청",
    contact: "청주시 육아종합지원센터 (043-201-0000)",
    isNational: false,
  },
  {
    id: "chungbuk-cheongju-003",
    regionId: "chungbuk",
    cityId: "chungbuk-cheongju",
    type: "의료비 지원",
    title: "청주시 임산부 의료비 지원",
    amount: "산전 검사비 최대 30만원",
    description:
      "청주시 거주 임산부에게 산전 검사 비용을 지원합니다.",
    eligibility: "청주시 거주 임산부",
    period: "임신 확인 후 신청",
    contact: "청주시 보건소 (043-201-4000)",
    isNational: false,
  },

  // 충북 충주시
  {
    id: "chungbuk-chungju-001",
    regionId: "chungbuk",
    cityId: "chungbuk-chungju",
    type: "출산장려금",
    title: "충주시 출산장려금",
    amount: "첫째 100만원, 둘째 300만원, 셋째 이상 500만원",
    description:
      "충주시 거주 출산 가정에 출산장려금을 지급합니다. 셋째 이상 출산 가정에 파격적인 지원을 제공합니다.",
    eligibility: "출생일 기준 충주시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "충주시청 여성가족과 (043-850-3930)",
    isNational: false,
  },
  {
    id: "chungbuk-chungju-002",
    regionId: "chungbuk",
    cityId: "chungbuk-chungju",
    type: "주거 지원",
    title: "충주시 출산가구 농촌 주거 지원",
    amount: "빈집 리모델링 지원 최대 300만원",
    description:
      "충주시 농촌 지역 빈집을 활용하여 출산 가구에 주거 공간을 저렴하게 제공합니다.",
    eligibility: "충주시 농촌 지역 거주 희망 출산 가구",
    period: "상시 신청",
    contact: "충주시청 농촌개발과 (043-850-6000)",
    isNational: false,
  },

  // 충북 제천시
  {
    id: "chungbuk-jecheon-001",
    regionId: "chungbuk",
    cityId: "chungbuk-jecheon",
    type: "출산장려금",
    title: "제천시 출산장려금",
    amount: "첫째 200만원, 둘째 400만원, 셋째 이상 700만원",
    description:
      "제천시 거주 출산 가정에 높은 수준의 출산장려금을 지급합니다. 인구 감소 대응을 위한 파격 지원입니다.",
    eligibility: "출생일 기준 제천시 주민등록 부모 (1년 이상 거주)",
    period: "출생 후 1년 이내 신청",
    contact: "제천시청 여성가족과 (043-641-5590)",
    isNational: false,
  },

  // ─── 충청남도 ────────────────────────────────
  {
    id: "chungnam-001",
    regionId: "chungnam",
    type: "출산장려금",
    title: "충청남도 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 300만원, 넷째 이상 1,000만원",
    description:
      "충청남도가 출산 가정에 지급하는 출산장려금으로, 넷째 이상 출산 가정에 최대 1,000만원을 지원합니다.",
    eligibility: "출생일 기준 충청남도 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "거주지 시·군청 여성가족과",
    isNational: false,
  },
  {
    id: "chungnam-002",
    regionId: "chungnam",
    type: "의료비 지원",
    title: "충남 난임 시술비 지원",
    amount: "최대 110만원",
    description:
      "충청남도 거주 난임 부부에게 체외수정 시술비 등을 지원합니다. 정부 지원 외 추가 도비로 지원 범위를 확대합니다.",
    eligibility: "충청남도 거주 난임 판정 부부",
    period: "시술 전 신청",
    contact: "충청남도 보건환경연구원 또는 거주지 보건소",
    isNational: false,
  },

  // 충남 천안시
  {
    id: "chungnam-cheonan-001",
    regionId: "chungnam",
    cityId: "chungnam-cheonan",
    type: "출산장려금",
    title: "천안시 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 500만원, 넷째 이상 1,000만원",
    description:
      "천안시 거주 출산 가정에 충청남도 지원 외 추가 출산장려금을 지급합니다. 넷째 이상 출산 가정에 최대 1,000만원을 지원합니다.",
    eligibility: "출생일 기준 천안시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "천안시청 여성가족과 (041-521-2930)",
    isNational: false,
  },
  {
    id: "chungnam-cheonan-002",
    regionId: "chungnam",
    cityId: "chungnam-cheonan",
    type: "보육 지원",
    title: "천안시 공공 보육 확대 지원",
    amount: "보육료 추가 지원 월 5만원",
    description:
      "천안시 운영 공공형 어린이집 이용 가정에 보육료를 추가 지원합니다. 충청남도 최대 도시로 우수한 보육 인프라를 갖추고 있습니다.",
    eligibility: "천안시 거주 만 0~5세 아동 부모",
    period: "상시 신청",
    contact: "천안시 육아종합지원센터 (041-521-8816)",
    isNational: false,
  },
  {
    id: "chungnam-cheonan-003",
    regionId: "chungnam",
    cityId: "chungnam-cheonan",
    type: "주거 지원",
    title: "천안시 신혼부부 주거 지원",
    amount: "전세 보증금 대출 이자 연 최대 100만원",
    description:
      "천안시 거주 신혼부부에게 전세 보증금 대출 이자를 지원합니다.",
    eligibility: "천안시 거주 혼인 7년 이내 신혼부부",
    period: "상시 신청",
    contact: "천안시청 주거복지과 (041-521-5000)",
    isNational: false,
  },

  // 충남 아산시
  {
    id: "chungnam-asan-001",
    regionId: "chungnam",
    cityId: "chungnam-asan",
    type: "출산장려금",
    title: "아산시 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 500만원, 넷째 이상 1,000만원",
    description:
      "아산시 거주 출산 가정에 출산장려금을 지급합니다. 현대자동차 등 대기업 소재지로 경제력이 높은 지원을 제공합니다.",
    eligibility: "출생일 기준 아산시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "아산시청 여성가족과 (041-537-2930)",
    isNational: false,
  },
  {
    id: "chungnam-asan-002",
    regionId: "chungnam",
    cityId: "chungnam-asan",
    type: "육아수당",
    title: "아산시 영아 양육 수당",
    amount: "월 10만원 (만 0~2세)",
    description:
      "아산시 거주 만 0~2세 영아를 가정에서 양육하는 경우 추가 양육수당을 지급합니다.",
    eligibility: "아산시 거주 만 0~2세 영아를 가정에서 양육하는 부모",
    period: "출생 후 신청",
    contact: "아산시청 가정복지과 (041-537-2940)",
    isNational: false,
  },

  // 충남 서산시
  {
    id: "chungnam-seosan-001",
    regionId: "chungnam",
    cityId: "chungnam-seosan",
    type: "출산장려금",
    title: "서산시 출산장려금",
    amount: "첫째 200만원, 둘째 500만원, 셋째 이상 1,000만원",
    description:
      "서산시 거주 출산 가정에 파격적인 출산장려금을 지급합니다. 인구 유입 정책으로 경쟁력 있는 지원을 제공합니다.",
    eligibility: "출생일 기준 서산시 주민등록 부모 (1년 이상 거주)",
    period: "출생 후 1년 이내 신청",
    contact: "서산시청 여성가족과 (041-661-2930)",
    isNational: false,
  },

  // 충남 공주시
  {
    id: "chungnam-gongju-001",
    regionId: "chungnam",
    cityId: "chungnam-gongju",
    type: "출산장려금",
    title: "공주시 출산장려금",
    amount: "첫째 300만원, 둘째 500만원, 셋째 이상 1,000만원",
    description:
      "공주시 거주 출산 가정에 높은 수준의 출산장려금을 지급합니다. 백제 역사 문화 도시로 다양한 가족 지원 정책을 운영합니다.",
    eligibility: "출생일 기준 공주시 주민등록 부모 (6개월 이상 거주)",
    period: "출생 후 1년 이내 신청",
    contact: "공주시청 여성가족과 (041-840-2930)",
    isNational: false,
  },

  // ─── 전북특별자치도 ────────────────────────────────
  {
    id: "jeonbuk-001",
    regionId: "jeonbuk",
    type: "출산장려금",
    title: "전북 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 이상 300만원",
    description:
      "전북특별자치도 거주 출산 가정에 출산장려금을 지급합니다. 일부 시·군에서 별도 추가 지원을 실시하고 있습니다.",
    eligibility: "출생일 기준 전북 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "거주지 시·군청 복지과",
    isNational: false,
  },

  // 전북 전주시
  {
    id: "jeonbuk-jeonju-001",
    regionId: "jeonbuk",
    cityId: "jeonbuk-jeonju",
    type: "출산장려금",
    title: "전주시 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 이상 500만원",
    description:
      "전주시 거주 출산 가정에 출산장려금을 지급합니다. 전북 도청 소재지로 우수한 지원 인프라를 갖추고 있습니다.",
    eligibility: "출생일 기준 전주시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "전주시청 여성가족과 (063-281-5630)",
    isNational: false,
  },
  {
    id: "jeonbuk-jeonju-002",
    regionId: "jeonbuk",
    cityId: "jeonbuk-jeonju",
    type: "보육 지원",
    title: "전주시 한옥마을 가족 문화 지원",
    amount: "가족 문화 체험 무료 프로그램",
    description:
      "전주 한옥마을을 활용한 가족 문화 체험 프로그램을 무료로 운영합니다. 전통 문화 속에서 아이들이 다양한 경험을 할 수 있습니다.",
    eligibility: "전주시 거주 자녀 있는 가정",
    period: "상시 신청",
    contact: "전주시 문화관광과 (063-281-5510)",
    isNational: false,
  },

  // 전북 익산시
  {
    id: "jeonbuk-iksan-001",
    regionId: "jeonbuk",
    cityId: "jeonbuk-iksan",
    type: "출산장려금",
    title: "익산시 출산장려금",
    amount: "첫째 200만원, 둘째 400만원, 셋째 이상 600만원",
    description:
      "익산시 거주 출산 가정에 높은 수준의 출산장려금을 지급합니다.",
    eligibility: "출생일 기준 익산시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "익산시청 여성가족과 (063-859-5630)",
    isNational: false,
  },

  // 전북 군산시
  {
    id: "jeonbuk-gunsan-001",
    regionId: "jeonbuk",
    cityId: "jeonbuk-gunsan",
    type: "출산장려금",
    title: "군산시 출산장려금",
    amount: "첫째 200만원, 둘째 400만원, 셋째 이상 700만원",
    description:
      "군산시 거주 출산 가정에 출산장려금을 지급합니다. 항구 도시 특성을 살린 다양한 가족 지원 정책을 운영합니다.",
    eligibility: "출생일 기준 군산시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "군산시청 여성가족과 (063-454-5630)",
    isNational: false,
  },

  // ─── 전라남도 ────────────────────────────────
  {
    id: "jeonnam-001",
    regionId: "jeonnam",
    type: "출산장려금",
    title: "전라남도 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 300만원, 넷째 이상 500만원",
    description:
      "전라남도 거주 출산 가정에 출산장려금을 지급합니다. 농어촌 지역에 거주하는 경우 추가 혜택이 있습니다.",
    eligibility: "출생일 기준 전라남도 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "거주지 시·군청 사회복지과",
    isNational: false,
  },
  {
    id: "jeonnam-002",
    regionId: "jeonnam",
    type: "보육 지원",
    title: "전남 공동육아나눔터",
    amount: "무료 이용",
    description:
      "전라남도가 운영하는 공동육아나눔터로 육아 공간, 장난감 대여, 육아 정보를 무료로 제공합니다.",
    eligibility: "전라남도 거주 영유아 자녀를 둔 부모",
    period: "상시 이용",
    contact: "전라남도 건강가정지원센터",
    isNational: false,
  },

  // 전남 순천시
  {
    id: "jeonnam-suncheon-001",
    regionId: "jeonnam",
    cityId: "jeonnam-suncheon",
    type: "출산장려금",
    title: "순천시 출산장려금",
    amount: "첫째 200만원, 둘째 400만원, 셋째 이상 700만원",
    description:
      "순천시 거주 출산 가정에 출산장려금을 지급합니다. 생태 도시 특성을 살린 아이 친화적 환경을 제공합니다.",
    eligibility: "출생일 기준 순천시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "순천시청 여성가족과 (061-749-3530)",
    isNational: false,
  },
  {
    id: "jeonnam-suncheon-002",
    regionId: "jeonnam",
    cityId: "jeonnam-suncheon",
    type: "기타 지원",
    title: "순천만 생태 가족 체험 지원",
    amount: "순천만 국가정원 연간 무료 이용권",
    description:
      "순천시 거주 자녀 있는 가정에 순천만 국가정원 연간 무료 이용권을 제공합니다. 아이와 자연 속에서 건강하게 성장할 수 있는 환경을 지원합니다.",
    eligibility: "순천시 거주 만 12세 미만 자녀 있는 가정",
    period: "연 1회 신청",
    contact: "순천시 관광문화과 (061-749-3980)",
    isNational: false,
  },

  // 전남 여수시
  {
    id: "jeonnam-yeosu-001",
    regionId: "jeonnam",
    cityId: "jeonnam-yeosu",
    type: "출산장려금",
    title: "여수시 출산장려금",
    amount: "첫째 200만원, 둘째 400만원, 셋째 이상 600만원",
    description:
      "여수시 거주 출산 가정에 출산장려금을 지급합니다.",
    eligibility: "출생일 기준 여수시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "여수시청 여성가족과 (061-659-3530)",
    isNational: false,
  },

  // 전남 목포시
  {
    id: "jeonnam-mokpo-001",
    regionId: "jeonnam",
    cityId: "jeonnam-mokpo",
    type: "출산장려금",
    title: "목포시 출산장려금",
    amount: "첫째 300만원, 둘째 500만원, 셋째 이상 1,000만원",
    description:
      "목포시 거주 출산 가정에 파격적인 출산장려금을 지급합니다. 인구 유입을 위한 강력한 지원 정책입니다.",
    eligibility: "출생일 기준 목포시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "목포시청 여성가족과 (061-270-3530)",
    isNational: false,
  },
  {
    id: "jeonnam-mokpo-002",
    regionId: "jeonnam",
    cityId: "jeonnam-mokpo",
    type: "주거 지원",
    title: "목포시 출산가구 임대주택 지원",
    amount: "시세 50% 수준 공공임대",
    description:
      "목포시 거주 출산 가구에 공공임대주택을 시세 50% 수준으로 우선 공급합니다.",
    eligibility: "목포시 거주 출산 가구",
    period: "모집 공고 시 신청",
    contact: "목포시청 주거복지과 (061-270-4000)",
    isNational: false,
  },

  // ─── 경상북도 ────────────────────────────────
  {
    id: "gyeongbuk-001",
    regionId: "gyeongbuk",
    type: "출산장려금",
    title: "경상북도 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 300만원, 넷째 500만원, 다섯째 이상 1,000만원",
    description:
      "경상북도 거주 출산 가정에 높은 수준의 출산장려금을 지급합니다. 다섯째 이상 출산 시 최대 1,000만원을 지원합니다.",
    eligibility: "출생일 기준 경상북도 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "거주지 시·군청 복지과",
    isNational: false,
  },
  {
    id: "gyeongbuk-002",
    regionId: "gyeongbuk",
    type: "주거 지원",
    title: "경북 청년 농촌 보금자리 조성",
    amount: "임대료 지원 및 정착금",
    description:
      "경상북도 농촌 지역에 정착하는 청년 출산 가구에 주거 공간과 정착 지원금을 제공합니다.",
    eligibility: "경상북도 농촌 지역 정착 만 45세 이하 청년 출산 가구",
    period: "연 1회 공고",
    contact: "경상북도 농림축산국",
    isNational: false,
  },

  // 경북 포항시
  {
    id: "gyeongbuk-pohang-001",
    regionId: "gyeongbuk",
    cityId: "gyeongbuk-pohang",
    type: "출산장려금",
    title: "포항시 출산장려금",
    amount: "첫째 100만원, 둘째 300만원, 셋째 이상 500만원",
    description:
      "포항시 거주 출산 가정에 출산장려금을 지급합니다. 철강 산업 도시 특성에 맞게 경제적으로 탄탄한 지원을 제공합니다.",
    eligibility: "출생일 기준 포항시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "포항시청 여성가족과 (054-270-3930)",
    isNational: false,
  },
  {
    id: "gyeongbuk-pohang-002",
    regionId: "gyeongbuk",
    cityId: "gyeongbuk-pohang",
    type: "의료비 지원",
    title: "포항시 출산·육아 의료비 지원",
    amount: "의료비 최대 50만원",
    description:
      "포항시 거주 출산 가정에 출산 및 육아 관련 의료비를 지원합니다.",
    eligibility: "포항시 거주 출산 산모 및 만 2세 미만 영아",
    period: "출산 후 1년 이내 신청",
    contact: "포항시 보건소 (054-270-4000)",
    isNational: false,
  },

  // 경북 경주시
  {
    id: "gyeongbuk-gyeongju-001",
    regionId: "gyeongbuk",
    cityId: "gyeongbuk-gyeongju",
    type: "출산장려금",
    title: "경주시 출산장려금",
    amount: "첫째 200만원, 둘째 500만원, 셋째 이상 1,000만원",
    description:
      "경주시 거주 출산 가정에 높은 수준의 출산장려금을 지급합니다. 역사 문화 도시로서 인구 유입을 위한 파격 지원을 제공합니다.",
    eligibility: "출생일 기준 경주시 주민등록 부모 (1년 이상 거주)",
    period: "출생 후 1년 이내 신청",
    contact: "경주시청 여성가족과 (054-779-6930)",
    isNational: false,
  },
  {
    id: "gyeongbuk-gyeongju-002",
    regionId: "gyeongbuk",
    cityId: "gyeongbuk-gyeongju",
    type: "기타 지원",
    title: "경주 역사 문화 가족 체험 지원",
    amount: "국립경주박물관 등 연간 무료 이용",
    description:
      "경주시 거주 자녀 있는 가정에 국립경주박물관, 불국사 등 역사 문화 시설 연간 무료 이용권을 제공합니다.",
    eligibility: "경주시 거주 만 12세 미만 자녀 있는 가정",
    period: "연 1회 신청",
    contact: "경주시 문화관광과 (054-779-6600)",
    isNational: false,
  },

  // 경북 구미시
  {
    id: "gyeongbuk-gumi-001",
    regionId: "gyeongbuk",
    cityId: "gyeongbuk-gumi",
    type: "출산장려금",
    title: "구미시 출산장려금",
    amount: "첫째 100만원, 둘째 300만원, 셋째 이상 500만원",
    description:
      "구미시 거주 출산 가정에 출산장려금을 지급합니다. IT 산업도시 특성에 맞게 다양한 지원 서비스를 운영합니다.",
    eligibility: "출생일 기준 구미시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "구미시청 여성가족과 (054-480-6930)",
    isNational: false,
  },
  {
    id: "gyeongbuk-gumi-002",
    regionId: "gyeongbuk",
    cityId: "gyeongbuk-gumi",
    type: "보육 지원",
    title: "구미시 직장 어린이집 지원",
    amount: "직장어린이집 이용 가정 보육료 보조",
    description:
      "구미 산업단지 근무자를 위한 직장어린이집 이용 지원금을 제공합니다.",
    eligibility: "구미 산업단지 근무 부모 만 0~5세 자녀",
    period: "상시 신청",
    contact: "구미시청 보육지원과 (054-480-4000)",
    isNational: false,
  },

  // 경북 안동시
  {
    id: "gyeongbuk-andong-001",
    regionId: "gyeongbuk",
    cityId: "gyeongbuk-andong",
    type: "출산장려금",
    title: "안동시 출산장려금",
    amount: "첫째 300만원, 둘째 600만원, 셋째 이상 1,000만원",
    description:
      "안동시 거주 출산 가정에 파격적인 출산장려금을 지급합니다. 인구 감소 대응을 위한 강력한 지원입니다.",
    eligibility: "출생일 기준 안동시 주민등록 부모 (1년 이상 거주)",
    period: "출생 후 1년 이내 신청",
    contact: "안동시청 여성가족과 (054-840-6930)",
    isNational: false,
  },

  // ─── 경상남도 ────────────────────────────────
  {
    id: "gyeongnam-001",
    regionId: "gyeongnam",
    type: "출산장려금",
    title: "경상남도 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 이상 300만원",
    description:
      "경상남도 거주 출산 가정에 출산장려금을 지급합니다. 도·시·군이 함께 지원하는 구조입니다.",
    eligibility: "출생일 기준 경상남도 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "거주지 시·군청 여성가족과",
    isNational: false,
  },

  // 경남 창원시
  {
    id: "gyeongnam-changwon-001",
    regionId: "gyeongnam",
    cityId: "gyeongnam-changwon",
    type: "출산장려금",
    title: "창원시 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 이상 500만원",
    description:
      "창원시 거주 출산 가정에 출산장려금을 지급합니다. 경상남도 도청 소재지이자 최대 도시로 우수한 지원 인프라를 갖추고 있습니다.",
    eligibility: "출생일 기준 창원시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "창원시청 여성가족과 (055-225-3930)",
    isNational: false,
  },
  {
    id: "gyeongnam-changwon-002",
    regionId: "gyeongnam",
    cityId: "gyeongnam-changwon",
    type: "보육 지원",
    title: "창원시 국공립어린이집 확대",
    amount: "보육료 추가 지원 월 5만원",
    description:
      "창원시가 운영하는 국공립어린이집 우선 이용 혜택을 제공합니다. 경남 최대 도시답게 보육 인프라가 잘 갖춰져 있습니다.",
    eligibility: "창원시 거주 만 0~5세 아동 부모",
    period: "상시 신청",
    contact: "창원시 육아종합지원센터 (055-225-4000)",
    isNational: false,
  },
  {
    id: "gyeongnam-changwon-003",
    regionId: "gyeongnam",
    cityId: "gyeongnam-changwon",
    type: "주거 지원",
    title: "창원시 신혼부부 주거 지원",
    amount: "공공임대주택 우선 입주",
    description:
      "창원시 거주 신혼부부 및 출산 가구에 공공임대주택 우선 입주 기회를 제공합니다.",
    eligibility: "창원시 거주 혼인 7년 이내 신혼부부 또는 출산 가구",
    period: "모집 공고 시 신청",
    contact: "창원도시공사 (055-225-7000)",
    isNational: false,
  },

  // 경남 진주시
  {
    id: "gyeongnam-jinju-001",
    regionId: "gyeongnam",
    cityId: "gyeongnam-jinju",
    type: "출산장려금",
    title: "진주시 출산장려금",
    amount: "첫째 200만원, 둘째 400만원, 셋째 이상 700만원",
    description:
      "진주시 거주 출산 가정에 높은 수준의 출산장려금을 지급합니다.",
    eligibility: "출생일 기준 진주시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "진주시청 여성가족과 (055-749-3930)",
    isNational: false,
  },
  {
    id: "gyeongnam-jinju-002",
    regionId: "gyeongnam",
    cityId: "gyeongnam-jinju",
    type: "의료비 지원",
    title: "진주시 난임 부부 의료비 지원",
    amount: "시술비 최대 100만원",
    description:
      "진주시 거주 난임 부부에게 체외수정 등 난임 시술비를 지원합니다.",
    eligibility: "진주시 거주 난임 판정 부부",
    period: "시술 전 신청",
    contact: "진주시 보건소 (055-749-4000)",
    isNational: false,
  },

  // 경남 김해시
  {
    id: "gyeongnam-gimhae-001",
    regionId: "gyeongnam",
    cityId: "gyeongnam-gimhae",
    type: "출산장려금",
    title: "김해시 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 이상 400만원",
    description:
      "김해시 거주 출산 가정에 출산장려금을 지급합니다.",
    eligibility: "출생일 기준 김해시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "김해시청 여성가족과 (055-330-3930)",
    isNational: false,
  },
  {
    id: "gyeongnam-gimhae-002",
    regionId: "gyeongnam",
    cityId: "gyeongnam-gimhae",
    type: "보육 지원",
    title: "김해시 공공 보육 지원",
    amount: "보육료 추가 지원 월 5만원",
    description:
      "김해시 운영 공공형 어린이집 이용 가정에 보육료를 추가 지원합니다.",
    eligibility: "김해시 거주 만 0~5세 아동 부모",
    period: "상시 신청",
    contact: "김해시 육아종합지원센터 (055-330-4000)",
    isNational: false,
  },

  // 경남 양산시
  {
    id: "gyeongnam-yangsan-001",
    regionId: "gyeongnam",
    cityId: "gyeongnam-yangsan",
    type: "출산장려금",
    title: "양산시 출산장려금",
    amount: "첫째 100만원, 둘째 300만원, 셋째 이상 500만원",
    description:
      "양산시 거주 출산 가정에 출산장려금을 지급합니다.",
    eligibility: "출생일 기준 양산시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "양산시청 여성가족과 (055-392-3930)",
    isNational: false,
  },

  // ─── 제주특별자치도 ────────────────────────────────
  {
    id: "jeju-001",
    regionId: "jeju",
    type: "출산장려금",
    title: "제주도 출산장려금",
    amount: "첫째 100만원, 둘째 300만원, 셋째 이상 500만원",
    description:
      "제주특별자치도 거주 출산 가정에 출산장려금을 지급합니다. 제주 정착 기간에 따른 추가 지원을 검토 중입니다.",
    eligibility: "출생일 기준 제주도 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "거주지 읍면동 주민센터",
    isNational: false,
  },
  {
    id: "jeju-002",
    regionId: "jeju",
    type: "보육 지원",
    title: "제주 공공산후조리원",
    amount: "2주 이용료 50% 감면",
    description:
      "제주도가 운영하는 공공산후조리원을 저렴하게 이용할 수 있습니다. 다태아 출산 가정에는 추가 감면 혜택이 있습니다.",
    eligibility: "제주도 거주 출산 산모",
    period: "출산 후 신청",
    contact: "제주도 공공산후조리원 (064-120)",
    isNational: false,
  },

  // ─── 인천광역시 ────────────────────────────────
  {
    id: "incheon-001",
    regionId: "incheon",
    type: "출산장려금",
    title: "인천시 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 이상 300만원",
    description:
      "인천광역시 거주 출산 가정에 출산장려금을 지급합니다. 인천경제자유구역 거주 가정에는 별도 추가 혜택이 있습니다.",
    eligibility: "출생일 기준 인천시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "거주지 구청 가정복지과",
    isNational: false,
  },
  {
    id: "incheon-002",
    regionId: "incheon",
    type: "의료비 지원",
    title: "인천 산모·신생아 건강관리 지원",
    amount: "표준형 기준 본인부담 10%",
    description:
      "인천시 산모·신생아 건강관리사 파견 서비스로 출산 후 가정방문 건강관리를 지원합니다. 소득 기준에 따라 정부 지원 외 시비 추가 지원이 있습니다.",
    eligibility: "인천시 거주 출산 산모 (소득 기준별 상이)",
    period: "출산 예정일 40일 전~출산 후 30일 이내 신청",
    contact: "인천시 보건소 또는 거주지 구청",
    isNational: false,
  },

  // ─── 광주광역시 ────────────────────────────────
  {
    id: "gwangju-001",
    regionId: "gwangju",
    type: "출산장려금",
    title: "광주시 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 이상 300만원",
    description:
      "광주광역시 거주 출산 가정에 출산장려금을 지급합니다.",
    eligibility: "출생일 기준 광주시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "거주지 구청 복지과",
    isNational: false,
  },
  {
    id: "gwangju-002",
    regionId: "gwangju",
    type: "보육 지원",
    title: "광주형 공공 보육",
    amount: "보육료 추가 지원",
    description:
      "광주시가 운영하는 공공형 어린이집 확대를 통해 저렴하고 질 높은 보육 서비스를 제공합니다.",
    eligibility: "광주시 거주 만 0~5세 아동 부모",
    period: "상시 신청",
    contact: "광주시 육아종합지원센터",
    isNational: false,
  },

  // ─── 대전광역시 ────────────────────────────────
  {
    id: "daejeon-001",
    regionId: "daejeon",
    type: "출산장려금",
    title: "대전시 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 이상 300만원",
    description:
      "대전광역시 거주 출산 가정에 출산장려금을 지급합니다.",
    eligibility: "출생일 기준 대전시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "거주지 구청 복지과",
    isNational: false,
  },

  // ─── 울산광역시 ────────────────────────────────
  {
    id: "ulsan-001",
    regionId: "ulsan",
    type: "출산장려금",
    title: "울산시 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 이상 300만원",
    description:
      "울산광역시 거주 출산 가정에 출산장려금을 지급합니다.",
    eligibility: "출생일 기준 울산시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "거주지 구·군청 여성가족과",
    isNational: false,
  },

  // ─── 세종특별자치시 ────────────────────────────────
  {
    id: "sejong-001",
    regionId: "sejong",
    type: "출산장려금",
    title: "세종시 출산장려금",
    amount: "첫째 100만원, 둘째 200만원, 셋째 300만원, 넷째 이상 500만원",
    description:
      "세종특별자치시 거주 출산 가정에 출산장려금을 지급합니다. 신도시 특성에 맞는 다양한 육아 인프라도 함께 지원합니다.",
    eligibility: "출생일 기준 세종시 주민등록 부모",
    period: "출생 후 1년 이내 신청",
    contact: "세종시청 여성가족과 또는 읍면동 주민센터",
    isNational: false,
  },
  {
    id: "sejong-002",
    regionId: "sejong",
    type: "보육 지원",
    title: "세종 국공립어린이집 우선 이용",
    amount: "국공립어린이집 확대 (이용률 전국 최고)",
    description:
      "세종시는 전국 최고 수준의 국공립어린이집 이용률을 유지합니다. 신청 시 대기 기간이 타 지역 대비 짧습니다.",
    eligibility: "세종시 거주 만 0~5세 아동 부모",
    period: "상시 신청 (e-보육 신청)",
    contact: "세종시 육아종합지원센터",
    isNational: false,
  },
];

// Populate benefitCount for each region
// 2026-10-26 verification patches
export const ORIGINAL_KO = BENEFITS.map((b) => ({ ...b }));
import { KO_PATCHES, KO_REGION_NAMES, CITY_NEUTRALIZE_KO } from "./patches-2026";
for (const b of BENEFITS) { const p = KO_PATCHES[b.id]; if (p) Object.assign(b, p); else if (b.id.split("-").length === 3) neutralizeKo(b); }
function neutralizeKo(b: { title: string; amount: string; description: string; eligibility: string; period: string; contact: string }) {
  const d = /\d/;
  if (d.test(b.contact)) b.contact = "거주지 시·군·구청 / 행정복지센터";
  if (!d.test(b.amount + b.description + b.eligibility + b.period)) return;
  if (d.test(b.amount)) b.amount = CITY_NEUTRALIZE_KO.amount;
  b.description = ((b.description.split(/(?<=[.。])\s+/).filter((x) => !d.test(x)).join(" ") || b.title + " 관련 지원입니다.") + CITY_NEUTRALIZE_KO.note).trim();
  if (d.test(b.eligibility)) b.eligibility = "거주 시·군·구 기준 (공식 확인 필요)";
  if (d.test(b.period)) b.period = CITY_NEUTRALIZE_KO.period;
}
for (const r of REGIONS) { if (KO_REGION_NAMES[r.id]) r.name = KO_REGION_NAMES[r.id]; }

REGIONS.forEach((region) => {
  region.benefitCount = BENEFITS.filter(
    (b) => b.regionId === region.id && !b.cityId
  ).length;
});

// Populate benefitCount for each city
CITIES.forEach((city) => {
  city.benefitCount = BENEFITS.filter((b) => b.cityId === city.id).length;
});

export const BENEFIT_TYPE_COLORS: Record<BenefitType, { bg: string; text: string }> = {
  출산장려금: { bg: "tagBlue", text: "tagBlueForeground" },
  육아수당: { bg: "tagGreen", text: "tagGreenForeground" },
  "의료비 지원": { bg: "tagRose", text: "tagRoseForeground" },
  "보육 지원": { bg: "tagAmber", text: "tagAmberForeground" },
  "주거 지원": { bg: "tagPurple", text: "tagPurpleForeground" },
  "기타 지원": { bg: "muted", text: "mutedForeground" },
};

export const ALL_BENEFIT_TYPES: BenefitType[] = [
  "출산장려금",
  "육아수당",
  "의료비 지원",
  "보육 지원",
  "주거 지원",
  "기타 지원",
];

export function getBenefitsByRegion(regionId: string): Benefit[] {
  return BENEFITS.filter((b) => b.regionId === regionId && !b.cityId);
}

export function getBenefitsByCity(cityId: string): Benefit[] {
  return BENEFITS.filter((b) => b.cityId === cityId);
}

export function getCitiesByProvince(provinceId: string): City[] {
  return CITIES.filter((c) => c.provinceId === provinceId);
}

export function getCityById(id: string): City | undefined {
  return CITIES.find((c) => c.id === id);
}

export function getRegionById(id: string): Region | undefined {
  return REGIONS.find((r) => r.id === id);
}

export function getBenefitById(id: string): Benefit | undefined {
  return BENEFITS.find((b) => b.id === id);
}

export function searchBenefits(query: string): Benefit[] {
  const q = query.toLowerCase();
  return BENEFITS.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      b.type.toLowerCase().includes(q) ||
      b.amount.toLowerCase().includes(q)
  );
}

// Hide editorial "previous record was changed" notes from visitors (kept in patches-2026.ts for history).
import { stripEditNotes } from "../lib/editnotes";
for (const b of BENEFITS) { b.description = stripEditNotes(b.description); b.amount = stripEditNotes(b.amount); b.eligibility = stripEditNotes(b.eligibility); }
