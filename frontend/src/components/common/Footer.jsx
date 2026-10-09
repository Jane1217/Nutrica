import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <div className={styles.footerContainer}>
      {/* Vector分隔线 */}
      <div className={styles.vector}></div>
      
      {/* Footer文本 */}
      <div className={styles.footer}>
        <Link className={`h4 ${styles.footerLeft} ${styles.clickable}`} to="/privacy-notice">
          Privacy Notice
        </Link>
        <Link className={`h4 ${styles.footerCenter} ${styles.clickable}`} to="/about">
          About
        </Link>
        <div className={`h4 ${styles.footerRight}`}>© 2025 Nutrica</div>
      </div>
    </div>
  );
}
