import React from 'react';
import styles from './Banner.module.css';
import image11 from './images/image-11.png';
import image14 from './images/image-14.png';

export default function Banner() {
  return (
    <div className={styles['banner-wrapper']}>
      <div className={styles['banner']}>
        <span className={styles['text']}>
          Sign up to save and access nutrition records across devices
        </span>
        <div className={styles['group64']}>
          <div className={styles['group61']}>
            <div className={styles['image11']} style={{backgroundImage: `url(${image11})`}} />
          </div>
          <div className={styles['group63']}>
            <div className={styles['exVector']}>
              <svg xmlns="http://www.w3.org/2000/svg" width="31" height="37" viewBox="0 0 31 37" fill="none">
                <path d="M30.6707 18.3721C30.6717 13.9618 27.9129 10.0383 22.9939 8.34461L25.8055 3.84521L15.4627 7.57389L18.308 15.8436L21.1196 11.3442C24.8038 12.6128 26.8728 15.5602 26.8733 18.8691C26.8736 20.4608 26.3952 22.1363 25.3876 23.7488C24.441 25.2636 23.1292 26.5615 21.6095 27.5509L22.6481 30.5693C25.0867 29.1673 27.2133 27.2387 28.6846 24.884C30.0305 22.7301 30.6703 20.4947 30.6707 18.3721Z" fill="#162B08"/>
              </svg>
            </div>
            <div className={styles['group62']}>
              <div className={styles['vector']}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="39" viewBox="0 0 28 39" fill="none">
                  <rect width="27.896" height="38.908" rx="13.948" transform="rotate(29.269 0 0)" fill="#C8C8C8"/>
                </svg>
              </div>
              <div className={styles['image14']} style={{backgroundImage: `url(${image14})`}} />
              <div className={styles['rectangle']} />
            </div>
          </div>
        </div>
        <div className={styles['arrow-forward']}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="black"/>
            <path d="M16.0003 10.6667L15.0603 11.6067L18.7803 15.3334H10.667V16.6667H18.7803L15.0603 20.3934L16.0003 21.3334L21.3337 16.0001L16.0003 10.6667Z" fill="black"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
