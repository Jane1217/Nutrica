import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Nav-Menu.module.css';

export default function NavMenu({ isLoggedIn, userEmail }) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: 'Home', path: '/' },
    { name: 'Meals', path: '/meals' },
    { name: 'Goal', path: '/goal' }
  ];

  const getInitial = (email) => {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  };

  const handleTabClick = (path) => {
    navigate(path);
  };

  const handleAuthClick = () => {
    if (isLoggedIn) {
      navigate('/account-settings');
    } else {
      navigate('/log-in');
    }
  };

  // 判断tab是否高亮
  const isTabSelected = (tab) => {
    if (tab.path === '/') return location.pathname === '/';
    return location.pathname.startsWith(tab.path);
  };

  return (
    <div className={styles.navMenuRoot}>
      <div className={styles.tabWrap}>
        {tabs.map((tab) => {
          return (
            <button
              key={tab.name}
              className={isTabSelected(tab) ? `${styles.tabItem} ${styles.tabSelected}` : styles.tabItem}
              onClick={() => handleTabClick(tab.path)}
            >
              <span className="h4">{tab.name}</span>
            </button>
          );
        })}
      </div>
      <div className={styles.authWrap}>
        {isLoggedIn ? (
          <button className={styles.avatarBtn} onClick={handleAuthClick}>
            <span className={styles.avatarText}>{getInitial(userEmail)}</span>
          </button>
        ) : (
          <button className={styles.loginBtn} onClick={handleAuthClick}>
            <span className="h5">Log In</span>
          </button>
        )}
      </div>
    </div>
  );
} 