import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Nav-Menu.module.css';

export default function NavMenu({ isLoggedIn, userEmail }) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: 'Home', path: '/home' },
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

  return (
    <div className={styles.navMenuRoot}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {tabs.map((tab) => {
          const isSelected = location.pathname === tab.path;
          return (
            <button
              key={tab.name}
              className={isSelected ? styles.menuItemSelected : styles.menuItem}
              onClick={() => handleTabClick(tab.path)}
            >
              <span className={styles.text}>{tab.name}</span>
            </button>
          );
        })}
      </div>
      <div>
        {isLoggedIn ? (
          <button className={styles.accountCircle} onClick={handleAuthClick}>
            <span className={styles.T}>{getInitial(userEmail)}</span>
          </button>
        ) : (
          <button className={styles.button} onClick={handleAuthClick}>
            <span className={styles.text}>Log In</span>
          </button>
        )}
      </div>
    </div>
  );
} 