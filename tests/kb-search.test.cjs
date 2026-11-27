const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(
  path.join(__dirname, "../js/ingredients-hub.js"),
  "utf8",
);
const settle = () => new Promise(setImmediate);

function setup() {
  const nodes = new Map(),
    requests = [],
    timers = new Map();
  let timerId = 0;
  function node() {
    const classes = new Set();
    return {
      value: "",
      children: [],
      selectedOptions: [],
      dataset: {},
      events: {},
      attributes: {},
      replacements: 0,
      appends: 0,
      classList: {
        add: (name) => classes.add(name),
        remove: (name) => classes.delete(name),
        contains: (name) => classes.has(name),
        toggle: (name, on) => (on ? classes.add(name) : classes.delete(name)),
      },
      set innerHTML(value) {
        this.markup = value;
        this.replacements++;
      },
      get innerHTML() {
        return this.markup || "";
      },
      insertAdjacentHTML(_position, value) {
        this.markup += value;
        this.appends++;
      },
      addEventListener(name, callback) {
        this.events[name] = callback;
      },
      setAttribute(name, value) {
        this.attributes[name] = value;
      },
      removeAttribute(name) {
        delete this.attributes[name];
      },
      replaceChildren() {
        this.children = [];
        this.markup = "";
      },
      append(child) {
        this.children.push(child);
      },
      querySelectorAll() {
        return [];
      },
      closest() {
        return this;
      },
      remove() {},
    };
  }
  const get = (id) => {
    if (!nodes.has(id)) nodes.set(id, node());
    return nodes.get(id);
  };
  const document = {
    documentElement: { lang: "en" },
    head: node(),
    getElementById: (id) => (id === "kbApiError" ? null : get(id)),
    querySelector: () => node(),
    querySelectorAll: () => [],
    createElement: node,
    addEventListener() {},
    dispatchEvent() {},
  };
  vm.runInNewContext(source, {
    document,
    URL,
    URLSearchParams,
    AbortController,
    Event: class {},
    location: { pathname: "/en/ingredients/", search: "", hash: "" },
    history: { replaceState() {} },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    window: {
      addEventListener() {},
      KbUI: { escape: (s) => s, ingredient: (item) => `<a>${item.slug}</a>` },
    },
    setTimeout: (callback) => {
      const id = ++timerId;
      timers.set(id, callback);
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
    fetch: (url, { signal } = {}) => {
      if (url === "/ingredients/categories" || url === "/wellness")
        return Promise.resolve({ ok: true, json: async () => [] });
      if (url.includes("sort=popular"))
        return Promise.resolve({ ok: true, json: async () => ({ items: [] }) });
      return new Promise((resolve, reject) => {
        requests.push({
          url,
          signal,
          respond: (value) => resolve({ ok: true, json: async () => value }),
        });
        signal?.addEventListener("abort", () =>
          reject(Object.assign(new Error("Aborted"), { name: "AbortError" })),
        );
      });
    },
  });
  return {
    get,
    requests,
    input(value) {
      const search = get("kbSearchInput");
      search.value = value;
      search.events.input();
      const callbacks = [...timers.values()];
      timers.clear();
      callbacks.forEach((callback) => callback());
    },
  };
}

test("superseded requests are cancelled without clearing newer autocomplete or results", async () => {
  const page = setup();
  page.input("mag");
  const old = page.requests.filter((request) => request.url.includes("q=mag"));
  page.input("vitamin-c");
  await settle();
  assert.equal(old.length, 2);
  assert.ok(old.every((request) => request.signal.aborted));
  const latest = page.requests.filter((request) =>
    request.url.includes("q=vitamin-c"),
  );
  assert.ok(latest.every((request) => !request.signal.aborted));
  for (const request of latest)
    request.respond(
      request.url.includes("/autocomplete")
        ? [{ slug: "vitamin-c", nameEn: "Vitamin C" }]
        : { items: [{ slug: "vitamin-c" }], total: 1 },
    );
  await settle();
  assert.ok(page.get("kbAutocomplete").classList.contains("is-open"));
  assert.match(page.get("kbAutocomplete").innerHTML, /vitamin-c/);
  assert.equal(page.get("kbGrid").innerHTML, "<a>vitamin-c</a>");
});

test("loading another page preserves existing cards instead of recreating the grid", async () => {
  const page = setup();
  page.requests[0].respond({ items: [{ slug: "first" }], total: 2 });
  await settle();
  page.get("kbLoadMore").onclick();
  page.requests
    .find((request) => request.url.includes("page=2"))
    .respond({ items: [{ slug: "second" }], total: 2 });
  await settle();
  const grid = page.get("kbGrid");
  assert.equal(grid.replacements, 1);
  assert.equal(grid.appends, 1);
  assert.equal(grid.innerHTML, "<a>first</a><a>second</a>");
  assert.equal(page.get("kbLoadMore").hidden, true);
});
