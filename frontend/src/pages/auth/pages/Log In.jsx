import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import InputField from '../../../components/auth/InputField';
import BottomButton from '../../../components/common/BottomButton';
import ModalWrapper from '../../../components/common/ModalWrapper';
import Toast from '../../../components/common/Toast';
import styles from '../styles/Auth.module.css';
import '../../../index.css';

export default function LogIn({ open, onClose, onAuth, onSwitchToSignUp, onSwitchToForgotPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message && error.message.toLowerCase().includes('email not confirmed')) {
          setError('Please verify your email address by clicking the confirmation link sent to your inbox.');
        } else {
          // 显示 Toast 错误通知
          setToastMessage('Incorrect email or password');
          setShowToast(true);
        }
      } else {
        onAuth && onAuth();
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      // 检查是否是网络错误
      if (err.message && (err.message.includes('fetch') || err.message.includes('network') || err.message.includes('connection'))) {
        setToastMessage('No Internet connection. Try again.');
      } else {
        setToastMessage('Incorrect email or password');
      }
      setShowToast(true);
    }
  };

  const handleSwitchToSignUp = () => {
    if (onSwitchToSignUp) {
      // 如果在模态框模式下，使用onSwitchToSignUp
      onSwitchToSignUp();
    } else {
      // 如果在独立页面模式下，使用路由导航
      onClose && onClose();
      navigate('/sign-up');
    }
  };

  const handleForgotPassword = () => {
    if (onSwitchToForgotPassword) {
      onSwitchToForgotPassword();
    }
  };

  return (
    <>
      <Toast 
        message={toastMessage}
        type="error"
        show={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />
      <ModalWrapper open={open} onClose={onClose} size="auth">
        <main className={styles.loginMainContent}>
          <header className={styles.loginHeader}>
            <div className={styles.headerRow}>
              <div className={`${styles.loginOverline2} h2`}>Log In</div>
              <button className={styles.loginCloseButton} onClick={onClose}>
                <img src="/assets/close.svg" alt="Close" width="20" height="20" />
              </button>
            </div>
          </header>
          <div className={styles.inputWrapper}>
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              error={null}
            />
            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              error={error || null}
            />
          </div>
          <div className={styles.actionGroup}>
            <BottomButton onClick={e => { e.preventDefault(); handleLogin(e); }}>
              Log In
            </BottomButton>
            <button className={`${styles.forgotPasswordBtn} h4`} onClick={handleForgotPassword} style={{fontWeight: 700}}>Forgot Password</button>
          </div>
          <div className={styles.actionModule}>
            <span className={`${styles.actionModuleText} body1`}>New to Nutrica?</span>
            <button className={`${styles.actionModuleBtn} h4`} onClick={handleSwitchToSignUp} style={{fontWeight: 700}}>Create Free Account</button>
          </div>
        </main>
      </ModalWrapper>
    </>
  );
} 