import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SidebarMenu.module.css';

export default function SidebarMenu({ open, onClose, isLoggedIn = false }) {
  const navigate = useNavigate();
  if (!open) return null;
  return (
    <>
      <div className={styles.backdrop} onClick={onClose}></div>
      <div className={styles.sidebar}>
        <div className={styles.closeBtn} onClick={onClose}>
          <img src="/assets/material-symbols_close-rounded.svg" alt="Close" width="24" height="24" />
        </div>
        <div className={styles.sidebarGroup}>
          <div className={styles.sidebarItem} onClick={() => { navigate('/'); onClose(); }}>
            <span className={styles.symbol}>
              <img src="/assets/material-symbols_home-rounded.svg" alt="Home" width="24" height="24" />
            </span>
            <span className="h4">Home</span>
          </div>
          <div className={styles.sidebarItem}>
            <span className={styles.symbol}>
              <img src="/assets/fluent_collections-empty-16-filled.svg" alt="Achievement" width="24" height="24" />
            </span>
            <span className="h4">Achievement</span>
          </div>
          {isLoggedIn && (
            <div className={styles.sidebarItem} onClick={() => { navigate('/account'); onClose(); }}>
              <span className={styles.symbol}>
                <img src="/assets/mdi_account.svg" alt="Account" width="24" height="24" />
              </span>
              <span className="h4">Account</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 