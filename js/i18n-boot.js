/*
 * Runs first in <head> (tiny, synchronous) so switching to English never flashes Thai:
 *  - decides the language before the first paint and keeps the page invisible until the
 *    English text is in place (js/site-i18n.js reveals it; a 3 s safety timer always does);
 *  - starts downloading the translation helper and dictionaries immediately, in parallel;
 *  - keeps dictionaries in sessionStorage, and pre-fetches them when the visitor points at the
 *    EN switch, so the next page shows English instantly.
 * Bump VERSION whenever the files in /i18n/en/ change.
 */
(function () {
  "use strict";
  var VERSION = "2026-11-27a";
  var doc = document.documentElement;
  // Knowledge-base pages are generated per language and need none of this.
  if (/^\/(th|en)\/(ingredients|wellness)(\/|$)/.test(location.pathname)) return;

  function pageKey(pathname) {
    var p = (pathname || "/").replace(/^\/+/, "");
    if (!p || p.charAt(p.length - 1) === "/") p += "index.html";
    return p.replace(/\.html$/, "").replace(/[^a-z0-9/_-]/gi, "_").replace(/\//g, "__");
  }
  function getDict(url) {
    var key = "cw-i18n:" + VERSION + ":" + url;
    try {
      var cached = sessionStorage.getItem(key);
      if (cached) return Promise.resolve(JSON.parse(cached));
    } catch (e) {}
    return fetch(url)
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; })
      .then(function (json) {
        try { sessionStorage.setItem(key, JSON.stringify(json)); } catch (e) {}
        return json;
      });
  }
  function loadHelper() {
    if (window.SiamContentI18n) return Promise.resolve();
    if (window.__cwI18nHelper) return window.__cwI18nHelper;
    window.__cwI18nHelper = new Promise(function (resolve) {
      var s = document.createElement("script");
      s.src = "/js/i18n-content.js";
      s.onload = s.onerror = function () { resolve(); };
      (document.head || doc).appendChild(s);
    });
    return window.__cwI18nHelper;
  }
  function preload() {
    if (window.__cwI18n) return window.__cwI18n;
    window.__cwI18n = {
      helper: loadHelper(),
      dicts: Promise.all([getDict("/i18n/en/_common.json"), getDict("/i18n/en/" + pageKey(location.pathname) + ".json")]),
    };
    return window.__cwI18n;
  }
  // site-i18n.js calls this when the visitor switches to English on a Thai page.
  window.__cwI18nPreload = preload;

  var lang = new URLSearchParams(location.search).get("lang");
  if (!lang) {
    try { lang = localStorage.getItem("siam_locale"); } catch (e) {}
  }

  if (lang === "en") {
    doc.lang = "en";
    doc.classList.add("cw-i18n-pending");
    var style = document.createElement("style");
    style.textContent =
      "html.cw-i18n-pending body{opacity:0!important}" +
      "html.cw-i18n-ready body{transition:opacity .18s ease-out}";
    (document.head || doc).appendChild(style);
    window.__cwI18n = preload();
    // site-i18n.js is added later by the header; start downloading it now.
    var hint = document.createElement("link");
    hint.rel = "preload";
    hint.as = "script";
    hint.href = "/js/site-i18n.js";
    (document.head || doc).appendChild(hint);
    window.__cwI18nReveal = function () {
      doc.classList.add("cw-i18n-ready");
      doc.classList.remove("cw-i18n-pending");
    };
    setTimeout(window.__cwI18nReveal, 3000);
  } else {
    // Warm the English files when the visitor reaches for the EN switch.
    var warmed = false;
    var warm = function (e) {
      if (warmed || !e.target || !e.target.closest || !e.target.closest('[data-locale="en"]')) return;
      warmed = true;
      preload();
    };
    document.addEventListener("pointerover", warm, { passive: true });
    document.addEventListener("touchstart", warm, { passive: true });
    document.addEventListener("focusin", warm);
  }
})();
