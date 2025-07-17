import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/home/home';
import LogIn from './pages/auth/pages/Log In';
import SignUp from './pages/auth/pages/Sign up';
import ResetPassword from './pages/auth/pages/ResetPassword';
import AccountSettings from './pages/auth/pages/Account settings';
import Tutorials from './pages/auth/pages/Tutorials';
import ScanLabelPage from './pages/eat/pages/scan-label/ScanLabelPage';
import Welcome from './pages/welcome/Welcome';
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  const handleAuth = () => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
  };

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
      </Routes>
    </BrowserRouter>
  );
}