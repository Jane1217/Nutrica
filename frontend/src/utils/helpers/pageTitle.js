/**
 * Browser tab / history titles per route. Every page used to show the same
 * marketing title, which made tabs, history and bookmarks indistinguishable.
 */
export const DEFAULT_TITLE = 'Nutrica — AI-Powered Nutrition Tracking';

const TITLES = {
  '/log-in': 'Log in',
  '/sign-up': 'Create account',
  '/forgot-password': 'Forgot password',
  '/reset-password': 'Reset password',
  '/account': 'Account',
  '/eat/scan-label': 'Scan label',
  '/my-collections': 'My collections',
  '/safari-camera-permission': 'Camera permission',
  '/privacy-notice': 'Privacy notice',
  '/about': 'About',
};

export function getPageTitle(pathname = '/') {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  let title = TITLES[path];
  if (!title && path.startsWith('/my-collections/detail/')) title = 'Collection';
  if (!title && path.startsWith('/share/')) title = 'Shared puzzle';
  return title ? `${title} — Nutrica` : DEFAULT_TITLE;
}
