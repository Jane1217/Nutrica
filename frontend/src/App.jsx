import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/home/home';
import LogIn from './pages/auth/pages/Log In';
import SignUp from './pages/auth/pages/Sign up';
import ResetPassword from './pages/auth/pages/ResetPassword';
import AccountSettings from './pages/auth/pages/Account settings';
import Tutorials from './pages/auth/pages/Tutorials';
import ScanLabelPage from './pages/eat/pages/scan-label/ScanLabelPage';
import Welcome from './pages/welcome/Welcome';
import MyCollections from './pages/my-collections/pages/MyCollections';
import CollectionDetail from './pages/my-collections/pages/CollectionDetail';
import SharePage from './pages/share/SharePage';
import SafariCameraPermission from './pages/auth/pages/SafariCameraPermission';
import PrivacyNotice from './pages/auth/pages/PrivacyNotice';
import About from './pages/auth/pages/About';
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

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
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
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
          path="/reset-password"
          element={
            user
              ? <ResetPassword />
              : <ResetPassword />
          }
        />

        <Route path="/account" element={<AccountSettings userEmail={user?.email || ''} />} />
        <Route path="/tutorials" element={<Tutorials isLoggedIn={!!user} userEmail={user?.email || ''} />} />
        <Route path="/eat/scan-label" element={<ScanLabelPage userId={user?.id} />} />
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
        <Route path="/safari-camera-permission" element={<SafariCameraPermission />} />
        <Route path="/privacy-notice" element={<PrivacyNotice />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}