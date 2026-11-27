// Client rendering contract mirrors the shared ingredient-card.hbs partial.
window.KbUI = (() => {
  const escape = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const icon = (name) =>
    `<svg class="kb-icon" width="20" height="20" aria-hidden="true"><use href="/img/wellness-icons.svg#${name}"></use></svg>`;
  const asset = (value) => {
    try {
      const url = new URL(value, location.origin);
      return ["https:", "http:"].includes(url.protocol) ? escape(url.href) : "";
    } catch {
      return "";
    }
  };
  function ingredient(item, locale = document.documentElement.lang) {
    const th = locale === "th",
      name = th ? item.nameTh : item.nameEn,
      description = th ? item.shortDescriptionTh : item.shortDescriptionEn;
    const category = item.category?.[th ? "nameTh" : "nameEn"];
    const tags = (item.wellnessLinks || [])
      .slice(0, 2)
      .map(
        (link) =>
          `<span class="kb-tag">${escape(link.wellnessTopic[th ? "nameTh" : "nameEn"])}</span>`,
      )
      .join("");
    return `<a class="kb-card" href="/${locale}/ingredients/${encodeURIComponent(item.slug)}/" data-id="${escape(item.id)}" data-slug="${escape(item.slug)}"><div class="kb-card-image">${item.featuredImageUrl ? `<img src="${asset(item.featuredImageUrl)}" alt="${escape(name)}" loading="lazy" decoding="async" width="400" height="300">` : icon("leaf")}</div><div class="kb-card-body">${category ? `<span class="kb-card-category">${escape(category)}</span>` : ""}<h3 class="kb-card-title-th">${escape(name)}</h3>${th && item.nameEn ? `<span class="kb-card-title-en" lang="en">${escape(item.nameEn)}</span>` : ""}${description ? `<p class="kb-card-description">${escape(description)}</p>` : ""}${tags ? `<div class="kb-card-wellness">${tags}</div>` : ""}<span class="kb-card-cta">${th ? "เรียนรู้เพิ่มเติม" : "Learn more"}${icon("arrow")}</span></div></a>`;
  }
  return { escape, icon, ingredient };
})();
