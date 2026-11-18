// Top 30 city pages by 행정안전부 주민등록인구, chosen from the 48 /city pages
// already on this site. Ranking follows 2026 resident-registration population
// of basic local governments (수원·용인·고양·화성·창원 등이 전국 상위).
// Cities not in this list keep their existing title, description, and layout.
export const FEATURED_CITY_IDS = [
  "gyeonggi-suwon",      // 수원시
  "gyeonggi-yongin",     // 용인시
  "gyeonggi-goyang",     // 고양시
  "gyeonggi-hwaseong",   // 화성시
  "gyeongnam-changwon",  // 창원시
  "gyeonggi-seongnam",   // 성남시
  "chungbuk-cheongju",   // 청주시
  "gyeonggi-bucheon",    // 부천시
  "gyeonggi-namyangju",  // 남양주시
  "chungnam-cheonan",    // 천안시
  "seoul-songpa",        // 서울 송파구
  "jeonbuk-jeonju",      // 전주시
  "gyeonggi-ansan",      // 안산시
  "gyeonggi-pyeongtaek", // 평택시
  "seoul-gangseo",       // 서울 강서구
  "seoul-gangnam",       // 서울 강남구
  "gyeonggi-anyang",     // 안양시
  "daegu-dalseo",        // 대구 달서구
  "gyeongnam-gimhae",    // 김해시
  "seoul-nowon",         // 서울 노원구
  "gyeongbuk-pohang",    // 포항시
  "daegu-buk",           // 대구 북구
  "daegu-suseong",       // 대구 수성구
  "gyeongbuk-gumi",      // 구미시
  "seoul-seochogu",      // 서울 서초구
  "busan-haeundae",      // 부산 해운대구
  "seoul-mapo",          // 서울 마포구
  "gangwon-wonju",       // 원주시
  "busan-busanjin",      // 부산 부산진구
  "gyeongnam-yangsan",   // 양산시
] as const;

export const isFeaturedCity = (id: string) =>
  (FEATURED_CITY_IDS as readonly string[]).includes(id);
