const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
for (const name of ['ingredients', 'wellness']) {
  test(`${name} CMS binds controls and loads records when the page is ready`, async () => {
    const ready = [];
    const context = {
      window: { location: { origin: 'https://example.test' } },
      document: { addEventListener: (event, callback) => { if (event === 'DOMContentLoaded') ready.push(callback); }, getElementById: () => null },
      console,
    };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../admin/js', name + '-admin.js'), 'utf8'), context);
    let bound = 0, loaded = 0;
    context.bindEvents = () => { bound++; };
    context.loadAll = async () => { loaded++; };
    for (const callback of ready) callback();
    await Promise.resolve();
    assert.equal(bound, 1);
    assert.equal(loaded, 1);
  });
}
