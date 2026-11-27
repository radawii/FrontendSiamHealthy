(() => {
  const byId = (id) => document.getElementById(id),
    grid = byId("kbGrid");
  if (!grid) return;
  const locale = document.documentElement.lang === "en" ? "en" : "th",
    th = locale === "th";
  const search = byId("kbSearchInput"),
    category = byId("kbCategoryFilter"),
    wellness = byId("kbWellnessFilter"),
    sort = byId("kbSort"),
    autocomplete = byId("kbAutocomplete"),
    more = byId("kbLoadMore"),
    clear = byId("kbClearFilters"),
    chips = byId("kbActiveFilters"),
    loading = byId("kbLoadingState"),
    empty = byId("kbEmptyState"),
    popular = byId("kbPopularGrid");
  const state = { q: "", category: "", wellness: "", letter: "", sort: "asc" },
    size = 24;
  let page = 1,
    items = [],
    resultVersion = 0,
    acVersion = 0,
    resultController,
    acController,
    timer,
    acItems = [],
    acIndex = -1;
  function track(name, params) {
    window.trackKbEvent?.(name, { ...params, locale });
  }
  function readURL() {
    const params = new URLSearchParams(location.search);
    for (const key of Object.keys(state))
      state[key] = params.get(key) || (key === "sort" ? "asc" : "");
    search.value = state.q;
    category.value = state.category;
    wellness.value = state.wellness;
    sort.value = state.sort;
  }
  function writeURL() {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(state))
      if (value && !(key === "sort" && value === "asc")) params.set(key, value);
    history.replaceState(
      null,
      "",
      location.pathname + (params.size ? "?" + params : "") + location.hash,
    );
    let robots = document.querySelector("meta[name=robots]");
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.append(robots);
    }
    robots.content = params.size ? "noindex,follow" : "index,follow";
    document.querySelectorAll("my-header [data-locale]").forEach((link) => {
      const target = new URL(link.href);
      target.search = location.search;
      link.href = target.pathname + target.search + location.hash;
    });
  }
  function sync() {
    const labels = {
      q: state.q,
      category: category.selectedOptions[0]?.textContent,
      wellness: wellness.selectedOptions[0]?.textContent,
      letter: state.letter,
      sort: th ? "ชื่อ Z–A" : "Name Z–A",
    };
    chips.replaceChildren();
    for (const [key, value] of Object.entries(state)) {
      if (!value || (key === "sort" && value === "asc")) continue;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = (labels[key] || value) + " ×";
      button.setAttribute(
        "aria-label",
        (th ? "นำตัวกรองออก: " : "Remove filter: ") + (labels[key] || value),
      );
      button.onclick = () => {
        state[key] = key === "sort" ? "asc" : "";
        search.value = state.q;
        category.value = state.category;
        wellness.value = state.wellness;
        sort.value = state.sort;
        closeAC();
        run();
      };
      chips.append(button);
    }
    clear.classList.toggle("is-visible", chips.children.length > 0);
    popular.closest("section").hidden =
      chips.children.length > 0 || !popular.children.length;
    byId("kbAzNav")
      ?.querySelectorAll("button")
      .forEach((button) => {
        const active = button.dataset.letter === state.letter;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    document.dispatchEvent(new Event("cw:refresh"));
  }
  async function json(url, signal) {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error("Request failed");
    return response.json();
  }
  function query(next) {
    const params = new URLSearchParams({
      page: String(next),
      pageSize: String(size),
      locale,
    });
    for (const [key, value] of Object.entries(state))
      if (value) params.set(key, value);
    return params;
  }
  async function results(next = 1, append = false) {
    const version = ++resultVersion;
    resultController?.abort();
    resultController = new AbortController();
    more.disabled = true;
    loading.hidden = false;
    grid.setAttribute("aria-busy", "true");
    try {
      const data = await json(
        "/ingredients?" + query(next),
        resultController.signal,
      );
      if (version !== resultVersion) return;
      items = append ? [...items, ...data.items] : data.items;
      page = next;
      const markup = data.items
        .map((item) => window.KbUI.ingredient(item, locale))
        .join("");
      if (append) grid.insertAdjacentHTML("beforeend", markup);
      else grid.innerHTML = markup;
      empty.hidden = items.length > 0;
      more.hidden = items.length >= data.total;
      byId("kbResultCount").textContent =
        data.total + (th ? " รายการ" : " ingredients");
      byId("kbApiError")?.remove();
      if (state.q || state.category || state.wellness || state.letter)
        track("ingredient_search", {
          search_term: state.q,
          category: state.category,
          wellness_category: state.wellness,
          result_count: data.total,
        });
    } catch (requestError) {
      if (requestError.name === "AbortError") return;
      if (version !== resultVersion) return;
      let error = byId("kbApiError");
      if (!error) {
        error = document.createElement("p");
        error.id = "kbApiError";
        error.setAttribute("role", "alert");
        grid.before(error);
      }
      error.textContent = th
        ? "โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่"
        : "Unable to load ingredients. Please try again.";
    } finally {
      if (version === resultVersion) {
        loading.hidden = true;
        more.disabled = false;
        grid.removeAttribute("aria-busy");
      }
    }
  }
  function run() {
    writeURL();
    sync();
    results();
  }
  function closeAC() {
    ++acVersion;
    acController?.abort();
    autocomplete.classList.remove("is-open");
    autocomplete.replaceChildren();
    search.setAttribute("aria-expanded", "false");
    search.removeAttribute("aria-activedescendant");
    acItems = [];
    acIndex = -1;
  }
  async function suggest(value) {
    const version = ++acVersion;
    acController?.abort();
    if (!value.trim()) {
      closeAC();
      return;
    }
    acController = new AbortController();
    try {
      const data = await json(
        "/ingredients/autocomplete?q=" +
          encodeURIComponent(value) +
          "&locale=" +
          locale,
        acController.signal,
      );
      if (version !== acVersion || value !== search.value) return;
      acItems = Array.isArray(data) ? data : [];
      acIndex = -1;
      autocomplete.innerHTML = acItems.length
        ? acItems
            .map(
              (item, index) =>
                `<a class="kb-autocomplete-item" id="kb-suggestion-${index}" role="option" aria-selected="false" data-index="${index}" href="/${locale}/ingredients/${encodeURIComponent(item.slug)}/"><span>${window.KbUI.escape(th ? item.nameTh : item.nameEn)}${th ? `<br><span class="kb-ac-en">${window.KbUI.escape(item.nameEn)}</span>` : ""}</span></a>`,
            )
            .join("")
        : `<p class="kb-autocomplete-empty">${th ? "ไม่พบส่วนผสมที่ตรงกับคำค้นหา" : "No matching ingredients"}</p>`;
      autocomplete.classList.add("is-open");
      search.setAttribute("aria-expanded", "true");
    } catch (requestError) {
      if (requestError.name === "AbortError" || version !== acVersion) return;
      closeAC();
    }
  }
  search.addEventListener("input", () => {
    state.q = search.value;
    clearTimeout(timer);
    timer = setTimeout(() => {
      suggest(state.q);
      run();
    }, 300);
  });
  search.addEventListener("keydown", (event) => {
    const nodes = [...autocomplete.querySelectorAll("a")];
    if (event.key === "Escape") {
      closeAC();
      return;
    }
    if (event.key === "Enter" && acIndex >= 0) {
      event.preventDefault();
      nodes[acIndex]?.click();
      return;
    }
    if (["ArrowDown", "ArrowUp"].includes(event.key) && nodes.length) {
      event.preventDefault();
      acIndex = Math.max(
        0,
        Math.min(
          nodes.length - 1,
          acIndex + (event.key === "ArrowDown" ? 1 : -1),
        ),
      );
      nodes.forEach((node, index) => {
        node.classList.toggle("is-active", index === acIndex);
        node.setAttribute("aria-selected", String(index === acIndex));
      });
      search.setAttribute("aria-activedescendant", nodes[acIndex].id);
      nodes[acIndex].scrollIntoView({ block: "nearest" });
    }
  });
  autocomplete.addEventListener("click", (event) => {
    const row = event.target.closest("[data-index]");
    if (row) {
      const item = acItems[Number(row.dataset.index)];
      track("ingredient_selected", {
        ingredient_id: item.id,
        ingredient_slug: item.slug,
        source: "autocomplete",
      });
    }
  });
  document.addEventListener("click", (event) => {
    if (!autocomplete.contains(event.target) && event.target !== search)
      closeAC();
  });
  category.addEventListener("change", () => {
    state.category = category.value;
    run();
  });
  wellness.addEventListener("change", () => {
    state.wellness = wellness.value;
    track("wellness_category_selected", {
      wellness_slug: state.wellness,
      source: "ingredient_filter",
    });
    run();
  });
  sort.addEventListener("change", () => {
    state.sort = sort.value;
    run();
  });
  byId("kbAzNav").addEventListener("click", (event) => {
    const button = event.target.closest("[data-letter]");
    if (!button) return;
    state.letter =
      state.letter === button.dataset.letter ? "" : button.dataset.letter;
    run();
  });
  clear.onclick = () => {
    for (const key of Object.keys(state))
      state[key] = key === "sort" ? "asc" : "";
    search.value = "";
    category.value = "";
    wellness.value = "";
    sort.value = "asc";
    closeAC();
    run();
  };
  more.onclick = () => results(page + 1, true);
  for (const [node, source] of [
    [grid, "grid"],
    [popular, "featured"],
  ])
    node?.addEventListener("click", (event) => {
      const card = event.target.closest(".kb-card");
      if (card)
        track("ingredient_selected", {
          ingredient_id: card.dataset.id,
          ingredient_slug: card.dataset.slug,
          source,
        });
    });
  const dialog = byId("kbFilterDialog"),
    fields = byId("kbFilterFields"),
    mobile = matchMedia("(max-width:767px)"),
    wide = matchMedia("(min-width:1120px)");
  function layout() {
    if (dialog.open) dialog.close();
    (mobile.matches
      ? byId("kbMobileFilters")
      : wide.matches
        ? byId("kbDesktopFilters")
        : byId("kbInlineFilters") || byId("library")
    ).append(fields);
  }
  mobile.addEventListener("change", layout);
  wide.addEventListener("change", layout);
  layout();
  byId("kbOpenFilters").onclick = () => {
    closeAC();
    dialog.showModal();
  };
  byId("kbCloseFilters").onclick = () => dialog.close();
  byId("kbApplyFilters").onclick = () => dialog.close();
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left) dialog.close();
    }
  });
  readURL();
  writeURL();
  sync();
  Promise.all([json("/ingredients/categories"), json("/wellness")])
    .then(([categories, topics]) => {
      for (const [select, list, blank] of [
        [category, categories, th ? "ทุกหมวดหมู่" : "All categories"],
        [wellness, topics, th ? "ทุกหัวข้อสุขภาพ" : "All wellness topics"],
      ]) {
        select.replaceChildren();
        const first = document.createElement("option");
        first.value = "";
        first.textContent = blank;
        select.append(first);
        list.forEach((item) => {
          const option = document.createElement("option");
          option.value = item.slug;
          option.textContent = th ? item.nameTh : item.nameEn;
          select.append(option);
        });
      }
      category.value = state.category;
      wellness.value = state.wellness;
      sync();
    })
    .catch(() => {});
  json("/ingredients?sort=popular&pageSize=4&locale=" + locale)
    .then((data) => {
      popular.innerHTML = data.items
        .map((item) => window.KbUI.ingredient(item, locale))
        .join("");
      sync();
    })
    .catch(() => {
      popular.closest("section").hidden = true;
    });
  window.addEventListener("popstate", () => {
    readURL();
    sync();
    results();
  });
  results();
})();
