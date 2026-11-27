(() => {
  const script = document.currentScript;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function () {
      window.dataLayer.push(arguments);
    };
  const measurement = script?.dataset.ga4Id;
  if (measurement) {
    window.gtag("js", new Date());
    window.gtag("config", measurement);
  }
  document.addEventListener("DOMContentLoaded", () => {
    const body = document.body,
      locale = document.documentElement.lang,
      th = locale === "th";
    const track = (event, data) =>
      window.trackKbEvent?.(event, { ...data, locale });
    if (body.dataset.kbKind === "ingredient")
      track("ingredient_page_view", {
        ingredient_id: body.dataset.ingredientId,
        ingredient_slug: body.dataset.ingredientSlug,
      });
    const toc = document.querySelector(".kb-toc-panel"),
      mobile = matchMedia("(max-width:767px)");
    const setToc = () => {
      if (toc) toc.open = !mobile.matches;
    };
    mobile.addEventListener("change", setToc);
    setToc();
    const links = [...document.querySelectorAll(".kb-toc-list a")],
      sections = links
        .map((link) => document.getElementById(link.hash.slice(1)))
        .filter(Boolean);
    let queued = false,
      layoutDirty = true,
      positions = [],
      activeLink = null,
      headerOffset = 96;
    function scrollspy() {
      queued = false;
      if (!sections.length) return;
      // Measure only after content or viewport changes, never on each scroll.
      if (layoutDirty) {
        const scrollY = window.scrollY;
        positions = sections
          .map((section) => ({
            top: section.getBoundingClientRect().top + scrollY,
            link: links.find((link) => link.hash === "#" + section.id),
          }))
          .sort((a, b) => a.top - b.top);
        const header = document.querySelector(".main-header");
        headerOffset = (header?.getBoundingClientRect().height || 72) + 24;
        layoutDirty = false;
      }
      const target = window.scrollY + headerOffset;
      let start = 0,
        end = positions.length - 1;
      while (start < end) {
        const middle = Math.ceil((start + end) / 2);
        if (positions[middle].top <= target) start = middle;
        else end = middle - 1;
      }
      const next = positions[start].link;
      if (next === activeLink) return;
      activeLink?.removeAttribute("aria-current");
      next.setAttribute("aria-current", "location");
      activeLink = next;
    }
    function scheduleScrollspy(remeasure = false) {
      layoutDirty ||= remeasure;
      if (queued) return;
      queued = true;
      requestAnimationFrame(scrollspy);
    }
    if (sections.length) {
      document.addEventListener("scroll", () => scheduleScrollspy(), {
        passive: true,
      });
      window.addEventListener("resize", () => scheduleScrollspy(true), {
        passive: true,
      });
      window.addEventListener("pageshow", () => scheduleScrollspy(true));
      toc?.addEventListener("toggle", () => scheduleScrollspy(true));
      if ("ResizeObserver" in window) {
        const observer = new ResizeObserver(() => scheduleScrollspy(true));
        const content = document.querySelector(".kb-main article");
        const header = document.querySelector(".main-header");
        if (content) observer.observe(content);
        if (header) observer.observe(header);
      }
      document.fonts?.ready.then(() => scheduleScrollspy(true));
      scrollspy();
    }
    links.forEach((link) =>
      link.addEventListener("click", (event) => {
        const section = document.getElementById(link.hash.slice(1));
        if (!section) return;
        event.preventDefault();
        if (mobile.matches) toc.open = false;
        section.scrollIntoView({
          behavior: matchMedia("(prefers-reduced-motion:reduce)").matches
            ? "auto"
            : "smooth",
          block: "start",
        });
        history.replaceState(
          null,
          "",
          location.pathname + location.search + link.hash,
        );
        section.tabIndex = -1;
        section.focus({ preventScroll: true });
      }),
    );
    let toastTimer;
    function toast(text) {
      const node = document.getElementById("kbToast");
      if (!node) return;
      node.textContent = text;
      node.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        node.hidden = true;
      }, 4000);
    }
    document.addEventListener("click", async (event) => {
      const product = event.target.closest(".kb-product-link");
      if (product)
        track("ingredient_to_product_click", {
          ingredient_id: body.dataset.ingredientId,
          ingredient_slug: body.dataset.ingredientSlug,
          product_id: product.dataset.productId,
        });
      const topic = event.target.closest(".kb-topic-card[data-slug]");
      if (topic)
        track("wellness_category_selected", {
          wellness_slug: topic.dataset.slug,
          source: "wellness_hub",
        });
      const add = event.target.closest("[data-add-product]");
      if (!add) return;
      add.disabled = true;
      try {
        const response = await fetch(
          "/products/" + encodeURIComponent(add.dataset.addProduct),
        );
        if (!response.ok) throw new Error("Unavailable");
        const product = await response.json();
        const price = Number(
          product.price ??
            String(product.newPrice || "").replace(/[^0-9.]/g, ""),
        );
        if (
          !product.id ||
          !Number.isFinite(price) ||
          price <= 0 ||
          product.isActive === false ||
          product.stock === null ||
          product.stock === undefined ||
          Number(product.stock) <= 0
        )
          throw new Error("Unavailable");
        const cart = JSON.parse(
          localStorage.getItem("siam_healthy_cart") || "[]",
        );
        if (!Array.isArray(cart)) throw new Error("Invalid cart");
        const existing = cart.find(
          (item) => String(item.id) === String(product.id),
        );
        if (existing) {
          if (existing.quantity >= Number(product.stock))
            throw new Error("Unavailable");
          existing.quantity += 1;
        } else
          cart.push({
            id: product.id,
            name: product.name,
            price,
            oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
            image: product.images?.[0] || product.imageUrl || "",
            tag: "",
            quantity: 1,
            selected: true,
          });
        localStorage.setItem("siam_healthy_cart", JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        toast(th ? "เพิ่มลงตะกร้าแล้ว" : "Added to bag");
      } catch {
        toast(
          th
            ? "ไม่สามารถเพิ่มสินค้าได้ กรุณาตรวจสอบรายละเอียดผลิตภัณฑ์"
            : "Unable to add. Please check the product details.",
        );
      } finally {
        add.disabled = false;
      }
    });
    // Keep failed assets readable without browser broken-image indicators.
    document.addEventListener(
      "error",
      (event) => {
        const image = event.target;
        if (!(image instanceof HTMLImageElement) || !image.closest(".kb-main"))
          return;
        image.hidden = true;
        const fallback = document.createElement("span");
        fallback.className = "kb-image-unavailable";
        fallback.textContent = image.alt;
        image.after(fallback);
      },
      true,
    );
  });
})();
