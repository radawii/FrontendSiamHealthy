const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(
  path.join(__dirname, "../js/kb-page.js"),
  "utf8",
);
function setup(product, initial = []) {
  const events = {},
    writes = [],
    storage = new Map([["siam_healthy_cart", JSON.stringify(initial)]]),
    toast = { hidden: true, textContent: "" },
    button = { disabled: false, dataset: { addProduct: "7" } };
  const document = {
    currentScript: { dataset: {} },
    body: { dataset: {} },
    documentElement: { lang: "en" },
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => toast,
    addEventListener: (name, handler) => {
      (events[name] ??= []).push(handler);
    },
  };
  const window = { dispatchEvent: () => {}, dataLayer: [] };
  const context = {
    document,
    window,
    matchMedia: () => ({ matches: false, addEventListener: () => {} }),
    setTimeout: () => 1,
    clearTimeout: () => {},
    fetch: async () => ({ ok: true, json: async () => product }),
    localStorage: {
      getItem: (key) => storage.get(key),
      setItem: (key, value) => {
        storage.set(key, value);
        writes.push(key);
      },
    },
    CustomEvent: class {},
    requestAnimationFrame: () => {},
  };
  vm.runInNewContext(source, context);
  events.DOMContentLoaded[0]();
  return {
    events,
    writes,
    storage,
    button,
    toast,
    click: () =>
      events.click[0]({
        target: {
          closest: (selector) =>
            selector === "[data-add-product]" ? button : null,
        },
      }),
  };
}
const product = {
  id: 7,
  name: "Existing product",
  price: "990",
  stock: 3,
  isActive: true,
  images: ["/shop/img/original.png"],
};
test("adds existing product data in the established cart schema", async () => {
  const app = setup(product);
  await app.click();
  const cart = JSON.parse(app.storage.get("siam_healthy_cart"));
  assert.equal(cart[0].id, 7);
  assert.equal(cart[0].price, 990);
  assert.equal(cart[0].quantity, 1);
  assert.equal(cart[0].selected, true);
  assert.equal(cart[0].image, product.images[0]);
  assert.equal(app.button.disabled, false);
  assert.equal(app.toast.textContent, "Added to bag");
});
test("merges numeric and string product IDs while preserving other bag entries", async () => {
  const app = setup(product, [
    { id: "7", quantity: 1 },
    { id: 2, quantity: 2 },
  ]);
  await app.click();
  const cart = JSON.parse(app.storage.get("siam_healthy_cart"));
  assert.equal(cart.length, 2);
  assert.equal(cart[0].quantity, 2);
  assert.equal(cart[1].quantity, 2);
});
test("rejects unavailable stock and missing prices without changing the bag", async () => {
  for (const invalid of [
    { ...product, stock: 0 },
    { ...product, price: null },
    { ...product, isActive: false },
  ]) {
    const app = setup(invalid);
    await app.click();
    assert.equal(app.writes.length, 0);
    assert.match(app.toast.textContent, /Unable to add/);
  }
});
test("prevents bag quantity exceeding the current stock", async () => {
  const app = setup(product, [{ id: 7, quantity: 3 }]);
  await app.click();
  assert.equal(app.writes.length, 0);
  assert.equal(JSON.parse(app.storage.get("siam_healthy_cart"))[0].quantity, 3);
});
