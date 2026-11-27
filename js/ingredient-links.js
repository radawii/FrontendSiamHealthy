// Ascender Ingredient Knowledge Base — product page enhancement.
//
// Turns the ingredient names already shown on product pages into links to
// their ingredient page. The public API only returns ingredients that are
// compliance-approved AND published, so an ingredient without a live page
// simply stays plain text — no broken links are ever created.
(function () {
  if (window.__kbIngredientLinksLoaded) return;
  window.__kbIngredientLinksLoaded = true;

  const API_BASE_URL = window.location.origin;
  const INGREDIENT_BASE_PATH = '/th/ingredients/';
  const MAX_WAIT_MS = 8000;

  function normalize(text) {
    return String(text || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '');
  }

  function buildIndex(items) {
    const index = new Map();
    items.forEach(function (item) {
      const keys = [item.nameTh, item.nameEn, item.scientificName, ...(item.alternativeNames || [])].concat((item.synonyms || []).map((s) => s.term));
      keys.forEach(function (key) {
        const normalized = normalize(key);
        if (normalized && !index.has(normalized)) {
          index.set(normalized, item);
        }
      });
    });
    return index;
  }

  function enhance(index) {
    const headings = document.querySelectorAll('.ingredient-card h3');
    let linked = 0;

    headings.forEach(function (heading) {
      if (heading.querySelector('a.kb-ingredient-link')) return;

      const match = index.get(normalize(heading.textContent));
      if (!match) return;

      const name = heading.textContent.trim();
      const link = document.createElement('a');
      link.className = 'kb-ingredient-link';
      link.href = INGREDIENT_BASE_PATH + encodeURIComponent(match.slug) + '/';
      link.textContent = name;
      link.title = 'ดูข้อมูลส่วนผสม: ' + name;
      link.style.color = 'inherit';
      link.style.textDecoration = 'underline';
      link.style.textDecorationStyle = 'dotted';
      link.style.textUnderlineOffset = '3px';

      link.addEventListener('click', function () {
        if (typeof window.trackKbEvent === 'function') {
          window.trackKbEvent('product_to_ingredient_click', {
            ingredient_id: match.id,
            ingredient_slug: match.slug,
            locale: 'th',
          });
        } else if (typeof window.gtag === 'function') {
          window.gtag('event', 'product_to_ingredient_click', {
            ingredient_id: match.id,
            ingredient_slug: match.slug,
            locale: 'th',
          });
        }
      });

      heading.textContent = '';
      heading.appendChild(link);
      linked++;
    });

    return linked;
  }

  async function init() {
    let items = [];
    try {
      const res = await fetch(API_BASE_URL + '/ingredients?page=1&pageSize=60');
      if (!res.ok) return;
      const data = await res.json();
      items = data.items || [];
      for(let page=2;items.length < data.total;page++) { const next=await fetch(API_BASE_URL+'/ingredients?page='+page+'&pageSize=60'); if(!next.ok)break; const batch=await next.json(); if(!batch.items?.length)break; items.push(...batch.items); }
    } catch (e) {
      return; // API unavailable — product pages keep working unchanged
    }

    if (items.length === 0) return;
    const index = buildIndex(items);

    enhance(index);

    // Product cards can be rendered asynchronously by product-template.js,
    // so keep watching for a while and enhance new cards as they appear.
    const container = document.getElementById('ingredientGrid') || document.body;
    const observer = new MutationObserver(function () {
      enhance(index);
    });
    observer.observe(container, { childList: true, subtree: true });
    setTimeout(function () {
      observer.disconnect();
    }, MAX_WAIT_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
