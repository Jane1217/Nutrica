import React from 'react';
import styles from './LoadingState.module.css';

export default function LoadingState({ 
  title = "My Collections", 
  message = "Loading collections...",
  className = ""
}) {
  return (
    <div className={`${styles.loadingPage} ${className}`}>
      <div className={styles.container}>
        <h1 className={`${styles.title} h1`}>{title}</h1>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <span className="body1">{message}</span>
        </div>
      </div>
    </div>
  );
} 