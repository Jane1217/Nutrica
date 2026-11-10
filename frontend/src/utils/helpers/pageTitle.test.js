import test from 'node:test';
import assert from 'node:assert/strict';
import { getPageTitle, DEFAULT_TITLE } from './pageTitle.js';

test('known routes get their own title', () => {
  assert.equal(getPageTitle('/log-in'), 'Log in — Nutrica');
  assert.equal(getPageTitle('/about/'), 'About — Nutrica');
  assert.equal(getPageTitle('/my-collections/detail/salmon'), 'Collection — Nutrica');
  assert.equal(getPageTitle('/share/abc/salmon'), 'Shared puzzle — Nutrica');
});

test('home and unknown routes keep the default title', () => {
  assert.equal(getPageTitle('/'), DEFAULT_TITLE);
  assert.equal(getPageTitle('/nope'), DEFAULT_TITLE);
  assert.equal(getPageTitle(), DEFAULT_TITLE);
});
