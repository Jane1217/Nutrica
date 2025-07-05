import React from 'react';
import NavBar from '../../components/navbar/NavBar';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

export default function AllEmpty(props) {
  const navigate = useNavigate();
  return (
    <div className={styles['home-root']}>
      <NavBar isLoggedIn={props.isLoggedIn} userEmail={props.userEmail} />
      <div className={styles['home-main']}>
        {/* 注册提示卡片：仅未登录时显示 */}
        {!props.isLoggedIn && (
          <div className={styles['home-signup-card']} onClick={() => navigate('/sign-up')} style={{ cursor: 'pointer' }}>
            <span className={styles['home-signup-text']}>
              Sign up to save and access nutrition records across devices
            </span>
            <span className={styles['home-signup-arrow']}>→</span>
          </div>
        )}
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