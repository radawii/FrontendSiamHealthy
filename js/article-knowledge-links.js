(async function () {
  const slug = location.pathname.split('/').pop().replace(/\.html$/, '');
  try {
    const response = await fetch('/ingredients/article/' + encodeURIComponent(slug));
    if (!response.ok) return;
    const ingredients = await response.json();
    if (!ingredients.length) return;
    const section = document.createElement('section');
    section.style.cssText = 'max-width:960px;margin:40px auto;padding:24px;background:#eef5ef;border-radius:20px';
    const title = document.createElement('h2'); title.textContent = 'ส่วนผสมและผลิตภัณฑ์ที่เกี่ยวข้อง'; section.append(title);
    const products = new Map();
    const add = (name, href) => { const link = document.createElement('a'); link.textContent = name; link.href = href; link.style.cssText='display:inline-block;margin:12px 16px 0 0;color:#0d5c2e'; section.append(link); };
    ingredients.forEach(i => {
      add(i.nameTh, '/th/ingredients/' + encodeURIComponent(i.slug) + '/');
      (i.productLinks || []).forEach(p => products.set(String(p.product.id), p.product));
    });
    products.forEach(p => add(p.name, '/shop/product.html?id=' + encodeURIComponent(p.id)));
    (document.querySelector('main') || document.querySelector('article') || document.body).append(section);
  } catch { /* The article remains readable when the knowledge API is unavailable. */ }
})();
