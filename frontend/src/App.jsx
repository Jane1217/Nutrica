import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/home/home';
import LogIn from './pages/auth/Log In';
import SignUp from './pages/auth/Sign up';
import AccountSettings from './pages/auth/Account settings';
import Tutorials from './pages/auth/Tutorials';
import ScanLabelPage from './pages/eat/scan label/ScanLabelPage';
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
              : <LogIn onAuth={() => supabase.auth.getUser().then(({ data }) => setUser(data?.user || null))} />
          }
        />
        <Route
          path="/sign-up"
          element={
            user
              ? <Navigate to="/" replace />
              : <SignUp onAuth={() => supabase.auth.getUser().then(({ data }) => setUser(data?.user || null))} />
          }
        />
        <Route path="/account" element={<AccountSettings userEmail={user?.email || ''} />} />
        <Route path="/tutorials" element={<Tutorials isLoggedIn={!!user} userEmail={user?.email || ''} />} />
        <Route path="/eat/scan label" element={<ScanLabelPage />} />
      </Routes>
    </BrowserRouter>
  );
}