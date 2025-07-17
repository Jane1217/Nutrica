import React, { useState } from 'react';
import NavLogo from '../../components/navbar/Nav-Logo';
import LogIn from '../auth/pages/Log In';
import SignUp from '../auth/pages/Sign up';
import ForgotPassword from '../auth/pages/ForgotPassword';
import styles from './Welcome.module.css';

export default function Welcome() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

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
      <LogIn
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onAuth={() => setShowLoginModal(false)}
        onSwitchToSignUp={() => {
          setShowLoginModal(false);
          setShowSignUpModal(true);
        }}
        onSwitchToForgotPassword={() => {
          setShowLoginModal(false);
          setShowForgotPasswordModal(true);
        }}
      />
      {/* 注册弹窗 */}
      <SignUp
        open={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onAuth={() => setShowSignUpModal(false)}
        onSwitchToLogin={() => {
          setShowSignUpModal(false);
          setShowLoginModal(true);
        }}
      />
      {/* 忘记密码弹窗 */}
      <ForgotPassword
        open={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        onBackToLogin={() => {
          setShowForgotPasswordModal(false);
          setShowLoginModal(true);
        }}
      />
    </div>
  );
} 