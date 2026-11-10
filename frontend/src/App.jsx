import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import AppErrorBoundary from './components/common/AppErrorBoundary';

// Keep the first download focused on authentication and the current route.
// The scanner, collections and account UI otherwise made every first visit
// download the entire application before any page could render.
const Home = lazy(() => import('./pages/home/home'));
const LogIn = lazy(() => import('./pages/auth/pages/Login'));
const SignUp = lazy(() => import('./pages/auth/pages/SignUp'));
const ForgotPassword = lazy(() => import('./pages/auth/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/pages/ResetPassword'));
const AccountSettings = lazy(() => import('./pages/auth/pages/AccountSettings'));
const Tutorials = lazy(() => import('./pages/auth/pages/Tutorials'));
const ScanLabelPage = lazy(() => import('./pages/eat/pages/scan-label/ScanLabelPage'));
const Welcome = lazy(() => import('./pages/welcome/Welcome'));
const MyCollections = lazy(() => import('./pages/my-collections/pages/MyCollections'));
const CollectionDetail = lazy(() => import('./pages/my-collections/pages/CollectionDetail'));
const SharePage = lazy(() => import('./pages/share/SharePage'));
const SafariCameraPermission = lazy(() => import('./pages/auth/pages/SafariCameraPermission'));
const PrivacyNotice = lazy(() => import('./pages/auth/pages/PrivacyNotice'));
const About = lazy(() => import('./pages/auth/pages/About'));

function RequireAuth({ user, children }) {
  return user ? children : <Navigate to="/log-in" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

// supabase-js keeps the session in localStorage under `sb-<project>-auth-token`.
// Reading it directly lets the first render happen immediately: awaiting
// getSession()/getUser() blocks on the auth server whenever the access token has
// expired (a refresh round trip) or another tab holds the auth lock, which kept
// returning visitors on a blank "Loading..." screen for seconds.
const AUTH_STORAGE_KEY = /^sb-.+-auth-token$/;

function readStoredUser() {
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && AUTH_STORAGE_KEY.test(key)) {
        const stored = JSON.parse(localStorage.getItem(key));
        const storedUser = stored?.user ?? stored?.currentSession?.user ?? null;
        if (storedUser?.id) return storedUser;
      }
    }
  } catch {
    // localStorage unavailable or corrupted: treat as signed out
  }
  return null;
}

// Email-confirmation / password-recovery links carry tokens in the URL that
// supabase-js must process before we know who the user is.
function hasAuthCallbackInUrl() {
  if (typeof window === 'undefined') return false;
  return /access_token|refresh_token|type=(recovery|signup|magiclink|invite|email_change)|[?&]code=/
    .test(`${window.location.hash}${window.location.search}`);
}

// Never keep the app on the loading screen longer than this waiting for auth.
const AUTH_INIT_TIMEOUT_MS = 3000;

function AppRoutes() {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(hasAuthCallbackInUrl);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Safety net for the URL-callback case: render with whatever we know.
    const timeoutId = setTimeout(() => setLoading(false), AUTH_INIT_TIMEOUT_MS);

    // INITIAL_SESSION fires once supabase-js has validated (and if needed
    // refreshed) the stored session; it then corrects the optimistic user above.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // 清除与用户绑定的本地缓存，避免下一个登录的账号看到上一个账号的 puzzle
        try {
          localStorage.removeItem('selectedPuzzle');
          localStorage.removeItem('selectedPuzzleDate');
          localStorage.removeItem('nutrica_user_cache');
        } catch { /* localStorage 不可用时忽略 */ }
      }
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const handleAuth = () => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
  };

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100dvh',
        fontSize: '16px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <AppErrorBoundary resetKey={location.pathname}>
      <Suspense fallback={<PageLoading />}>
        <Routes>
        <Route
          path="/"
          element={
            user
              ? <Home isLoggedIn={true} userEmail={user?.email || ''} />
              : <Welcome />
          }
        />
        <Route
          path="/log-in"
          element={
            user
              ? <Navigate to="/" replace />
              : <LogIn
                  open={true}
                  onClose={() => navigate('/')}
                  onAuth={handleAuth}
                  onSwitchToSignUp={() => navigate('/sign-up')}
                  onSwitchToForgotPassword={() => navigate('/forgot-password')}
                />
          }
        />
        <Route
          path="/sign-up"
          element={
            user
              ? <Navigate to="/" replace />
              : <SignUp
                  open={true}
                  onClose={() => navigate('/')}
                  onAuth={handleAuth}
                  onSwitchToLogin={() => navigate('/log-in')}
                />
          }
        />
        <Route
          path="/forgot-password"
          element={
            <ForgotPassword
              open={true}
              onClose={() => navigate('/')}
              onBackToLogin={() => navigate('/log-in')}
            />
          }
        />
        <Route
          path="/reset-password"
          element={
            user
              ? <ResetPassword />
              : <ResetPassword />
          }
        />

        <Route
          path="/account"
          element={<RequireAuth user={user}><AccountSettings userEmail={user?.email || ''} /></RequireAuth>}
        />
        <Route path="/tutorials" element={<Tutorials isLoggedIn={!!user} userEmail={user?.email || ''} />} />
        <Route
          path="/eat/scan-label"
          element={<RequireAuth user={user}><ScanLabelPage userId={user?.id} /></RequireAuth>}
        />
        <Route
          path="/my-collections"
          element={
            user
              ? <MyCollections />
              : <Navigate to="/log-in" replace />
          }
        />
        <Route
          path="/my-collections/detail/:puzzleName"
          element={
            user
              ? <CollectionDetail />
              : <Navigate to="/log-in" replace />
          }
        />
        <Route path="/share/:userId/:puzzleName" element={<SharePage />} />
        <Route
          path="/safari-camera-permission"
          element={<RequireAuth user={user}><SafariCameraPermission /></RequireAuth>}
        />
        <Route path="/privacy-notice" element={<PrivacyNotice />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppErrorBoundary>
  );
}

function PageLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100dvh',
      fontSize: '16px',
        color: '#666'
      }}
    >
      Loading...
    </div>
  );
}
