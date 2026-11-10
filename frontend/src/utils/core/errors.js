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

// Use for any error that would otherwise be shown to the user verbatim.
export const getFriendlyErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (isNetworkError(error)) return NETWORK_ERROR_MESSAGE;
  const message = typeof error === 'string' ? error : error?.message;
  return message || fallback;
};
