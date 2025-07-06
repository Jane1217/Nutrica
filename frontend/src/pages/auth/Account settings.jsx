import React from 'react';
import { NavLogo, NavMenu } from '../../components/navbar';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import styles from './Auth.module.css';

export default function AccountSettings({ userEmail }) {
  const navigate = useNavigate();
  const initial = userEmail ? userEmail[0].toUpperCase() : '';
  const isLoggedIn = !!userEmail;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="home-root">
      <NavLogo />
      <NavMenu isLoggedIn={isLoggedIn} userEmail={userEmail} />
      <div className={styles['account-main']}>
        <div className={styles['account-avatar']}>{initial}</div>
        <div className={styles['account-email']}>{userEmail}</div>
        <div className={styles['account-btn']} onClick={() => navigate('/tutorials')}>Camera Permission Helper</div>
        <div className={styles['account-btn']} style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span><b>Password</b></span>
          <span>******</span>
          <span className={styles['account-link']} style={{marginLeft:8}}>Change</span>
        </div>
        <div className={styles['account-btn']}><b>Share Feedback</b></div>
        <div className={styles['account-btn']} onClick={handleSignOut}><b>Sign out</b></div>
        <div className={styles['account-footer']}>
          <span>Legal</span>
          <span>About Us</span>
          <span>Delete Account</span>
        </div>
      </div>
    </div>
  );
} 