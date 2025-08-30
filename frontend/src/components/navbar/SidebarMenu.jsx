import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SidebarMenu.module.css';
import { icons } from '../../utils';

export default function SidebarMenu({ open, onClose, isLoggedIn = false }) {
  const navigate = useNavigate();
  const [show, setShow] = useState(open);
  const [animate, setAnimate] = useState(false);
  const timerRef = useRef(null);

  // 控制show的变化
  useEffect(() => {
    if (open) {
      setShow(true);
    } else if (show) {
      setAnimate(false);
      timerRef.current = setTimeout(() => setShow(false), 600); // 动画时长0.6s
    }
    return () => clearTimeout(timerRef.current);
  }, [open]);

  // show变为true后，下一帧再加open类
  useEffect(() => {
    if (show && open) {
      requestAnimationFrame(() => setAnimate(true));
    }
  }, [show, open]);

  if (!show) return null;

  return (
    <>
      <div 
        className={`${styles.backdrop}${animate ? ` ${styles.backdropOpen}` : ""}`} 
        onClick={onClose}
      ></div>
      <div className={`${styles.sidebar}${animate ? ` ${styles.sidebarOpen}` : ""}`}>
        <div className={styles.closeBtn} onClick={onClose}>
          <img src={icons.close} alt="Close" width="24" height="24" />
        </div>
        <div className={styles.sidebarGroup}>
          <div className={styles.sidebarItem} onClick={() => { navigate('/'); onClose(); }}>
            <span className={styles.symbol}>
              <img src={icons.home} alt="Home" width="24" height="24" />
            </span>
            <span className="h4">Home</span>
          </div>
          <div className={styles.sidebarItem} onClick={() => { navigate('/my-collections'); onClose(); }}>
            <span className={styles.symbol}>
              <img src={icons.collection} alt="Achievement" width="24" height="24" />
            </span>
            <span className="h4">My Collections</span>
          </div>
          {isLoggedIn && (
            <div className={styles.sidebarItem} onClick={() => { navigate('/account'); onClose(); }}>
              <span className={styles.symbol}>
                <img src={icons.account} alt="Account" width="24" height="24" />
              </span>
              <span className="h4">Account</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 