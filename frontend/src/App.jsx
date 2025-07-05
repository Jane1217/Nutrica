import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AllEmpty from './pages/home/All empty';
import AllEmptyAuthenticated from './pages/home/All empty_Authenticated';
import LogIn from './pages/auth/Log In';
import SignUp from './pages/auth/Sign up';
import AccountSettings from './pages/auth/Account settings';
import Tutorials from './pages/auth/Tutorials';
import Meals from './pages/meals/Meals';
import DailyView from './pages/meals/Daily view';
import WeeklyView from './pages/meals/Weekly view';
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
        <Route path="/" element={user ? <AllEmptyAuthenticated isLoggedIn={true} userEmail={user?.email || ''} /> : <AllEmpty isLoggedIn={false} userEmail={''} />} />
        <Route path="/log-in" element={<LogIn onAuth={() => supabase.auth.getUser().then(({ data }) => setUser(data?.user || null))} />} />
        <Route path="/sign-up" element={<SignUp onAuth={() => supabase.auth.getUser().then(({ data }) => setUser(data?.user || null))} />} />
        <Route path="/account" element={<AccountSettings userEmail={user?.email || ''} />} />
        <Route path="/tutorials" element={<Tutorials isLoggedIn={!!user} userEmail={user?.email || ''} />} />
        <Route path="/meals" element={<Meals userEmail={user?.email || ''} isLoggedIn={!!user} />} />
        <Route path="/meals/daily" element={<DailyView userEmail={user?.email || ''} isLoggedIn={!!user} />} />
        <Route path="/meals/weekly" element={<WeeklyView userEmail={user?.email || ''} isLoggedIn={!!user} />} />
      </Routes>
    </BrowserRouter>
  );
}