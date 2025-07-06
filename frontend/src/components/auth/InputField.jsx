import React from 'react';
import styles from './InputField.module.css';

export default function InputField({ label, type = 'text', value, onChange, error }) {
  return (
    <div className={styles.inputFieldRoot}>
      <label className={`${styles.inputLabel} h6`}>{label}</label>
      <div className={styles.inputFieldBox}>
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
              <g clipPath="url(#clip0_180_89)">
                <path d="M9.99984 2.16663C5.39984 2.16663 1.6665 5.89996 1.6665 10.5C1.6665 15.1 5.39984 18.8333 9.99984 18.8333C14.5998 18.8333 18.3332 15.1 18.3332 10.5C18.3332 5.89996 14.5998 2.16663 9.99984 2.16663ZM10.8332 14.6666H9.1665V13H10.8332V14.6666ZM10.8332 11.3333H9.1665V6.33329H10.8332V11.3333Z" fill="#E16A60"/>
              </g>
              <defs>
                <clipPath id="clip0_180_89">
                  <rect width="20" height="20" fill="white" transform="translate(0 0.5)"/>
                </clipPath>
              </defs>
            </svg>
          </span>
          <span className={`${styles.errorText} h6`}>{error}</span>
        </div>
      )}
    </div>
  );
} 