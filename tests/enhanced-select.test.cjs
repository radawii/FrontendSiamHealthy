const { test } = require('node:test');
const assert = require('node:assert/strict');
const { canEnhance } = require('../js/enhanced-select.js');

global.getComputedStyle = select => select.style;
function select(overrides = {}) {
  const field = {
    optedIn: true,
    hidden: false,
    framework: false,
    hiddenAncestor: false,
    ariaHidden: false,
    dataset: {},
    options: [{ textContent: 'All categories', value: '' }],
    style: { display: 'inline-block', visibility: 'visible' },
    matches(selector) {
      if (selector === 'select[data-enhance-select]') return this.optedIn;
      if (selector === '.swal2-select,[aria-hidden="true"]') return this.framework || this.ariaHidden;
      throw new Error('Unexpected selector: ' + selector);
    },
    closest() { return this.hiddenAncestor ? {} : null; },
  };
  return Object.assign(field, overrides);
}

test('ordinary controls and framework selects are never automatically replaced', () => {
  assert.equal(canEnhance(select({ optedIn: false })), false);
  assert.equal(canEnhance(select({ framework: true })), false);
  assert.equal(canEnhance(select({ dataset: { native: '' } })), false);
});

test('hidden selects cannot produce a visible dropdown trigger', () => {
  assert.equal(canEnhance(select({ hidden: true })), false);
  assert.equal(canEnhance(select({ ariaHidden: true })), false);
  assert.equal(canEnhance(select({ hiddenAncestor: true })), false);
  assert.equal(canEnhance(select({ style: { display: 'none', visibility: 'visible' } })), false);
  assert.equal(canEnhance(select({ style: { display: 'block', visibility: 'hidden' } })), false);
});

test('empty controls stay native until their actual options are loaded', () => {
  const field = select({ options: [] });
  assert.equal(canEnhance(field), false);
  field.options.push({ textContent: 'Minerals', value: 'minerals' });
  assert.equal(canEnhance(field), true);
  assert.equal(canEnhance(select({ options: [{ textContent: '   ', value: '' }] })), false);
});

test('explicit filters and multiple relation fields keep their submitted values', () => {
  const field = select({ multiple: true, value: 'mineral-1', options: [{ textContent: 'Minerals', value: 'mineral-1' }] });
  assert.equal(canEnhance(field), true);
  assert.equal(field.value, 'mineral-1');
  assert.equal(field.options[0].value, 'mineral-1');
});
