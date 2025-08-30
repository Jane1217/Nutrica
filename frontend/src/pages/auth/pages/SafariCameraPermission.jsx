import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/SafariCameraPermission.module.css';

export default function SafariCameraPermission() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      {/* 顶部导航栏 */}
      <div className={styles.header}>
        <img 
          src="/assets/logo.svg" 
          alt="Nutrica Logo" 
          className={styles.logo}
        />
      </div>

      {/* 主要内容 */}
      <div className={styles.content}>
        <h1 className={`${styles.title} h1`}>Safari Camera Permission Setup</h1>
        
        <div className={`${styles.introduction} body1`}>
          <p>
            While we are building the native app version of Nutrica, here's what you can do to avoid repeated camera permission popups by enabling full camera access for seamless scanning on Nutrica.life, with Safari.
          </p>
        </div>
        <svg
          className={styles.divider}
          xmlns="http://www.w3.org/2000/svg"
          width="327"
          height="2"
          viewBox="0 0 327 2"
          fill="none"
        >
          <path d="M0 1H327" stroke="var(--Brand-Outline, #DBE2D0)" strokeWidth="1" />
        </svg>

        <div className={`${styles.prerequisite} body1`}>
          <p>Prerequisite: You must have used nutrition label scanning at least once.</p>
        </div>

        <div className={styles.steps}>
          <div className={`${styles.step} body1`}>
            <span className={styles.stepText}>1. Go to <strong>Settings</strong> {'>'} <strong>Apps</strong> {'>'} <strong>Safari</strong>.</span>
          </div>
          
          <div className={`${styles.step} body1`}>
            <span className={styles.stepText}>2. Tap <strong>Camera</strong>.</span>
          </div>
          
          <div className={`${styles.step} body1`}>
            <span className={styles.stepText}>3. In the <strong>CAMERA ACCESS ON</strong> section, tap "Nutrica.life".</span>
          </div>
          
          <div className={`${styles.step} body1`}>
            <span className={styles.stepText}>4. Tap <strong>Allow</strong>.</span>
          </div>
        </div>

        {/* 设置界面示例 */}
        <div className={styles.settingsExample}>
          <img 
            src="/assets/safari setup.png" 
            alt="Safari Camera Permission Setup Example" 
            className={styles.settingsImage}
          />
        </div>
      </div>
    </div>
  );
} 