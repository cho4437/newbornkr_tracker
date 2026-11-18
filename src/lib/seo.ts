// SEO helpers: Naver Search Advisor recommends titles <= 40 chars and descriptions <= 80 chars.
import { ORIGIN, lp, type Lang } from "./site";

export const TITLE_MAX = 40;
export const DESC_MAX = 80;

export const KO_SHORT: Record<string, string> = {
  national: "전국", seoul: "서울", busan: "부산", daegu: "대구", incheon: "인천", gwangju: "광주", daejeon: "대전",
  ulsan: "울산", sejong: "세종", gyeonggi: "경기", gangwon: "강원", chungbuk: "충북", chungnam: "충남",
  jeonbuk: "전북", jeonnam: "전남", gyeongbuk: "경북", gyeongnam: "경남", jeju: "제주",
};

/** First candidate that fits the limit; otherwise the shortest one. */
export function fit(cands: string[], max = TITLE_MAX): string {
  const c = cands.map((s) => s.replace(/\s+/g, " ").trim());
  return c.find((s) => s.length <= max) ?? c.reduce((a, b) => (b.length < a.length ? b : a));
}

/** Clip to max chars at a word boundary, adding an ellipsis when cut. */
export function clip(s: string, max = DESC_MAX): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  // Prefer ending on a whole sentence when one fits and is long enough to be useful.
  const sent = [...t.slice(0, max).matchAll(/(?:다\.|요\.|[.!?。])(?=\s|$)/g)].pop();
  if (sent && sent.index! + sent[0].length >= max * 0.5) return t.slice(0, sent.index! + sent[0].length);
  const cut = t.slice(0, max - 1);
  const sp = cut.lastIndexOf(" ");
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,·:;(—-]+$/, "") + "…";
}

/** Title safety net: drop the " | site name" suffix when the full title is too long. */
export function shortTitle(t: string): string {
  if (t.length <= TITLE_MAX) return t;
  const i = t.lastIndexOf(" | ");
  return i > 0 ? t.slice(0, i) : t;
}

export interface Crumb { name: string; path: string }
export function breadcrumbLd(items: Crumb[], lang: Lang) {
  return {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: ORIGIN + lp(c.path, lang) })),
  };
}
export const homeCrumb = (lang: Lang): Crumb => ({ name: lang === "en" ? "Home" : lang === "pt" ? "Início" : "홈", path: "/" });

/** Default share images (1200x630). */
export const ogImageFor = (kind: "default" | "region" | "benefit" | "tracker" | "guide", lang: Lang) =>
  `${ORIGIN}/og/${kind}-${lang === "ko" ? "ko" : "en"}.jpg`; // pt uses the English cards

export { stripEditNotes } from "./editnotes";

