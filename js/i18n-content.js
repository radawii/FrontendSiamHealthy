/*
 * Full-content English translation for the public site.
 *
 * The page is split into "units": the outermost element that contains Thai text and only
 * inline markup (no block elements, no images or form controls). A unit is looked up by its
 * normalised text and its inner HTML is replaced with the stored English HTML, so inline
 * links / bold text keep working. Text outside units (e.g. next to an image) is translated
 * per text node, and a few attributes are translated too. Images are never altered.
 *
 * The same walk is used by the extraction script, so keys always match.
 * Dictionaries: /i18n/en/_common.json + /i18n/en/<page key>.json  ({ "<thai text>": "<english html>" })
 */
(function (root) {
  "use strict";
  const THAI = /[฀-๿]/;
  const BLOCK = new Set(
    "ADDRESS ARTICLE ASIDE BLOCKQUOTE BODY BUTTON CAPTION DD DETAILS DIALOG DIV DL DT FIELDSET FIGCAPTION FIGURE FOOTER FORM H1 H2 H3 H4 H5 H6 HEADER HR LABEL LI MAIN NAV OL OPTION P PRE SECTION SUMMARY TABLE TBODY TD TFOOT TH THEAD TR UL".split(" "),
  );
  const MEDIA = "img,svg,picture,video,audio,iframe,canvas,input,select,textarea,object,embed";
  const SKIP = "script,style,noscript,template,code,textarea,my-header,[data-no-translate],[translate=no]";
  const ATTRS = ["placeholder", "title", "alt", "aria-label"];

  const norm = (text) => String(text || "").replace(/\s+/g, " ").trim();
  const hasThai = (text) => THAI.test(text || "");

  function isUnit(el) {
    if (!hasThai(el.textContent)) return false;
    if (el.querySelector(MEDIA)) return false;
    for (const d of el.querySelectorAll("*")) if (BLOCK.has(d.tagName)) return false;
    return true;
  }

  /** Visit every translatable piece under `start`. */
  function walk(start, visit) {
    const doc = start.ownerDocument || start;
    const rootEl = start.nodeType === 9 ? start.documentElement : start;
    (function visitNode(node) {
      if (node.nodeType === 3) {
        if (hasThai(node.nodeValue)) visit({ kind: "text", node, key: norm(node.nodeValue) });
        return;
      }
      if (node.nodeType !== 1 || node.matches(SKIP)) return;
      for (const attr of ATTRS) {
        const value = node.getAttribute(attr);
        if (value && hasThai(value)) visit({ kind: "attr", node, attr, key: norm(value) });
      }
      if (node.tagName === "META") {
        const value = node.getAttribute("content");
        if (value && hasThai(value)) visit({ kind: "attr", node, attr: "content", key: norm(value) });
        return;
      }
      if (node.tagName === "TITLE") {
        if (hasThai(node.textContent)) visit({ kind: "title", node, key: norm(node.textContent) });
        return;
      }
      if (node.tagName !== "HTML" && node.tagName !== "HEAD" && node !== doc.body && isUnit(node)) {
        visit({ kind: "unit", node, key: norm(node.textContent), html: norm(node.innerHTML) });
        return;
      }
      for (const child of [...node.childNodes]) visitNode(child);
    })(rootEl);
  }

  function collect(start) {
    const out = [];
    walk(start, (item) => out.push({ kind: item.kind, key: item.key, html: item.html || item.key }));
    return out;
  }

  /** Replace Thai with English wherever the dictionary has the text. Returns keys it could not find. */
  /** `record` (optional) receives { node, kind, attr, old } before each change, so it can be undone. */
  function apply(start, dict, fallback, record) {
    const missing = [];
    walk(start, (item) => {
      let en = dict[item.key];
      if (en === undefined && fallback && item.kind !== "unit") {
        const alt = fallback(item.key);
        if (alt !== item.key) en = alt;
      }
      if (en === undefined) {
        missing.push(item.key);
        return;
      }
      if (record) {
        const prev =
          item.kind === "unit" ? item.node.innerHTML
          : item.kind === "text" ? item.node.nodeValue
          : item.kind === "title" ? item.node.textContent
          : item.node.getAttribute(item.attr);
        record({ node: item.node, kind: item.kind, attr: item.attr, old: prev });
      }
      if (item.kind === "unit") item.node.innerHTML = en;
      else if (item.kind === "text") {
        const raw = item.node.nodeValue;
        item.node.nodeValue = raw.match(/^\s*/)[0] + en.replace(/<[^>]+>/g, "") + raw.match(/\s*$/)[0];
      } else if (item.kind === "title") item.node.textContent = en.replace(/<[^>]+>/g, "");
      else item.node.setAttribute(item.attr, en.replace(/<[^>]+>/g, ""));
    });
    return missing;
  }

  function pageKey(pathname) {
    // "/" -> index, "/about/" and "/about/index.html" -> about/index, "/shop/onix(.html)" -> shop/onix
    let p = (pathname || "/").replace(/^\/+/, "");
    if (!p || p.endsWith("/")) p += "index.html";
    return p.replace(/\.html$/, "").replace(/[^a-z0-9/_-]/gi, "_");
  }

  /** Put back everything a recorded apply() changed (newest first). */
  function undo(records) {
    for (let i = records.length - 1; i >= 0; i--) {
      const r = records[i];
      if (r.kind === "unit") r.node.innerHTML = r.old;
      else if (r.kind === "text") r.node.nodeValue = r.old;
      else if (r.kind === "title") r.node.textContent = r.old;
      else r.node.setAttribute(r.attr, r.old);
    }
    records.length = 0;
  }

  const api = { collect, apply, undo, pageKey, norm, hasThai };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.SiamContentI18n = api;
})(typeof window !== "undefined" ? window : globalThis);
