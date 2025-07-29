import React from 'react';
import styles from './LoadingState.module.css';

export default function LoadingState({ 
  message = "Loading...",
  className = ""
}) {
  return (
    <div className={`${styles.loadingPage} ${className}`}>
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          {message && <span className="body1">{message}</span>}
        </div>
      </div>
    </div>
  );
} 