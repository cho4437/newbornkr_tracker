
type ChecklistItem = {
  title: string;
  summary: string;
  agency: string;
  documents?: string;
};

type ChecklistSection = {
  number: string;
  title: string;
  timing: string;
  tip?: string;
  items: ChecklistItem[];
};

export const KO_CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    number: "1",
    title: "출생신고 & 정부 지원금",
    timing: "출생 후 30일 이내",
    tip: "정부24 또는 주민센터의 ‘행복출산 원스톱 서비스’를 이용하면 지원금을 한 번에 신청할 수 있습니다.",
    items: [
      {
        title: "출생신고",
        summary: "출생 후 30일 이내 필수 (미루면 과태료)",
        agency:
          "관할 읍·면·동 행정복지센터(주민센터) 방문 또는 대법원 전자가족관계등록시스템(온라인)",
        documents: "출생증명서 원본(병원 발급), 신청인 신분증",
      },
      {
        title: "첫만남이용권",
        summary: "첫째 200만 원 / 둘째 이상 300만 원 (전국 공통 바우처, 최신 조건은 공식 안내 확인)",
        agency: "관할 행정복지센터(주민센터), 복지로(온라인), 정부24",
      },
      {
        title: "부모급여",
        summary: "0세(0~11개월) 월 100만 원 / 1세 월 50만 원 (현금)",
        agency: "관할 행정복지센터(주민센터), 복지로(온라인), 정부24",
      },
      {
        title: "아동수당",
        summary: "만 9세 미만, 거주지역별 월 10만~13만 원 (지급수단은 지역별 확인)",
        agency: "관할 행정복지센터(주민센터), 복지로(온라인), 정부24",
      },
      {
        title: "지자체 출산축하금",
        summary: "거주지 지자체별 차등 지급",
        agency: "관할 행정복지센터(주민센터) 또는 행복출산 원스톱 서비스",
      },
    ],
  },
  {
    number: "2",
    title: "건강보험 & 의료 혜택",
    timing: "출생 직후",
    items: [
      {
        title: "건강보험 피부양자 등록",
        summary: "출생신고 후 피부양자 등재 여부를 확인하고, 등재되지 않았으면 피부양자 자격취득 신고 (정부24·공단 지사·홈페이지)",
        agency: "국민건강보험공단 (지사 방문, 고객센터 1577-1000, 또는 홈페이지)",
      },
      {
        title: "B형 간염 접종 & 아기수첩",
        summary: "퇴원 전 1차 접종 및 수첩 수령",
        agency: "분만 산부인과/소아과 병원",
      },
      {
        title: "고위험 신생아 의료비 지원",
        summary: "미숙아·선천성이상아 해당 시 지원",
        agency: "관할 보건소 모자보건실 또는 e보건소(온라인)",
      },
    ],
  },
  {
    number: "3",
    title: "공공요금 감면",
    timing: "출생신고 완료 후",
    items: [
      {
        title: "전기요금 감면",
        summary: "월 전기세 30% 할인 (최대 16,000원, 3년간)",
        agency: "한국전력공사 (국번없이 123, 한전ON 홈페이지) 또는 행정복지센터",
      },
      {
        title: "도시가스 요금 경감 (해당 가구만)",
        summary: "출산만으로는 대상이 아니며, 자녀 3명 이상 다자녀가구·수급자·차상위 등에 해당하면 경감 (동절기 월 18,000원부터, 자격별 상이)",
        agency: "관할 도시가스 공급업체 고객센터 또는 행복출산 원스톱 서비스",
      },
    ],
  },
  {
    number: "4",
    title: "회사 제출 서류 & 출산휴가",
    timing: "회사에 확인",
    items: [
      {
        title: "배우자 출산휴가",
        summary: "유급 20일 (출생일부터 120일 이내 사용)",
        agency: "소속 회사 (인사팀/HR) · 고용24 공식 안내",
      },
      {
        title: "사내 제출 서류",
        summary: "가족수당 신청 및 경조금·건강보험 등록용",
        agency: "소속 회사 (인사팀/HR)",
        documents: "주민등록등본(출생신고 후 발급), 출생증명서 사본",
      },
    ],
  },
];
