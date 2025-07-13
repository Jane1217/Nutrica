import React from 'react';
import { NavLogo } from '../../components/navbar';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import styles from './Auth.module.css';

export default function AccountSettings({ userEmail }) {
  const navigate = useNavigate();
  const initial = userEmail ? userEmail[0].toUpperCase() : '';
  const nickname = 'Frank'; // 可根据实际替换

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/log-in', { replace: true });
  };

  return (
    <div className={styles['account-main']}>
      <NavLogo />
      <h1 className={styles['account-title']}>Account</h1>
      <div className={styles['account-avatar']}>{initial}</div>
      <div className={styles['account-nickname']}>{nickname}</div>
      <div className={styles['account-email']}>{userEmail}</div>
      <div className={styles['account-card-list']}>
        <button className={styles['account-card-btn']} disabled>
          Update Nutrition Goal
          <span>{'>'}</span>
        </button>
        <button className={styles['account-card-btn']} disabled>
          Change Password
          <span>{'>'}</span>
        </button>
        <button className={styles['account-card-btn']} disabled>
          Share Feedback
          <span>{'>'}</span>
        </button>
        <button className={styles['account-card-btn']} onClick={handleSignOut}>
          Sign Out
          <span>{'>'}</span>
        </button>
      </div>
      <div className={styles['account-footer-bar']}>
        <span>About</span>
        <span>Contact Us</span>
        <span>Delete Account</span>
      </div>
    </div>
  );
} 