import React from 'react';
import { NavLogo, NavMenu } from '../../components/navbar';
import styles from './Home.module.css';
import '../../index.css';

export default function AllEmptyAuthenticated(props) {
  return (
    <div className={styles['home-root']}>
      <NavLogo />
      <NavMenu isLoggedIn={props.isLoggedIn} userEmail={props.userEmail} />
      <main className={styles['home-main']}>
        {/* Daily Goal Section */}
        <section className={styles['home-section']}>
          <header className={styles['home-section-header']}>
            <span className="h1">Daily Goal</span>
            <span className={styles['home-section-arrow']}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <g clipPath="url(#clip0_159_6029)">
                  <path d="M8.58984 16.59L13.1698 12L8.58984 7.41L9.99984 6L15.9998 12L9.99984 18L8.58984 16.59Z" fill="black"/>
                </g>
                <defs>
                  <clipPath id="clip0_159_6029">
                    <rect width="24" height="24" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </span>
          </header>
          <div className={styles['home-card']}>
            <div className={styles['home-card-icon']}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="27" viewBox="0 0 28 27" fill="none">
                <path d="M14 21.375C13.6813 21.375 13.4142 21.267 13.199 21.051C12.983 20.8357 12.875 20.5688 12.875 20.25V14.625H7.25C6.93125 14.625 6.66388 14.517 6.44788 14.301C6.23263 14.0857 6.125 13.8188 6.125 13.5C6.125 13.1813 6.23263 12.9139 6.44788 12.6979C6.66388 12.4826 6.93125 12.375 7.25 12.375H12.875V6.75C12.875 6.43125 12.983 6.16388 13.199 5.94788C13.4142 5.73263 13.6813 5.625 14 5.625C14.3188 5.625 14.5861 5.73263 14.8021 5.94788C15.0174 6.16388 15.125 6.43125 15.125 6.75V12.375H20.75C21.0688 12.375 21.3357 12.4826 21.551 12.6979C21.767 12.9139 21.875 13.1813 21.875 13.5C21.875 13.8188 21.767 14.0857 21.551 14.301C21.3357 14.517 21.0688 14.625 20.75 14.625H15.125V20.25C15.125 20.5688 15.0174 20.8357 14.8021 21.051C14.5861 21.267 14.3188 21.375 14 21.375Z" fill="black"/>
              </svg>
            </div>
            <span className="h5" style={{flex: '1 0 0'}}>Set up a goal</span>
          </div>
        </section>
        {/* Today's Meals Section */}
        <section className={styles['home-section']}>
          <header className={styles['home-section-header']}>
            <span className="h1">Today's Meals</span>
            <span className={styles['home-section-arrow']}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <g clipPath="url(#clip0_159_6115)">
                  <path d="M8.58984 16.59L13.1698 12L8.58984 7.41L9.99984 6L15.9998 12L9.99984 18L8.58984 16.59Z" fill="black"/>
                </g>
                <defs>
                  <clipPath id="clip0_159_6115">
                    <rect width="24" height="24" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </span>
          </header>
          <div className={`${styles['home-card']} ${styles['home-card-qr']}`} style={{height: '80px'}}>
            <div className={`${styles['home-card-icon']} ${styles['home-card-icon-qr']}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <g clipPath="url(#clip0_159_6249)">
                  <path d="M19 14H5V17H19V14ZM19 7H5V10H19V7ZM22 7H20V4H17V2H22V7ZM22 22V17H20V20H17V22H22ZM2 22H7V20H4V17H2V22ZM2 2V7H4V4H7V2H2Z" fill="black"/>
                </g>
                <defs>
                  <clipPath id="clip0_159_6249">
                    <rect width="24" height="24" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
            <span className="h5" style={{flex: '1 0 0'}}>Scan nutrition fact label</span>
          </div>
          <div className={styles['home-card']} style={{height: '80px'}}>
            <div className={styles['home-card-icon']}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 21.875C13.6813 21.875 13.4142 21.767 13.199 21.551C12.983 21.3357 12.875 21.0688 12.875 20.75V15.125H7.25C6.93125 15.125 6.66388 15.017 6.44788 14.801C6.23263 14.5857 6.125 14.3188 6.125 14C6.125 13.6813 6.23263 13.4139 6.44788 13.1979C6.66388 12.9826 6.93125 12.875 7.25 12.875H12.875V7.25C12.875 6.93125 12.983 6.66388 13.199 6.44788C13.4142 6.23263 13.6813 6.125 14 6.125C14.3188 6.125 14.5861 6.23263 14.8021 6.44788C15.0174 6.66388 15.125 6.93125 15.125 7.25V12.875H20.75C21.0688 12.875 21.3357 12.9826 21.551 13.1979C21.767 13.4139 21.875 13.6813 21.875 14C21.875 14.3188 21.767 14.5857 21.551 14.801C21.3357 15.017 21.0688 15.125 20.75 15.125H15.125V20.75C15.125 21.0688 15.0174 21.3357 14.8021 21.551C14.5861 21.767 14.3188 21.875 14 21.875Z" fill="black"/>
              </svg>
            </div>
            <span className="h5" style={{flex: '1 0 0'}}>Input nutrition values</span>
          </div>
        </section>
      </main>
    </div>
  );
} 