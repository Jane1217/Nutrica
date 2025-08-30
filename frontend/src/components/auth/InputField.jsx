import React from 'react';
import styles from './InputField.module.css';

export default function InputField({ label, type = 'text', value, onChange, error }) {
  return (
    <div className={styles.inputFieldRoot}>
      <label className={`${styles.inputLabel} h6`}>{label}</label>
      <div className={`${styles.inputFieldBox} ${error ? styles.inputFieldBoxError : ''}`}>
        <input
          className={`${styles.inputFieldInput} body1`}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </div>
      {error && (
        <div className={styles.errorWrapper}>
          <span className={styles.errorIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
              <g clipPath="url(#clip0_1009_317)">
                <path d="M10 2.16675C5.4 2.16675 1.66666 5.90008 1.66666 10.5001C1.66666 15.1001 5.4 18.8334 10 18.8334C14.6 18.8334 18.3333 15.1001 18.3333 10.5001C18.3333 5.90008 14.6 2.16675 10 2.16675ZM10.8333 14.6667H9.16666V13.0001H10.8333V14.6667ZM10.8333 11.3334H9.16666V6.33341H10.8333V11.3334Z" fill="#D03535"/>
              </g>
              <defs>
                <clipPath id="clip0_1009_317">
                  <rect width="20" height="20" fill="white" transform="translate(0 0.5)"/>
                </clipPath>
              </defs>
            </svg>
          </span>
          <span className={`${styles.errorText} h5`}>{error}</span>
        </div>
      )}
    </div>
  );
} 