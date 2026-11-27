const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { translate, localizedHref } = require('../js/site-i18n.js');
const base = 'https://example.test/shop/?category=eyes-ears&lang=th';

test('public navigation keeps filters, product IDs and anchors while changing language', () => {
  assert.equal(localizedHref('/shop/?category=eyes-ears&page=2#results', 'en', base), '/shop/?category=eyes-ears&page=2&lang=en#results');
  assert.equal(localizedHref('/shop/product.html?id=elsie', 'en', base), '/shop/product.html?id=elsie&lang=en');
  assert.equal(localizedHref('../login.html?returnTo=%2Fcart%2F', 'th', base), '/login.html?returnTo=%2Fcart%2F&lang=th');
});

test('knowledge links use their translated route and retain search state', () => {
  assert.equal(localizedHref('/th/ingredients/ginkgo/?q=mag#references', 'en', base), '/en/ingredients/ginkgo/?q=mag#references');
  assert.equal(localizedHref('/en/wellness/sleep/', 'th', base), '/th/wellness/sleep/');
});

test('external, telephone, local anchors, API and admin links are untouched', () => {
  for (const href of ['https://other.test/shop/', 'tel:0955303986', 'mailto:info@example.test', '#payment', '/admin/ingredients.html', '/api/products', 'javascript:void(0);']) {
    assert.equal(localizedHref(href, 'en', base), href);
  }
});

test('Thai copy, prices, identifiers and unknown authored content are preserved', () => {
  for (const text of ['รหัสผ่าน', '฿990.00', 'ORD-123456', 'qa@example.test', 'Elsie', 'ข้อความเฉพาะที่ผู้ใช้กรอก']) {
    assert.equal(translate(text, 'th'), text);
  }
  assert.equal(translate('qa@example.test', 'en'), 'qa@example.test');
  assert.equal(translate('฿990.00', 'en'), '฿990.00');
  assert.equal(translate('Ginkgo biloba', 'en'), 'Ginkgo biloba');
});

test('dynamic counts and quantities retain the original numbers', () => {
  assert.equal(translate('17 ผลิตภัณฑ์', 'en'), '17 products');
  assert.equal(translate('เลือกทั้งหมด (2/11 รายการ)', 'en'), 'Select all (2/11 items)');
  assert.equal(translate('จำนวน: 123 ชิ้น', 'en'), 'Quantity: 123 items');
  assert.equal(translate('คำสั่งซื้อ #ORD-12345', 'en'), 'Order #ORD-12345');
});

test('login, password recovery and checkout static labels have English coverage', () => {
  for (const name of ['login.html', 'forgot-password.html', 'cart/index.html', 'cart/orders.html', 'cart/order-detail.html']) {
    const html = fs.readFileSync(path.resolve(__dirname, '..', name), 'utf8')
      .replace(/<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>/gi, '');
    const texts = [...html.matchAll(/>([^<>]+)</g)].map(match => match[1]);
    texts.push(...[...html.matchAll(/(?:placeholder|aria-label)="([^"]+)"/g)].map(match => match[1]));
    for (const text of texts.filter(text => /[ก-๙]/.test(text) && !/^\s*฿/.test(text))) {
      assert.ok(!/[ก-๙]/.test(translate(text, 'en')), `${name}: ${text.trim()}`);
    }
  }
});

test('all homepage Thai text nodes have localized English copy', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8')
    .replace(/<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script>/gi, '');
  for (const match of html.matchAll(/>([^<>]+)</g)) {
    if (/[ก-๙]/.test(match[1]) && !/^\s*฿/.test(match[1])) {
      assert.ok(!/[ก-๙]/.test(translate(match[1], 'en')), match[1].trim());
    }
  }
});
