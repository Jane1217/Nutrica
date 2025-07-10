import React from 'react';
import styles from './DateDisplayBox.module.css';

function formatToday() {
  const now = new Date();
  const week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${week[now.getDay()]}, ${month[now.getMonth()]} ${now.getDate()}`;
}

export default function DateDisplayBox() {
  return (
    <div className={styles.root}>
      <div className={styles.groupOuter}>
        <div className={styles.groupInner}>
          <span className={styles.arrow}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9.12505 21.0999L0.700049 12.6999C0.600049 12.5999 0.529382 12.4916 0.488049 12.3749C0.446049 12.2582 0.425049 12.1332 0.425049 11.9999C0.425049 11.8666 0.446049 11.7416 0.488049 11.6249C0.529382 11.5082 0.600049 11.3999 0.700049 11.2999L9.12505 2.8749C9.35838 2.64157 9.65005 2.5249 10 2.5249C10.35 2.5249 10.65 2.6499 10.9 2.8999C11.15 3.1499 11.275 3.44157 11.275 3.7749C11.275 4.10824 11.15 4.3999 10.9 4.6499L3.55005 11.9999L10.9 19.3499C11.1334 19.5832 11.25 19.8706 11.25 20.2119C11.25 20.5539 11.125 20.8499 10.875 21.0999C10.625 21.3499 10.3334 21.4749 10 21.4749C9.66672 21.4749 9.37505 21.3499 9.12505 21.0999Z" fill="#22221B" fillOpacity="0.6"/>
            </svg>
          </span>
          <span className={`${styles.dateText} h4`}>{formatToday()}</span>
          <span className={styles.arrow}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M14.875 2.9001L23.3 11.3001C23.4 11.4001 23.4706 11.5084 23.512 11.6251C23.554 11.7418 23.575 11.8668 23.575 12.0001C23.575 12.1334 23.554 12.2584 23.512 12.3751C23.4706 12.4918 23.4 12.6001 23.3 12.7001L14.875 21.1251C14.6416 21.3584 14.35 21.4751 14 21.4751C13.65 21.4751 13.35 21.3501 13.1 21.1001C12.85 20.8501 12.725 20.5584 12.725 20.2251C12.725 19.8918 12.85 19.6001 13.1 19.3501L20.45 12.0001L13.1 4.6501C12.8666 4.41676 12.75 4.12943 12.75 3.7881C12.75 3.4461 12.875 3.1501 13.125 2.9001C13.375 2.6501 13.6666 2.5251 14 2.5251C14.3333 2.5251 14.625 2.6501 14.875 2.9001Z" fill="#22221B" fillOpacity="0.6"/>
            </svg>
          </span>
        </div>
        <span className={`${styles.todayText} h5`}>Today</span>
      </div>
    </div>
  );
} 