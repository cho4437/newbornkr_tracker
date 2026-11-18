// No imports: used by the data modules.
/** Remove editorial notes about what was changed in older records (internal, not useful to parents). */
export function stripEditNotes(text: string): string {
  if (!text) return text;
  let t = text
    .replace(/기존 기록의 '첫째 100만원…' 금액은 삭제했으며, /g, "")
    .replace(/을 안내하며, 기존 기록의 시 자체 출산장려금은 확인되지 않았습니다\./g, "을 안내합니다. 시 자체 출산장려금은 공식 자료에서 확인되지 않았습니다.")
    .replace(/The previously listed amounts were removed; grants/g, "Grants")
    .replace(/; the previously listed city grant could not be confirmed\./g, ". A separate city grant could not be confirmed.");
  // Korean: drop whole sentences that start with "기존 (혜택) 기록".
  t = t.replace(/\s*기존 (?:혜택 )?기록[^.]*?(?:습니다|니다|아닙니다)\.(?=\s|$)/g, "");
  // English: drop sentences mentioning the previously listed entry.
  t = t.replace(/\s*[^.]*\bpreviously listed\b[^.]*\.(?=\s|$)/g, "");
  return t.replace(/\s{2,}/g, " ").trim();
}
