import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getFriendlyErrorMessage,
  isNetworkError,
  isRateLimitError,
  NETWORK_ERROR_MESSAGE,
  RATE_LIMIT_MESSAGE
} from './errors.js';

test('recognizes connectivity failures from every browser', () => {
  assert.equal(isNetworkError(new TypeError('Failed to fetch')), true); // Chrome
  assert.equal(isNetworkError(new TypeError('Load failed')), true); // Safari
  assert.equal(isNetworkError(new TypeError('NetworkError when attempting to fetch resource.')), true); // Firefox
  assert.equal(isNetworkError({ name: 'AuthRetryableFetchError', message: 'x', status: 0 }), true); // supabase-js
});

test('does not treat ordinary errors as network errors', () => {
  assert.equal(isNetworkError(new Error('Invalid login credentials')), false);
  assert.equal(isNetworkError(null), false);
});

test('never shows a raw "Failed to fetch" to the user', () => {
  assert.equal(getFriendlyErrorMessage(new TypeError('Failed to fetch')), NETWORK_ERROR_MESSAGE);
});

test('keeps meaningful server messages and falls back otherwise', () => {
  assert.equal(getFriendlyErrorMessage(new Error('User already registered')), 'User already registered');
  assert.equal(getFriendlyErrorMessage(new Error(''), 'Try again later'), 'Try again later');
  assert.equal(getFriendlyErrorMessage(undefined), 'Something went wrong. Please try again.');
});

test('recognizes Supabase rate limit errors and explains them', () => {
  const byStatus = { status: 429, message: 'Too Many Requests' };
  const byCode = { code: 'over_email_send_rate_limit', message: 'email rate limit exceeded' };
  const byMessage = { message: 'For security purposes, you can only request this after 37 seconds.' };

  [byStatus, byCode, byMessage].forEach(error => {
    assert.equal(isRateLimitError(error), true);
    assert.equal(getFriendlyErrorMessage(error), RATE_LIMIT_MESSAGE);
  });
  assert.equal(isRateLimitError(new Error('Invalid login credentials')), false);
  assert.equal(isRateLimitError('rate limit'), false);
});
