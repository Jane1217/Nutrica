import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import InputField from '../../../components/auth/InputField';
import BottomButton from '../../../components/common/BottomButton';
import ModalWrapper from '../../../components/common/ModalWrapper';
import styles from '../styles/Auth.module.css';
import '../../../index.css';

export default function SignUp({ open, onClose, onAuth, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // 使用现有的验证工具函数
  const { validateEmail, validatePassword } = await import('../../../utils/core/validation');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');
    setSuccess('');
    
    // 验证邮箱格式
    if (!validateEmail(email)) {
      setEmailError('Not a valid email address format.');
      return;
    }

    // 验证密码长度
    if (!validatePassword(password)) {
      setPasswordError("Password doesn't meet requirements.");
      return;
    }
    
    try {
      const { data: emailExists, error: rpcError } = await supabase.rpc('check_email_exists', {
        email_to_check: email
      });
      if (rpcError) {
        console.error('RPC function error:', rpcError);
      } else if (emailExists) {
        setEmailError('An account with this email already exists.');
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
    <ModalWrapper open={open} onClose={onClose} size="auth">
      <main className={styles.signupMainContent}>
        <header className={styles.signupHeader}>
          <div className={styles.headerRow}>
            <div className={`${styles.signupOverline2} h2`}>Create Free Account</div>
            <button className={styles.signupCloseButton} onClick={onClose}>
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
            error={emailError}
          />
          <InputField
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            error={passwordError}
          />
          <div className={`${styles.signupHintText} body2`}>Password must have at least 8 characters.</div>
        </div>
        <div className={`${styles.actionGroup} ${styles.signupActionGroup}`}>
          <BottomButton onClick={e => { e.preventDefault(); handleSignup(e); }}>
            Sign up
          </BottomButton>
          <div className={`${styles.signupTerms} body2`}>
            By creating an account, you agree to our <span 
              className={styles.termsBold} 
              onClick={() => {
                try {
                  window.open('/privacy-notice', '_blank');
                } catch (error) {
                  console.error('Failed to open new tab:', error);
                  window.location.href = '/privacy-notice';
                }
              }}
              style={{cursor: 'pointer'}}
            >
              Privacy Notice
            </span>
          </div>
        </div>
        <div className={styles.actionModule}>
          <span className={`${styles.actionModuleText} body1`}>Already having an account?</span>
          <button className={`${styles.actionModuleBtn} h4`} onClick={onSwitchToLogin} style={{fontWeight: 700}}>
            Log in
          </button>
        </div>
      </main>
    </ModalWrapper>
  );
} 