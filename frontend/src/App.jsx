import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

// Keep the first download focused on authentication and the current route.
// The scanner, collections and account UI otherwise made every first visit
// download the entire application before any page could render.
const Home = lazy(() => import('./pages/home/home'));
const LogIn = lazy(() => import('./pages/auth/pages/Log In'));
const SignUp = lazy(() => import('./pages/auth/pages/Sign up'));
const ForgotPassword = lazy(() => import('./pages/auth/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/pages/ResetPassword'));
const AccountSettings = lazy(() => import('./pages/auth/pages/Account settings'));
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初始化时获取用户状态
    const initializeAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error getting user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
    <BrowserRouter>
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
                  onClose={() => window.history.back()}
                  onAuth={handleAuth}
                  onSwitchToSignUp={() => window.location.href = '/sign-up'}
                  onSwitchToForgotPassword={() => window.location.href = '/forgot-password'}
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
                  onClose={() => window.history.back()}
                  onAuth={handleAuth}
                  onSwitchToLogin={() => window.location.href = '/log-in'}
                />
          }
        />
        <Route
          path="/forgot-password"
          element={
            <ForgotPassword
              open={true}
              onClose={() => window.location.href = '/'}
              onBackToLogin={() => window.location.href = '/log-in'}
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
    </BrowserRouter>
  );
}

function PageLoading() {
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
