/* Client-side features: category filters, search. (Saved benefits were removed 2026-11; the old "@bookmarked_benefits" localStorage key is left untouched.) */
(function () {
  "use strict";
  var P = {
    gift: '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
    "dollar-sign": '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    "map-pin": '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    award: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
    "check-circle": '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    "chevron-right": '<polyline points="9 18 15 12 9 6"/>'
  };
  var T = {
    "출산장려금": ["gift", "#1d4ed8", "#dbeafe"], "육아수당": ["dollar-sign", "#15803d", "#dcfce7"],
    "의료비 지원": ["heart", "#be123c", "#ffe4e6"], "보육 지원": ["home", "#b45309", "#fef3c7"],
    "주거 지원": ["map-pin", "#7e22ce", "#f3e8ff"], "기타 지원": ["info", "#64748b", "#f1f5f9"]
  };
  function ic(n, s, c) { return '<svg class="ic" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="' + (c || "currentColor") + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[n] || P.info) + "</svg>"; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var lang = document.documentElement.lang === "en" ? "en" : "ko";

  function card(r) {
    var t = T[r.type] || T["기타 지원"];
    return '<article class="bcard" data-type="' + esc(r.type) + '"><div class="hd"><span class="tag" style="background:' + t[2] + ";color:" + t[1] + '">' + ic(t[0], 11, t[1]) + esc(r.tl) + "</span>" +
      "</div>" +
      '<h3 class="tt"><a href="' + esc(r.h) + '">' + esc(r.t) + "</a></h3>" +
      '<div class="amt">' + ic("award", 14) + "<span>" + esc(r.a) + "</span></div>" +
      '<p class="st">' + esc(r.s) + '</p><p class="ds">' + esc(r.d) + "</p>" +
      '<div class="ft"><div class="el">' + ic("check-circle", 12, "#10b981") + "<span>" + esc(r.e) + "</span></div>" + ic("chevron-right", 16, "#64748b") + "</div></article>";
  }


  document.addEventListener("click", function (e) {
    var f = e.target.closest && e.target.closest("[data-filter]");
    if (f) {
      var active = f.getAttribute("aria-pressed") === "true";
      document.querySelectorAll("[data-filter]").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      if (!active) f.setAttribute("aria-pressed", "true");
      var type = active ? null : f.getAttribute("data-filter"), shown = 0;
      document.querySelectorAll("main .bcard[data-type]").forEach(function (c) {
        var ok = !type || c.getAttribute("data-type") === type;
        c.hidden = !ok; if (ok) shown++;
      });
      document.querySelectorAll("[data-filter-empty]").forEach(function (x) { x.hidden = shown > 0; });
    }
  });

  var dataPromise;
  function data() {
    if (!dataPromise) dataPromise = fetch("/data/benefits." + lang + ".json").then(function (r) { return r.json(); });
    return dataPromise;
  }


  function initSearch() {
    var input = document.getElementById("q"); if (!input) return;
    var clear = document.getElementById("qclear"), filters = document.getElementById("sfilters");
    var intro = document.getElementById("sintro"), none = document.getElementById("snone");
    var count = document.getElementById("scount"), out = document.getElementById("sresults");
    var activeType = null, timer;
    function run() {
      var q = input.value.trim().toLocaleLowerCase();
      clear.hidden = !input.value; filters.hidden = !q;
      var url = new URL(location.href);
      if (q) url.searchParams.set("q", input.value.trim()); else url.searchParams.delete("q");
      history.replaceState(null, "", url.pathname + url.search);
      if (!q) { intro.hidden = false; none.hidden = true; count.hidden = true; out.innerHTML = ""; return; }
      data().then(function (all) {
        var res = all.filter(function (r) {
          return [r.t, r.a, r.d, r.e, r.tl].some(function (f) { return String(f).toLocaleLowerCase().indexOf(q) !== -1; });
        });
        if (activeType) res = res.filter(function (r) { return r.type === activeType; });
        intro.hidden = true; none.hidden = res.length > 0; count.hidden = res.length === 0;
        count.textContent = out.getAttribute("data-count-label").replace("{n}", res.length);
        out.innerHTML = res.map(card).join("");

      });
    }
    input.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(run, 120); });
    clear.addEventListener("click", function () { input.value = ""; run(); input.focus(); });
    document.querySelectorAll("[data-sugg]").forEach(function (b) { b.addEventListener("click", function () { input.value = b.getAttribute("data-sugg"); run(); }); });
    document.querySelectorAll("[data-sfilter]").forEach(function (b) {
      b.addEventListener("click", function () {
        var t = b.getAttribute("data-sfilter"), was = activeType === t;
        activeType = was ? null : t;
        document.querySelectorAll("[data-sfilter]").forEach(function (x) { x.setAttribute("aria-pressed", x === b && !was ? "true" : "false"); });
        run();
      });
    });
    var q0 = new URLSearchParams(location.search).get("q");
    if (q0) { input.value = q0; run(); }
  }

  function init() { initSearch(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
document.addEventListener("click", function (e) {
  var a = e.target.closest && e.target.closest(".home-split [data-path]");
  if (a && window.gtag) try { gtag("event", "home_path_click", { path: a.getAttribute("data-path") }); } catch (x) {}
});
