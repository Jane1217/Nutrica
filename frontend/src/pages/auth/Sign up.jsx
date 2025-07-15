import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import InputField from '../../components/auth/InputField';
import ModalWrapper from '../../components/ModalWrapper';
import styles from './Auth.module.css';
import '../../index.css';

export default function SignUp({ open, onClose, onAuth, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const { data: emailExists, error: rpcError } = await supabase.rpc('check_email_exists', {
        email_to_check: email
      });
      if (rpcError) {
        console.error('RPC function error:', rpcError);
      } else if (emailExists) {
        setError('Email already registered.');
        return;
      }
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Sign up successful! Please check your email and click the confirmation link to activate your account.');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <ModalWrapper open={open} onClose={onClose}>
      <main className={styles.signupMainContent}>
        <header className={styles.signupHeader}>
          <div className={`${styles.signupOverline1} h6`}>Welcome to Nutrica</div>
          <div className={`${styles.signupOverline2} h1`}>Create Free Account</div>
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
            error={error ? "Password doesn't meet requirements" : null}
          />
          <div className={`${styles.signupHintText} body2`}>Password must be at least 8 characters and contain letters and numbers</div>
        </div>
        <div className={styles.actionGroup}>
          <button className={`${styles.signupBtn} h5`} onClick={e => { e.preventDefault(); handleSignup(e); }}>Create Account</button>
          <div className={`${styles.signupTerms} body2`}>
            By creating an account, you agree to our <span className={styles.termsBold}>Terms of Use</span>
          </div>
        </div>
        <div className={styles.actionModule}>
          <span className={`${styles.actionModuleText} body1`}>Already having an account?</span>
          <button className={`${styles.actionModuleBtn} h5`} onClick={onSwitchToLogin}>
            Log in
          </button>
        </div>
      </main>
    </ModalWrapper>
  );
} 