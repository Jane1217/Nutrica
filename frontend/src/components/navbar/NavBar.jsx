import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './NavBar.module.css';

export default function NavBar({ isLoggedIn, userEmail }) {
  const location = useLocation();
  const navigate = useNavigate();
  const tabs = ['Home', 'Meals', 'Goal'];
  // 判断当前tab
  const currentTab = tabs.findIndex(tab => {
    if (tab === 'Home') return location.pathname === '/';
    return location.pathname.startsWith('/' + tab.toLowerCase());
  });
  // 头像首字母
  const getInitial = (email) => email ? email[0].toUpperCase() : '';

  return (
    <div className={styles['navbarRoot']}>
      <div className={styles['navbarTop']}>
        <div className={styles['navbarTitle']}>Nutrica</div>
        <div className={styles['navbarBtns']}>
          <button className={styles['navbarBtn']}>Input</button>
          <button className={styles['navbarBtn']}>Scan +</button>
        </div>
      </div>
      <div className={styles['navbarBottom']}>
        {tabs.map((tab, idx) => (
          <div
            key={tab}
            className={`${styles['navbarTab']}${currentTab === idx ? ' ' + styles['navbarTabActive'] : ''}`}
            onClick={() => navigate(idx === 0 ? '/' : '/' + tab.toLowerCase())}
          >
            {tab}
          </div>
        ))}
        {!isLoggedIn ? (
          <div className={styles['navbarLogin']} onClick={() => navigate('/log-in')}>Log In</div>
        ) : (
          <button
            className={styles['navbarAvatar']}
            onClick={() => navigate('/account')}
            title={userEmail}
          >
            {getInitial(userEmail)}
          </button>
        )}
      </div>
    </div>
  );
}
