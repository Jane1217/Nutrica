import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  const handlePrivacyNoticeClick = () => {
    try {
      window.open('/privacy-notice', '_blank');
    } catch (error) {
      console.error('Failed to open new tab:', error);
      window.location.href = '/privacy-notice';
    }
  };

  const handleAboutClick = () => {
    try {
      window.open('/about', '_blank');
    } catch (error) {
      console.error('Failed to open new tab:', error);
      window.location.href = '/about';
    }
  };

  return (
    <div className={styles.footerContainer}>
      {/* Vector分隔线 */}
      <div className={styles.vector}></div>
      
      {/* Footer文本 */}
      <div className={styles.footer}>
        <div 
          className={`h4 ${styles.footerLeft} ${styles.clickable}`}
          onClick={handlePrivacyNoticeClick}
        >
          Privacy Notice
        </div>
        <div 
          className={`h4 ${styles.footerCenter} ${styles.clickable}`}
          onClick={handleAboutClick}
        >
          About
        </div>
        <div className={`h4 ${styles.footerRight}`}>© 2025 Nutrica</div>
      </div>
    </div>
  );
}
