import React, { useState } from 'react';
import { NavLogo } from '../../components/navbar';
import EatModal from '../../components/eat/EatModal';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import styles from './Auth.module.css';

export default function AccountSettings({ userEmail }) {
  const navigate = useNavigate();
  const [showEatModal, setShowEatModal] = useState(false);
  const [showSafariSetup, setShowSafariSetup] = useState(true);
  const initial = userEmail ? userEmail[0].toUpperCase() : '';
  const nickname = 'Frank'; // 可根据实际替换

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/', { replace: true }); // 跳转到welcome页面
  };

  return (
    <>
      <NavLogo onEatClick={() => setShowEatModal(true)} />
      <div className={styles['account-main']}>
        <h1 className={styles['account-title']}>Account</h1>
      <div className={styles['account-avatar']}>{initial}</div>
      <div className={styles['account-nickname']}>{nickname}</div>
      <div className={styles['account-email']}>{userEmail}</div>
      {showSafariSetup && (
        <div className={styles['account-info-box']}>
          <div style={{display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between'}}>
            <span style={{fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8}}>
              <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f30d.svg" alt="safari" style={{width: 24, height: 24, marginRight: 8}} />
              Safari Camera Permission Setup
            </span>
            <span style={{cursor: 'pointer', fontSize: 20, color: '#888'}} onClick={() => setShowSafariSetup(false)}>&times;</span>
          </div>
          <div style={{fontSize: 15, color: '#22221B', opacity: 0.8}}>
            Avoid repeated camera permission popups — enable full camera access for seamless scanning on Nutrica.com, with Safari.
          </div>
        </div>
      )}
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
      {showEatModal && (
        <EatModal
          onClose={() => setShowEatModal(false)}
          foods={[]}
          onDescribe={() => {}}
          onEnterValue={() => {}}
        />
      )}
      </div>
    </>
  );
}