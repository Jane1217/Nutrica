import React from 'react';
import styles from './EmptyState.module.css';

export default function EmptyState({ 
  title = "My Collections", 
  heading = "No puzzle collection yet!", 
  text = "Choose a nutrition puzzle from homepage and reach your daily nutrition goal to collect puzzles.",
  className = ""
}) {
  return (
    <div className={`${styles.emptyPage} ${className}`}>
      <div className={styles.container}>
        <h1 className={`${styles.title} h1`}>{title}</h1>
        <div className={styles.emptyContainer}>
          <span className={`${styles.emptyHeading} h3`}>{heading}</span>
          <span className={`${styles.emptyText} body2`}>{text}</span>
        </div>
      </div>
    </div>
  );
} 