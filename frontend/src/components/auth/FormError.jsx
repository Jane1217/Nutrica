import React from 'react';
import styles from './InputField.module.css';

// Form-level error with the same icon, colour and typography as the inline
// field errors, so it lines up with the inputs instead of looking like a
// separate widget.
export default function FormError({ message, className = '' }) {
  if (!message) return null;
  return (
    <div className={`${styles.errorWrapper} ${className}`.trim()} role="alert">
      <span className={styles.errorIcon}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none" aria-hidden="true">
          <path d="M10 2.16675C5.4 2.16675 1.66666 5.90008 1.66666 10.5001C1.66666 15.1001 5.4 18.8334 10 18.8334C14.6 18.8334 18.3333 15.1001 18.3333 10.5001C18.3333 5.90008 14.6 2.16675 10 2.16675ZM10.8333 14.6667H9.16666V13.0001H10.8333V14.6667ZM10.8333 11.3334H9.16666V6.33341H10.8333V11.3334Z" fill="#D03535"/>
        </svg>
      </span>
      <span className={`${styles.errorText} h5`}>{message}</span>
    </div>
  );
}
