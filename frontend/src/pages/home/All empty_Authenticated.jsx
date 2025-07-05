import React from 'react';
import NavBar from '../../components/navbar/NavBar';
import styles from './Home.module.css';

export default function AllEmptyAuthenticated(props) {
  return (
    <div className={styles['home-root']}>
      <NavBar isLoggedIn={props.isLoggedIn} userEmail={props.userEmail} />
      <div className={styles['home-main']}>
        {/* Today 标题 */}
        <div className={styles['home-title']}>Today</div>
        {/* Goal 区块 */}
        <div className={styles['home-section']}>
          <div className={styles['home-section-header']}>
            <span>Goal</span>
            <span className={styles['home-section-arrow']}>→</span>
          </div>
          <div className={styles['home-card']}>
            <div className={styles['home-card-img']} />
            <span className={styles['home-card-label']}>Set up a goal</span>
            <span className={styles['home-card-plus']}>+</span>
          </div>
        </div>
        {/* Meals 区块 */}
        <div className={styles['home-section']}>
          <div className={styles['home-section-header']}>
            <span>Meals</span>
            <span className={styles['home-section-arrow']}>→</span>
          </div>
          <div className={styles['home-card']}>
            <div className={styles['home-card-img']} />
            <span className={styles['home-card-label']}>Scan nutrition fact label</span>
            <span className={styles['home-card-plus']}>+</span>
          </div>
          <div className={styles['home-card']}>
            <div className={styles['home-card-img']} />
            <span className={styles['home-card-label']}>Input nutrition values</span>
            <span className={styles['home-card-plus']}>+</span>
          </div>
        </div>
      </div>
    </div>
  );
} 