/** English search titles (<= 40 chars) for pages whose full English name is too long. Page headings keep the full name. */
export const EN_SEO_TITLES: Record<string, string> = {
  "/guide/foreign-parents": "Benefits for Foreign Parents in Korea",
  "/guide/seoul": "Seoul Birth Grant & Postpartum Care",
  "/guide/gyeonggi-suwon": "Suwon Birth Grant & Postpartum Care",
  "/guide/parent-allowance-deadline": "Parent Allowance Deadline Calculator",
  "/guide/parent-and-child-allowance": "Parent & Child Allowance: Both at Once?",
  "/guide/birth-registration-checklist": "Birth Registration Benefits Checklist",
  "/benefit/nat-005": "Pregnancy & Childbirth Medical Voucher",
  "/benefit/busan-003": "Busan High-Risk Pregnancy Medical Aid",
  "/benefit/busan-busanjin-002": "Busanjin-gu Mother & Newborn Health Care",
  "/benefit/busan-yeonje-002": "Yeonje-gu Public Childcare Expansion",
  "/benefit/chungbuk-cheongju-002": "Cheongju Public Childcare Centers",
  "/benefit/chungbuk-cheongju-003": "Cheongju Pregnancy Medical Cost Aid",
  "/benefit/chungbuk-chungju-002": "Chungju Rural Homes for Newborn Families",
  "/benefit/chungnam-001": "South Chungcheong Birth Grants",
  "/benefit/chungnam-002": "South Chungcheong Infertility Support",
  "/benefit/chungnam-cheonan-002": "Cheonan Public Childcare Expansion",
  "/benefit/daegu-002": "Daegu Eco-Friendly Food for Moms-to-Be",
  "/benefit/daegu-buk-001": "Daegu Birth Celebration Grant (Buk-gu)",
  "/benefit/daegu-suseong-001": "Daegu Birth Celebration Grant (Suseong)",
  "/benefit/daegu-suseong-002": "Suseong-gu Child Learning Support",
  "/benefit/gangwon-002": "Gangwon Rural Returnee Housing Support",
  "/benefit/gangwon-wonju-002": "Wonju Birth & Child Medical Cost Aid",
  "/benefit/gyeongbuk-001": "North Gyeongsang Birth Grants",
  "/benefit/gyeongbuk-002": "North Gyeongsang Youth Rural Homes",
  "/benefit/gyeongbuk-gyeongju-002": "Gyeongju Heritage Family Experience",
  "/benefit/gyeongbuk-pohang-002": "Pohang Birth & Child Medical Cost Aid",
  "/benefit/gyeonggi-001": "Gyeonggi Postpartum Care Support",
  "/benefit/gyeonggi-002": "Gyeonggi Child-Care Service Co-pay Aid",
  "/benefit/gyeonggi-003": "Gyeonggi Third-Child Birth Grants",
  "/benefit/gyeonggi-ansan-002": "Ansan Multicultural Family Child Support",
  "/benefit/gyeonggi-ansan-003": "Ansan Rental Housing for Newlyweds",
  "/benefit/gyeonggi-anyang-002": "Anyang Public Postpartum Center Fee Aid",
  "/benefit/gyeonggi-anyang-003": "Anyang Pregnancy Medical Cost Aid",
  "/benefit/gyeonggi-bucheon-002": "Bucheon Comics & Webtoon Family Culture",
  "/benefit/gyeonggi-goyang-002": "Goyang Newlywed & Newborn Rental Homes",
  "/benefit/gyeonggi-hwaseong-003": "Hwaseong Public Childcare Facilities",
  "/benefit/gyeonggi-namyangju-002": "Namyangju Large-Family Childcare Fee Aid",
  "/benefit/gyeonggi-pyeongtaek-003": "Pyeongtaek Extra Daycare Fee Support",
  "/benefit/gyeonggi-pyeongtaek-004": "Pyeongtaek Prenatal Checkup Cost Aid",
  "/benefit/gyeonggi-pyeongtaek-005": "Pyeongtaek Housing Priority for Newborns",
  "/benefit/gyeonggi-seongnam-003": "Seongnam Public Daycare Priority",
  "/benefit/gyeonggi-suwon-002": "Suwon Public Daycare Priority Access",
  "/benefit/gyeonggi-suwon-003": "Suwon Newlywed Jeonse Deposit Support",
  "/benefit/gyeongnam-001": "South Gyeongsang Birth Grants",
  "/benefit/gyeongnam-changwon-002": "Changwon Public Childcare Expansion",
  "/benefit/jeonbuk-001": "Jeonbuk Birth Grants",
  "/benefit/jeonbuk-jeonju-002": "Jeonju Hanok Village Family Culture",
  "/benefit/jeonnam-mokpo-002": "Mokpo Rental Homes for Newborn Families",
  "/benefit/jeonnam-suncheon-002": "Suncheon Bay Eco Family Experience",
  "/benefit/sejong-002": "Sejong Public Daycare Priority Access",
  "/benefit/seoul-003": "Seoul Housing for Newlyweds & Newborns",
  "/benefit/seoul-nowon-001": "Nowon-gu Multi-Child Birth Gift",
  "/benefit/seoul-nowon-003": "Nowon-gu Large-Family Culture Support",
  "/benefit/seoul-songpa-001": "Songpa-gu Birth Grant (ended 2022)",
};
