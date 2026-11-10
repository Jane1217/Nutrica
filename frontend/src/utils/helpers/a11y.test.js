import test from 'node:test';
import assert from 'node:assert/strict';
import { buttonProps } from './a11y.js';

const keyEvent = (key, same = true) => {
  const el = {};
  let prevented = false;
  return { key, target: el, currentTarget: same ? el : {}, preventDefault: () => { prevented = true; }, get prevented() { return prevented; } };
};

test('buttonProps makes an element focusable with a button role and label', () => {
  const props = buttonProps(() => {}, 'Open');
  assert.equal(props.role, 'button');
  assert.equal(props.tabIndex, 0);
  assert.equal(props['aria-label'], 'Open');
});

test('Enter and Space activate, other keys do not', () => {
  let calls = 0;
  const { onKeyDown } = buttonProps(() => { calls += 1; });
  const enter = keyEvent('Enter');
  onKeyDown(enter);
  onKeyDown(keyEvent(' '));
  onKeyDown(keyEvent('a'));
  assert.equal(calls, 2);
  assert.equal(enter.prevented, true);
});

test('keys pressed on a nested control do not trigger the outer button', () => {
  let calls = 0;
  const { onKeyDown } = buttonProps(() => { calls += 1; });
  onKeyDown(keyEvent('Enter', false));
  assert.equal(calls, 0);
});
