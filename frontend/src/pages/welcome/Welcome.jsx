import React, { useState } from 'react';
import NavLogo from '../../components/navbar/Nav-Logo';
import LogIn from '../auth/Log In';
import SignUp from '../auth/Sign up';
import styles from './Welcome.module.css';

export default function Welcome() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  return (
    <div className={styles.welcomeRoot}>
      {/* 顶部Logo和登录按钮 */}
      <div className={styles.header}>
        <NavLogo hideEat />
        <button
          className={styles.loginBtn}
          onClick={() => setShowLoginModal(true)}
        >
          Log in
        </button>
      </div>
      {/* 中间内容 */}
      <div className={styles.centerContent}>
        <h1 className={styles.title}>
          Collect your<br />nutrition puzzles
        </h1>
        <p className={styles.desc}>
          Capture, savor, and share your everyday nutrition journey. Create a free account to celebrate your healthy eating moments.
        </p>
        <button
          className={styles.getStartedBtn}
          onClick={() => setShowSignUpModal(true)}
        >
          Get started
        </button>
      </div>
      {/* 登录弹窗 */}
      {showLoginModal && (
        <LogIn onAuth={() => setShowLoginModal(false)} />
      )}
      {/* 注册弹窗 */}
      {showSignUpModal && (
        <SignUp onAuth={() => setShowSignUpModal(false)} />
      )}
    </div>
  );
} 