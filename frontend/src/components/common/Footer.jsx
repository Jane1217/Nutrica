import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <div className={styles.footerContainer}>
      {/* Vector分隔线 */}
      <div className={styles.vector}></div>
      
      {/* Footer文本 */}
      <div className={styles.footer}>
        <div className={`h4 ${styles.footerLeft}`}>Privacy Notice</div>
        <div className={`h4 ${styles.footerCenter}`}>About</div>
        <div className={`h4 ${styles.footerRight}`}>© 2025 Nutrica</div>
      </div>
    </div>
  );
}
