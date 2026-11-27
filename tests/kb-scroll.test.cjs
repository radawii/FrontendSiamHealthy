const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(
  path.join(__dirname, "../js/kb-page.js"),
  "utf8",
);

function setup({ mobile = false, reduced = false } = {}) {
  const events = {},
    frames = [],
    observers = [];
  let reads = 0,
    writes = 0;
  const window = {
    scrollY: 0,
    addEventListener: (name, callback) => {
      events[name] = callback;
    },
  };
  const sections = [100, 400, 900].map((top, index) => ({
    id: `section-${index}`,
    top,
    getBoundingClientRect() {
      reads++;
      return { top: this.top - window.scrollY };
    },
    scrollIntoView(options) {
      this.scrollOptions = options;
    },
    focus(options) {
      this.focusOptions = options;
    },
  }));
  const links = sections.map((section) => ({
    hash: "#" + section.id,
    attributes: {},
    addEventListener(name, callback) {
      this[name] = callback;
    },
    setAttribute(name, value) {
      writes++;
      this.attributes[name] = value;
    },
    removeAttribute(name) {
      writes++;
      delete this.attributes[name];
    },
  }));
  const toc = { open: true, addEventListener() {} };
  const header = {
    getBoundingClientRect() {
      reads++;
      return { height: mobile ? 64 : 72 };
    },
  };
  class ResizeObserver {
    constructor(callback) {
      observers.push(callback);
    }
    observe() {}
  }
  window.ResizeObserver = ResizeObserver;
  const document = {
    body: { dataset: {} },
    currentScript: { dataset: {} },
    documentElement: { lang: "th" },
    addEventListener: (name, callback) => {
      events[name] = callback;
    },
    querySelector: (selector) =>
      ({
        ".kb-toc-panel": toc,
        ".main-header": header,
        ".kb-main article": {},
      })[selector],
    querySelectorAll: () => links,
    getElementById: (id) => sections.find((section) => section.id === id),
  };
  vm.runInNewContext(source, {
    window,
    document,
    ResizeObserver,
    matchMedia: (query) => ({
      matches: query.includes("max-width") ? mobile : reduced,
      addEventListener() {},
    }),
    requestAnimationFrame: (callback) => {
      frames.push(callback);
    },
    history: { replaceState() {} },
    location: { pathname: "/th/ingredients/example/", search: "" },
  });
  events.DOMContentLoaded();
  return {
    events,
    frames,
    sections,
    links,
    toc,
    reads: () => reads,
    writes: () => writes,
    active: () => links.findIndex((link) => link.attributes["aria-current"]),
    scroll(y) {
      window.scrollY = y;
      events.scroll();
    },
    resizeContent() {
      observers.forEach((callback) => callback());
    },
    flush() {
      while (frames.length) frames.shift()();
    },
  };
}

test("scrolling highlights the correct heading without repeated layout reads or DOM writes", () => {
  const page = setup();
  assert.equal(page.active(), 0);
  const reads = page.reads(),
    writes = page.writes();
  for (let i = 0; i < 100; i++) page.scroll(30);
  assert.equal(page.frames.length, 1);
  page.flush();
  assert.equal(page.reads(), reads);
  assert.equal(page.writes(), writes);
  page.scroll(350);
  page.flush();
  assert.equal(page.active(), 1);
  assert.equal(page.reads(), reads);
  page.scroll(850);
  page.flush();
  assert.equal(page.active(), 2);
});

test("content resizing refreshes positions so the selected heading remains accurate", () => {
  const page = setup();
  page.scroll(850);
  page.flush();
  assert.equal(page.active(), 2);
  page.sections[2].top = 1200;
  page.resizeContent();
  page.flush();
  assert.equal(page.active(), 1);
});

test("mobile navigation closes the contents panel and respects reduced motion", () => {
  const page = setup({ mobile: true, reduced: true });
  assert.equal(page.toc.open, false);
  page.toc.open = true;
  page.links[2].click({ preventDefault() {} });
  assert.equal(page.toc.open, false);
  assert.equal(page.sections[2].scrollOptions.behavior, "auto");
  assert.equal(page.sections[2].focusOptions.preventScroll, true);
});
