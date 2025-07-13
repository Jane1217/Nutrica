import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import InputField from '../../components/auth/InputField';
import ModalWrapper from '../../components/ModalWrapper';
import styles from './Auth.module.css';
import '../../index.css';

export default function LogIn({ open, onClose, onAuth, onSwitchToSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message && error.message.toLowerCase().includes('email not confirmed')) {
        setError('Please verify your email address by clicking the confirmation link sent to your inbox.');
      } else {
        setError(error.message);
      }
    } else {
      onAuth && onAuth();
      navigate('/');
    }
  };

  return (
    <ModalWrapper open={open} onClose={onClose}>
      <main className={styles.loginMainContent}>
        <header className={styles.loginHeader}>
          <div className={`${styles.loginOverline1} h6`}>Welcome to Nutrica</div>
          <div className={`${styles.loginOverline2} h1`}>Log In</div>
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
          <button className={`${styles.loginBtn} h5`} onClick={e => { e.preventDefault(); handleLogin(e); }}>Log In</button>
        </div>
        <div className={styles.actionModule}>
          <span className={`${styles.actionModuleText} body1`}>New to Nutrica?</span>
          <button className={`${styles.actionModuleBtn} h5`} onClick={onSwitchToSignUp}>
            Create Free Account
          </button>
        </div>
      </main>
    </ModalWrapper>
  );
} 