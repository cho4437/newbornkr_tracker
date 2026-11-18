import {
  ALL_BENEFIT_TYPES, BENEFITS, CITIES, REGIONS,
  type Benefit, type BenefitType, type City, type Region,
} from "../data/benefits";
import { EN_BENEFITS, EN_BENEFIT_TYPES, EN_CITIES, EN_REGIONS } from "../data/benefits.en";
import { GUIDES, type Guide } from "../data/guides";
import { EN_GUIDES } from "../data/guides.en";
import { PT_GUIDES } from "../data/guides.pt";

export { ALL_BENEFIT_TYPES, BENEFITS, CITIES, REGIONS, GUIDES };
export type { Benefit, BenefitType, City, Region, Guide };
export type Lang = "ko" | "en" | "pt";

export const ORIGIN = "https://newbornkr.online";
/** Name of the installed (home-screen) tracker app: manifest name/short_name + iOS title. Same in every language. */
export const APP_NAME = "baby baby";
// Optional analytics (set at build time; empty = disabled)
export const GA_ID: string = import.meta.env.PUBLIC_GA_ID || "";
export const CF_BEACON: string = import.meta.env.PUBLIC_CF_BEACON_TOKEN || "";
export const SITE_NAME = { ko: "출산·육아 지원금 안내", en: "Birth & Childcare Support Guide", pt: "Guia de Apoio ao Bebê na Coreia" } as const;
/** URL prefix + hreflang per language. pt = Brazilian Portuguese under /pt-br. */
export const LANG_PREFIX: Record<Lang, string> = { ko: "", en: "/en", pt: "/pt-br" };
export const HREFLANG: Record<Lang, string> = { ko: "ko", en: "en", pt: "pt-BR" };
export const HTML_LANG: Record<Lang, string> = { ko: "ko", en: "en", pt: "pt-BR" };
export const LANG_LABEL: Record<Lang, string> = { ko: "한국어", en: "English", pt: "Português" };
/** Language-neutral paths that also exist in Brazilian Portuguese. Every other page links to its English version from /pt-br. */
export const PT_PATHS = new Set(["/", "/tracker", "/tracker/app", "/growth", "/guide/parent-allowance-deadline", "/guide/parent-and-child-allowance", "/guide/birth-registration-checklist", "/guide/foreign-parents"]);
export const hasPt = (p: string) => PT_PATHS.has(p);
/** Pick the string for a language (pt falls back to en when omitted). */
export const tx = (lang: Lang, ko: string, en: string, pt?: string) => (lang === "ko" ? ko : lang === "pt" ? pt ?? en : en);

/** Korean path -> localized path (mirrors useLocale.localPath in the app). */
export const lp = (p: string, lang: Lang): string => {
  if (lang === "pt" && !PT_PATHS.has(p)) lang = "en"; // no Portuguese version: use the English page
  return lang === "ko" ? p : `${LANG_PREFIX[lang]}${p === "/" ? "" : p}`;
};

export const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  출산장려금: { icon: "gift", color: "#1d4ed8", bg: "#dbeafe" },
  육아수당: { icon: "dollar-sign", color: "#15803d", bg: "#dcfce7" },
  "의료비 지원": { icon: "heart", color: "#be123c", bg: "#ffe4e6" },
  "보육 지원": { icon: "home", color: "#b45309", bg: "#fef3c7" },
  "주거 지원": { icon: "map-pin", color: "#7e22ce", bg: "#f3e8ff" },
  "기타 지원": { icon: "info", color: "#64748b", bg: "#f1f5f9" },
};
export const typeCfg = (t: string) => TYPE_CONFIG[t] ?? TYPE_CONFIG["기타 지원"];

export function displayBenefit(b: Benefit, lang: Lang): Benefit {
  if (lang === "ko") return b;
  const t = EN_BENEFITS[b.id]; // pt pages show benefit details in English (benefit pages are not translated to Portuguese)
  if (!t) throw new Error(`Missing English benefit: ${b.id}`);
  return { ...b, ...t };
}
export const regionName = (r: Region, lang: Lang) => (lang !== "ko" ? EN_REGIONS[r.id] : r.name);
export const cityName = (c: City, lang: Lang) => (lang !== "ko" ? EN_CITIES[c.id] : c.name);
export const typeLabel = (t: string, lang: Lang) => (lang !== "ko" ? EN_BENEFIT_TYPES[t] : t);
export function displayGuide(g: Guide, lang: Lang): Guide {
  if (lang === "ko") return g;
  const t = (lang === "pt" && PT_GUIDES[g.slug]) || EN_GUIDES[g.slug];
  if (!t) throw new Error(`Missing English guide: ${g.slug}`);
  return t;
}
export const fmtDate = (d: string | undefined, lang: Lang) =>
  !d ? "" : lang !== "ko"
    ? new Date(`${d}T00:00:00Z`).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
    : d;

export const getRegion = (id: string) => REGIONS.find((r) => r.id === id);
export const getCity = (id: string) => CITIES.find((c) => c.id === id);
export const benefitsByRegion = (id: string) => BENEFITS.filter((b) => b.regionId === id && !b.cityId);
export const benefitsByCity = (id: string) => BENEFITS.filter((b) => b.cityId === id);
export const citiesByProvince = (id: string) => CITIES.filter((c) => c.provinceId === id);

export function guidesFor(opts: { regionId?: string; cityId?: string; benefitId?: string; all?: boolean }) {
  const { regionId, cityId, benefitId, all } = opts;
  return GUIDES.filter((g) =>
    all || (cityId ? g.cityId === cityId : benefitId ? g.relatedBenefitIds.includes(benefitId) : g.regionId === regionId && !g.cityId));
}

/** Status line shown on benefit cards (BenefitCard.tsx). */
export function cardStatus(b: Benefit, lang: Lang) {
  const d = fmtDate(b.verifiedAt, lang);
  return b.verifiedAt
    ? tx(lang, `공식 자료 확인 ${d} · 본인 조건 확인 필요`, `Official information checked ${d} · Confirm your eligibility`, `Informação oficial conferida em ${d} · Confirme se você se enquadra`)
    : tx(lang, "최신 공식 조건 미확인", "Current official terms not verified", "Condições oficiais atuais não conferidas");
}

/** Compact record used by client-side search & saved-benefits pages. */
export function cardRecord(b: Benefit, lang: Lang) {
  const d = displayBenefit(b, lang);
  return {
    id: b.id, type: b.type, tl: typeLabel(b.type, lang), t: d.title, a: d.amount, d: d.description,
    e: d.eligibility, s: cardStatus(b, lang), h: lp(`/benefit/${b.id}`, lang),
  };
}
