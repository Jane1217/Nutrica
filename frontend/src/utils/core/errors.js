/**
 * Helpers that turn low-level errors into messages a user can act on.
 */

export const NETWORK_ERROR_MESSAGE = 'No Internet connection. Try again.';

// supabase-js reports connectivity problems as AuthRetryableFetchError (status 0)
// and fetch() as a TypeError whose message depends on the browser
// ("Failed to fetch", "Load failed", "NetworkError when attempting to fetch...").
export const isNetworkError = (error) => {
  if (!error) return false;
  if (error.name === 'AuthRetryableFetchError' || error.status === 0) return true;
  const message = String(error.message || error);
  return /failed to fetch|load failed|networkerror|network request failed|fetch failed|err_internet_disconnected/i.test(message);
};

export const RATE_LIMIT_MESSAGE = 'Too many attempts. Please wait a minute and try again.';

// Supabase answers repeated auth emails / attempts with HTTP 429 and codes such as
// `over_email_send_rate_limit`; the raw text ("For security purposes, you can only
// request this after 37 seconds") is confusing in the UI.
export const isRateLimitError = (error) => {
  if (!error || typeof error === 'string') return false;
  if (error.status === 429) return true;
  if (typeof error.code === 'string' && /rate_limit/.test(error.code)) return true;
  return /rate limit|only request this (after|once)|too many (requests|attempts)/i.test(String(error.message || ''));
};

// Use for any error that would otherwise be shown to the user verbatim.
export const getFriendlyErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (isNetworkError(error)) return NETWORK_ERROR_MESSAGE;
  if (isRateLimitError(error)) return RATE_LIMIT_MESSAGE;
  const message = typeof error === 'string' ? error : error?.message;
  return message || fallback;
};
