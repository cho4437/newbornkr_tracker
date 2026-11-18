
export type GuideSlug =
  | "seoul"
  | "gyeonggi-suwon"
  | "busan"
  | "parent-and-child-allowance"
  | "birth-registration-checklist";

export interface GuideSection {
  heading: string;
  body?: string;
  bullets?: string[];
  note?: string;
}

export interface GuideLink {
  label: string;
  url: string;
}

export interface Guide {
  slug: GuideSlug;
  title: string;
  eyebrow: string;
  summary: string;
  verifiedAt: string;
  regionId?: string;
  cityId?: string;
  relatedBenefitIds: string[];
  sections: GuideSection[];
  applicationLinks: GuideLink[];
  sources: GuideLink[];
}

const VERIFIED_AT = "2026-09-28";

const HAPPY_BIRTH_URL = "https://www.gov.kr/portal/onestopSvc/happyBirth";
const FIRST_MEETING_SOURCE =
  "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00004656";
const PARENT_ALLOWANCE_SOURCE =
  "https://www.bokjiro.go.kr/ssis-tbu/cms/pc/customer/notice/1309189_1141.html";
const CHILD_ALLOWANCE_SOURCE = "https://www.mohw.go.kr/menu.es?mid=a10711030100";

export const GUIDES: Guide[] = [
  {
    slug: "seoul",
    title: "서울 출산지원금·산후조리 지원 가이드",
    eyebrow: "서울특별시 · 출산 후 확인",
    summary:
      "전국 공통 첫만남이용권과 서울시 산후조리경비는 별도 사업입니다. 서울시 지원은 거주·출생등록·신청기한 조건을 먼저 확인하세요.",
    verifiedAt: VERIFIED_AT,
    regionId: "seoul",
    relatedBenefitIds: ["seoul-001", "nat-001"],
    sections: [
      {
        heading: "전국 공통: 첫만남이용권",
        body:
          "보건복지부 사업으로 출생아에게 국민행복카드 바우처를 지급합니다. 첫째는 200만원, 둘째 이상은 300만원입니다. 출생신고 후 주민등록번호가 부여된 아동이 대상이며, 복지로 안내는 2024년 이후 출생아 중 출생일로부터 2년이 지나지 않은 아동을 대상으로 안내합니다.",
        note:
          "이는 서울시 추가 지원금이 아닙니다. 사용기한은 아동 출생일로부터 2년이며, 사용처·신청 가능 여부는 복지로 안내에서 확인하세요.",
      },
      {
        heading: "서울시: 서울형 산후조리경비",
        body:
          "서울시가 산모 본인 명의 협약카드에 바우처를 지급하는 지역 사업입니다. 중위소득 제한이 없다고 서울시 사업 안내에 표시되어 있습니다.",
        bullets: [
          "지원액: 첫째 100만원, 둘째 120만원, 셋째 이상 150만원. 다태아 유·사산 산모는 단태아 기준으로 지원.",
          "거주·등록 조건: 신청일 기준 출산모가 서울에 90일 이상 계속 거주하고, 출생아도 신청일 기준 서울 거주 및 서울시 출생신고가 되어 있어야 합니다.",
          "신청기한: 출산일로부터 180일 이내. 미숙아 입원 등 예외가 있으므로 해당하면 서울시 안내의 예외 조건을 확인하세요.",
          "사용: 산모·신생아 건강관리, 의약품·건강식품, 한약, 산후운동, 심리상담 등 안내된 항목에 사용할 수 있습니다. 2026년 7월 1일부터 사용지역은 서울 소재 가맹점입니다.",
        ],
        note:
          "서울시 사업은 거주요건을 충족하지 못하면 받을 수 없습니다. 서울시 외 주소지에는 해당되지 않으며, 카드사·가맹점 조건도 신청 전 확인하세요.",
      },
      {
        heading: "신청 순서",
        bullets: [
          "출생신고와 서울시 주민등록상 출생등록이 반영됐는지 확인합니다.",
          "산모 본인 명의 휴대전화로 서울시 탄생육아 몽땅정보통에서 신청합니다. 서울시 안내상 본인 외 대리신청은 불가합니다.",
          "주소지 동주민센터 방문 신청도 안내되어 있습니다. 신청일 기준 90일 거주와 180일 신청기한을 놓치지 않도록 확인하세요.",
          "전국 공통 첫만남이용권은 복지로·정부24 또는 주소지 읍면동에서 별도로 신청할 수 있습니다.",
        ],
      },
    ],
    applicationLinks: [
      { label: "서울시 탄생육아 몽땅정보통", url: "https://umppa.seoul.go.kr/" },
      { label: "정부24 행복출산 원스톱", url: HAPPY_BIRTH_URL },
    ],
    sources: [
      {
        label: "서울형 산후조리경비 지원 — 서울시 탄생육아 몽땅정보통",
        url: "https://umppa.seoul.go.kr/hmpg/sprt/bzin/bzmgComtDetail.do?biz_mng_no=58D83411277E40D1BFF6255A10CBCDD5",
      },
      { label: "첫만남이용권 — 복지로 (2026)", url: FIRST_MEETING_SOURCE },
      { label: "행복출산 원스톱 — 정부24", url: HAPPY_BIRTH_URL },
    ],
  },
  {
    slug: "gyeonggi-suwon",
    title: "수원 출산지원금·경기도 산후조리비 가이드",
    eyebrow: "경기도 수원시 · 시와 도 지원 구분",
    summary:
      "수원시 출산지원금과 경기도 산후조리비는 서로 다른 지역 사업입니다. 2026년 출생아 기준 금액, 수원 거주 조건, 신청기한을 나눠 확인하세요.",
    verifiedAt: VERIFIED_AT,
    regionId: "gyeonggi",
    cityId: "gyeonggi-suwon",
    relatedBenefitIds: ["gyeonggi-suwon-001", "nat-001", "nat-002", "nat-004"],
    sections: [
      {
        heading: "수원시: 자녀 출산·입양 지원금",
        body:
          "수원시 자체 지원입니다. 시 안내는 수원시 거주 180일 이상인 첫째 자녀 이상 출산가정을 지원대상으로 제시합니다. 아래 출생아 금액은 2026년 1월 1일 이후 출생아부터 적용됩니다.",
        bullets: [
          "첫째 50만원, 둘째 100만원, 셋째 200만원, 넷째 500만원, 다섯째 이상 1,000만원.",
          "세쌍둥이 이상 출산가정은 출산지원금에 500만원을 추가 지원한다고 수원시가 안내합니다.",
          "출생일부터 1년 이내 주소지 동 행정복지센터에서 신청하거나 정부24 행복출산 원스톱으로 신청할 수 있습니다.",
          "수원시 안내 구비서류: 신분증, 신청서, 통장 사본. 다섯째 이상은 분할 지급 조건이 있으므로 시 안내를 확인하세요.",
        ],
        note:
          "2025년 12월 31일 이전 출생아는 개정 전 기준을 적용한다고 수원시가 별도로 안내합니다. 입양 지원은 출생아 지원과 조건·금액이 다르므로 이 가이드의 출산 금액을 적용하지 마세요.",
      },
      {
        heading: "경기도: 산후조리비 지원",
        body:
          "경기도 사업으로, 수원 거주 가정에는 출생아 1인당 수원페이 50만원을 지원합니다. 다태아는 출생아 수만큼 지급액을 곱합니다.",
        bullets: [
          "부 또는 모가 출생일과 신청일 현재 경기도 주민등록을 두고 실제 거주해야 하며, 영아는 경기도(수원시)에 출생등록되어 있어야 합니다.",
          "신청일 현재 출생일로부터 12개월이 지나지 않아야 합니다.",
          "출생아 첫 주소지 관할 행정복지센터에 방문하거나 경기민원24에서 신청할 수 있습니다. 온라인 신청은 본인만 가능하며, 외국인은 온라인 신청이 불가하다고 수원시가 안내합니다.",
        ],
        note:
          "이 산후조리비는 경기도 사업이고, 앞 절의 출산지원금은 수원시 사업입니다. 각 사업의 주민등록·실거주 요건을 따로 확인하세요.",
      },
      {
        heading: "전국 공통 지원도 별도로 확인",
        body:
          "첫만남이용권·부모급여·아동수당은 시·도 지원이 아니라 전국 공통 제도입니다. 수원시·경기도 지역 사업과는 별도로 정부24 행복출산 또는 복지로에서 확인하고 신청하세요.",
      },
    ],
    applicationLinks: [
      {
        label: "수원시 자녀 출산·입양 지원금 안내",
        url: "https://www.suwon.go.kr/sw-www/deptHome/dep_welfare/welfare14/welfare14-01/welfare14-01-10.jsp",
      },
      {
        label: "경기도 산후조리비 온라인 신청 — 경기민원24",
        url: "https://gg24.gg.go.kr/",
      },
      { label: "정부24 행복출산 원스톱", url: HAPPY_BIRTH_URL },
    ],
    sources: [
      {
        label: "자녀 출산·입양 지원금 — 수원시",
        url: "https://www.suwon.go.kr/sw-www/deptHome/dep_welfare/welfare14/welfare14-01/welfare14-01-10.jsp",
      },
      {
        label: "경기도 산후조리비 지원 — 수원시 안내",
        url: "https://www.suwon.go.kr/sw-www/deptHome/dep_welfare/welfare14/welfare14-01/welfare14-01-14.jsp",
      },
      { label: "행복출산 원스톱 — 정부24", url: HAPPY_BIRTH_URL },
    ],
  },
  {
    slug: "busan",
    title: "부산 출산지원금 가이드",
    eyebrow: "부산광역시 · 전국 공통 바우처와 구분",
    summary:
      "부산의 2026년 출생아 안내에서 첫째와 둘째 이상 지원 구성이 다릅니다. 첫만남이용권은 전국 사업이고, 둘째 이상 부산시 지원은 별도 현금입니다.",
    verifiedAt: VERIFIED_AT,
    regionId: "busan",
    relatedBenefitIds: ["busan-001", "nat-001"],
    sections: [
      {
        heading: "전국 공통: 첫만남이용권",
        body:
          "부산시 안내에 따르면 2026년 출생아는 첫째 200만원, 둘째 이상 300만원의 첫만남이용권을 받습니다. 국민행복카드 바우처이며, 이는 부산시만의 추가 현금이 아니라 전국 공통 제도입니다.",
        bullets: [
          "복지로는 출생신고되어 주민등록번호를 부여받은 아동을 대상으로 안내합니다.",
          "부산시 안내 기준으로 아동 출생일로부터 2년까지 사용할 수 있으며, 사용 종료 후 남은 포인트는 소멸합니다.",
          "읍면동 행정복지센터, 복지로 또는 정부24에서 신청할 수 있습니다.",
        ],
      },
      {
        heading: "부산시 추가 지원: 둘째 이후 100만원",
        body:
          "부산광역시가 둘째 이후 출생아 가정에 시비 100만원을 일시금으로 추가 지급합니다. 신청인의 계좌로 현금 지급하며 첫째 출생에는 이 추가 시비 100만원이 없습니다.",
        bullets: [
          "출생신고를 부산에 하고 주민등록에 등재한 둘째 이후 자녀가 대상입니다.",
          "출생신고일 현재 부모 중 한 명과 둘째 이후 아동이 부산광역시 내 같은 주민등록지에 등재·거주해야 합니다. 지급 전에 다른 시도로 주소를 옮기면 대상에서 제외된다고 부산시가 안내합니다.",
          "출생일로부터 3개월 이내 거주지 읍면동 행정복지센터 또는 정부24에서 신청합니다.",
          "부산시 안내상 접수 다음 달 10일 지급이며, 10일이 휴일이면 전일 지급합니다.",
        ],
        note:
          "구·군 자체 사업은 이 시비 사업과 별도일 수 있습니다. 거주 구·군에서 추가 사업을 운영하는지 공식 안내로 확인하세요. 확인되지 않은 구·군 금액은 여기에 합산하지 않았습니다.",
      },
      {
        heading: "신청할 때",
        bullets: [
          "출생신고 후 첫만남이용권과 해당 지역 서비스를 함께 살펴보세요. 정부24 행복출산에는 전국 공통 서비스와 지자체 서비스가 별도 항목으로 안내됩니다.",
          "부산시 추가 100만원은 둘째 이후만 해당하고, 3개월 신청기한과 주민등록 요건이 따로 있으므로 전국 바우처 신청만으로 끝났다고 생각하지 마세요.",
          "온라인 신청은 아동 보호자가 부모인 경우 가능하다고 부산시가 안내합니다. 다른 대리 신청은 주소지 행정복지센터에 문의하세요.",
        ],
      },
    ],
    applicationLinks: [
      { label: "부산시 출산지원금 신청 안내", url: "https://www.busan.go.kr/childcare/childcare010101" },
      { label: "정부24 행복출산 원스톱", url: HAPPY_BIRTH_URL },
      { label: "복지로 첫만남이용권 서비스", url: FIRST_MEETING_SOURCE },
    ],
    sources: [
      { label: "출산지원금 — 부산광역시", url: "https://www.busan.go.kr/childcare/childcare010101" },
      { label: "첫만남이용권 — 복지로 (2026)", url: FIRST_MEETING_SOURCE },
      { label: "행복출산 원스톱 — 정부24", url: HAPPY_BIRTH_URL },
    ],
  },
  {
    slug: "parent-and-child-allowance",
    title: "부모급여와 아동수당, 함께 받을 수 있나요?",
    eyebrow: "전국 공통 · 2026년 기준",
    summary:
      "네. 부모급여와 아동수당은 별도 전국 제도이므로 각각의 대상 요건을 충족하면 함께 신청할 수 있습니다. 어린이집 이용 시 달라지는 부모급여 지급방식도 확인하세요.",
    verifiedAt: VERIFIED_AT,
    regionId: "national",
    relatedBenefitIds: ["nat-002", "nat-003", "nat-004"],
    sections: [
      {
        heading: "두 제도는 별도로 지원됩니다",
        body:
          "정부24 행복출산은 부모급여와 아동수당을 각각 전국 공통 서비스로 안내하고, 보건복지부도 두 제도를 별도 정책으로 안내합니다. 따라서 부모급여를 신청했다고 아동수당 신청을 생략하지 말고 두 항목을 함께 확인하세요.",
        note:
          "공식 안내가 각 제도를 별도 항목으로 제시한다는 점을 기준으로 안내합니다. 실제 수급은 아동의 요건·신청 및 지급정보 확인에 따라 결정됩니다.",
      },
      {
        heading: "부모급여 금액과 신청기한",
        bullets: [
          "대상: 만 2세 미만 아동(0~23개월).",
          "가정양육 기준: 0세 월 100만원, 1세 월 50만원.",
          "출생일이 속한 달부터 받으려면 출생일 포함 60일 이내 신청합니다. 60일이 지나면 신청한 달부터 지급되어 이전 달은 소급되지 않습니다.",
          "어린이집 이용 시 부모급여 전액이 현금으로 들어오는 방식이 아니라 보육료 바우처와 차액으로 지원됩니다. 2026년 복지로 안내는 0세 기본보육료 58만4천원 및 차액 41만6천원, 1세 기본보육료 51만5천원 및 차액 없음으로 안내합니다.",
        ],
      },
      {
        heading: "아동수당 금액과 대상",
        bullets: [
          "보건복지부 2026년 3월 31일 수정 안내 기준 만 9세 미만 아동 대상입니다.",
          "월 10만~13만원으로 거주지역에 따라 다릅니다. 보건복지부 안내는 수도권 10만원, 비수도권 10만5천원, 인구감소지역 우대 11만원, 특별지역 12만원에 지역화폐 1만원 추가로 제시합니다.",
          "지급은 현금 입금이 원칙이나, 시군구 조례에 따라 지역상품권 지급이 가능합니다.",
          "신청은 읍면동 주민센터 방문 또는 복지로 온라인으로 안내되어 있습니다.",
        ],
        note:
          "아동수당의 지역별 금액·지급수단은 거주지 기준으로 달라질 수 있습니다. 이사했거나 특별지역 대상 여부가 궁금하면 주소지 지자체에 확인하세요.",
      },
      {
        heading: "함께 신청하는 방법",
        bullets: [
          "정부24 행복출산 원스톱에서 부모급여와 아동수당 항목을 각각 확인해 신청하거나, 출생자의 주소지 읍면동 주민센터에서 신청합니다.",
          "부모급여는 특히 출생일 포함 60일 기한을 주의하세요. 마감일은 부모급여 신청 마감일 계산기에서 확인할 수 있습니다. 온라인 신청은 보호자 유형에 제한이 있을 수 있으므로 정부24·복지로의 본인 자격 안내를 확인합니다.",
          "어린이집 또는 종일제 아이돌봄을 이용한다면 해당 보육료·돌봄 서비스 신청과 부모급여 지급 방식을 별도로 확인합니다.",
        ],
      },
    ],
    applicationLinks: [
      { label: "부모급여 신청 마감일 계산기", url: "/guide/parent-allowance-deadline" },
      { label: "정부24 행복출산 원스톱", url: HAPPY_BIRTH_URL },
      { label: "복지로 부모급여 신청 안내", url: "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00004657" },
      { label: "복지로 서비스 찾기", url: "https://www.bokjiro.go.kr/" },
    ],
    sources: [
      { label: "2026년 부모급여 지원 안내 — 복지로", url: PARENT_ALLOWANCE_SOURCE },
      { label: "아동수당 지급 — 보건복지부", url: CHILD_ALLOWANCE_SOURCE },
      { label: "행복출산 원스톱 — 정부24", url: HAPPY_BIRTH_URL },
    ],
  },
  {
    slug: "birth-registration-checklist",
    title: "출생신고 후 신청할 지원금 체크리스트",
    eyebrow: "출생 후 신청 준비 · 전국 공통 + 거주지 지원",
    summary:
      "출생신고 직후 전국 공통 급여와 거주지 지자체 지원을 구분해 확인하세요. 부모급여는 출생일 포함 60일 안에 신청해야 출생월부터 소급 지원됩니다.",
    verifiedAt: VERIFIED_AT,
    regionId: "national",
    relatedBenefitIds: ["nat-001", "nat-002", "nat-003", "nat-004"],
    sections: [
      {
        heading: "1. 출생신고와 아동 주민등록 확인",
        body:
          "첫만남이용권은 출생신고되어 주민등록번호를 부여받은 아동이 대상입니다. 지역 사업도 서울 출생등록 등 별도 주소·주민등록 조건이 있을 수 있으므로 신청 전에 아동의 등록 주소를 확인하세요.",
      },
      {
        heading: "2. 부모급여 — 60일 기한부터 챙기기",
        bullets: [
          "만 2세 미만 아동 대상. 가정양육 기준 0세 월 100만원, 1세 월 50만원입니다.",
          "출생일 포함 60일 이내 신청해야 출생월부터 소급 지원됩니다. 기한을 넘기면 신청한 달부터 지급됩니다. 마감일은 부모급여 신청 마감일 계산기에서 확인할 수 있습니다.",
          "어린이집·종일제 아이돌봄 이용 시 보육료·돌봄 지원으로 지급 형태가 달라지므로 해당 서비스를 별도 신청하세요.",
        ],
      },
      {
        heading: "3. 첫만남이용권 — 국민행복카드 바우처",
        bullets: [
          "첫째 200만원, 둘째 이상 300만원의 전국 공통 바우처입니다.",
          "복지로 안내상 출생신고되어 주민등록번호가 부여된 아동이 대상이며, 2024년 이후 출생아는 출생일로부터 2년이 지나지 않은 아동으로 안내됩니다.",
          "행정복지센터, 복지로 또는 정부24에서 신청할 수 있습니다. 부산시 안내는 출생일로부터 2년까지 사용하며 미사용 포인트는 사용 종료 후 소멸된다고 설명합니다.",
        ],
      },
      {
        heading: "4. 아동수당 — 별도 항목으로 신청 확인",
        bullets: [
          "보건복지부 2026년 3월 31일 수정 안내 기준 만 9세 미만 아동 대상, 월 10만~13만원이며 거주지역에 따라 다릅니다.",
          "읍면동 주민센터 또는 복지로에서 신청합니다. 부모급여와 별개 제도이므로 두 항목을 함께 확인하세요.",
        ],
      },
      {
        heading: "5. 거주지 출산지원도 확인",
        body:
          "정부24 행복출산에는 시·도 및 시·군·구 출산지원금 등 지자체 서비스가 별도 안내되어 있고, 지자체별로 서비스가 다를 수 있습니다. 해당 거주지 주소를 기준으로 공식 지자체 공고와 신청기한을 확인하세요.",
        bullets: [
          "서울: 서울형 산후조리경비는 신청일 기준 산모 서울 거주 90일 이상, 서울 출생등록, 출산 후 180일 이내 신청 조건이 있습니다.",
          "수원: 시 출산지원금은 수원시 거주 180일 이상 기준과 출생 후 1년 이내 신청기한을 확인하세요. 경기도 산후조리비는 별도 사업으로 출생 후 12개월 이내 신청합니다.",
          "부산: 시 추가 출산지원금은 둘째 이후 대상이고, 출생신고일 현재 부산 내 부모·아동 같은 주민등록지 거주와 출생 후 3개월 이내 신청 조건이 있습니다.",
        ],
        note:
          "다른 시·군·구의 금액·자격·기한은 여기서 확인하지 않았습니다. 거주지 또는 출생 당시 주소의 담당 행정복지센터에 공식 확인이 필요합니다.",
      },
      {
        heading: "6. 한 번에 신청하거나 창구에 문의",
        bullets: [
          "정부24 행복출산 온라인 신청은 산모 본인 또는 배우자가 대상이며, 인증 후 신청서를 작성하면 주민센터에서 확인·접수합니다.",
          "방문 신청은 출생자의 주소지 읍면동 주민센터에서 합니다. 정부24 안내는 신분증 지참을 안내합니다.",
          "모든 서비스를 한 번에 신청할 수 있다고 단정하지 말고, 각 사업의 별도 요건·추가서류·지자체 접수 방식을 확인하세요.",
        ],
      },
    ],
    applicationLinks: [
      { label: "부모급여 신청 마감일 계산기", url: "/guide/parent-allowance-deadline" },
      { label: "정부24 행복출산 원스톱 신청", url: HAPPY_BIRTH_URL },
      { label: "복지로 부모급여 안내", url: PARENT_ALLOWANCE_SOURCE },
      { label: "복지로 첫만남이용권 안내", url: FIRST_MEETING_SOURCE },
      { label: "보건복지부 아동수당 안내", url: CHILD_ALLOWANCE_SOURCE },
    ],
    sources: [
      { label: "행복출산 원스톱 — 정부24", url: HAPPY_BIRTH_URL },
      { label: "2026년 부모급여 지원 안내 — 복지로", url: PARENT_ALLOWANCE_SOURCE },
      { label: "첫만남이용권 — 복지로 (2026)", url: FIRST_MEETING_SOURCE },
      { label: "아동수당 지급 — 보건복지부", url: CHILD_ALLOWANCE_SOURCE },
      {
        label: "서울형 산후조리경비 지원 — 서울시",
        url: "https://umppa.seoul.go.kr/hmpg/sprt/bzin/bzmgComtDetail.do?biz_mng_no=58D83411277E40D1BFF6255A10CBCDD5",
      },
      {
        label: "수원시 자녀 출산·입양 지원금",
        url: "https://www.suwon.go.kr/sw-www/deptHome/dep_welfare/welfare14/welfare14-01/welfare14-01-10.jsp",
      },
      { label: "부산시 출산지원금", url: "https://www.busan.go.kr/childcare/childcare010101" },
    ],
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}

