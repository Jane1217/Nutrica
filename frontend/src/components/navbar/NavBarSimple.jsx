import React from 'react';
import styles from './NavBar.module.css';

export default function NavBarSimple() {
  return (
    <div className={styles['navbarRoot']}>
      <div className={styles['navbarTop']}>
        <div className={styles['navbarTitle']}>Nutrica</div>
      </div>
    </div>
  );
} 