import React, { useEffect, useState } from 'react';
import styles from './Toast.module.css';

export default function Toast({ message, type = 'error', show, onClose, duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onClose && onClose();
        }, 300); // 等待动画完成
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show && !isVisible) return null;

  return (
    <div className={`${styles.toast} ${styles[type]} ${isVisible ? styles.show : ''}`}>
      <div className={styles.toastIcon}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="12" fill="#D03535"/>
          <path d="M12.713 16.712C12.521 16.904 12.2833 17 12 17C11.718 17.0013 11.4807 16.9057 11.288 16.713C11.0953 16.5203 10.9993 16.2827 11 16C11.0007 15.7173 11.0967 15.48 11.288 15.288C11.4793 15.096 11.7167 15 12 15C12.2833 15 12.5207 15.096 12.712 15.288C12.9033 15.48 12.9993 15.7173 13 16C13.0007 16.2827 12.905 16.52 12.713 16.712Z" fill="white"/>
          <path d="M12.713 12.712C12.521 12.904 12.2833 13 12 13C11.7173 13.0007 11.48 12.905 11.288 12.713C11.096 12.521 11 12.2833 11 12V8C11 7.718 11.096 7.48067 11.288 7.288C11.48 7.09534 11.7173 6.99934 12 7C12.2827 7.00067 12.52 7.09667 12.712 7.288C12.904 7.47934 13 7.71667 13 8V12C13.0007 12.2827 12.905 12.52 12.713 12.712Z" fill="white"/>
        </svg>
      </div>
      <span className={`${styles.toastText} body2`}>{message}</span>
    </div>
  );
} 