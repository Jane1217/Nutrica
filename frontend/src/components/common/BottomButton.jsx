import React from 'react';
import styles from './BottomButton.module.css';

export default function BottomButton({ 
  children, 
  onClick, 
  type = 'button', 
  disabled = false, 
  isLoading = false,
  loadingText = 'Loading...',
  className = '',
  style = {}
}) {
  return (
    <div className={`${styles.bottomButtonContainer} ${className}`} style={style}>
      <button 
        type={type} 
        className={`h4 ${styles.bottomButton}`}
        disabled={disabled || isLoading} 
        onClick={onClick}
      >
        {isLoading ? loadingText : children}
      </button>
    </div>
  );
} 