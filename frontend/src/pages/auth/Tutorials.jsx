import React, { useState } from 'react';
import NavLogo from '../../components/navbar/Nav-Logo';
import styles from './Auth.module.css';

const tabs = ['Safari', 'Chrome', 'Edge', 'Other'];

export default function Tutorials({ isLoggedIn, userEmail }) {
  const [active, setActive] = useState(0);
  return (
    <div className="home-root">
      <NavLogo isLoggedIn={isLoggedIn} />
      <div className={styles['tutorial-main']}>
        <div className={styles['tutorial-title']}>Camera Permission Helper</div>
        <div className={styles['tutorial-tabs']}>
          {tabs.map((tab, idx) => (
            <div
              key={tab}
              className={`${styles['tutorial-tab']}${active === idx ? ' ' + styles['tutorial-tab-active'] : ''}`}
              onClick={() => setActive(idx)}
            >
              {tab}
              {active === idx && <span className={styles['tutorial-indicator']} />}
            </div>
          ))}
        </div>
        <div className={styles['tutorial-step']}>
          <div className={styles['tutorial-step-title']}>Step 1</div>
          <div className={styles['tutorial-step-desc']}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam</div>
          <div className={styles['tutorial-img']}></div>
        </div>
        <div className={styles['tutorial-step']}>
          <div className={styles['tutorial-step-title']}>Step 2</div>
          <div className={styles['tutorial-step-desc']}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam</div>
          <div className={styles['tutorial-img']}></div>
        </div>
      </div>
    </div>
  );
} 