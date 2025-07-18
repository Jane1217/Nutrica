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
    <ModalWrapper open={open} onClose={onClose} size="auth">
      <main className={styles.signupMainContent}>
        <header className={styles.signupHeader}>
          <div className={styles.headerRow}>
            <div className={`${styles.signupOverline2} h2`}>Create Free Account</div>
            <button className={styles.closeButton} onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M10.008 11.8844L14.7227 16.5938C14.9729 16.8437 15.3122 16.9841 15.666 16.9841C16.0198 16.9841 16.3591 16.8437 16.6093 16.5938C16.8595 16.3439 17 16.005 17 15.6516C17 15.2982 16.8595 14.9592 16.6093 14.7093L11.8928 10L16.6084 5.29067C16.7322 5.16693 16.8304 5.02005 16.8974 4.85841C16.9644 4.69676 16.9988 4.52352 16.9988 4.34858C16.9988 4.17363 16.9642 4.00041 16.8972 3.83879C16.8301 3.67718 16.7318 3.53034 16.6079 3.40667C16.4841 3.28299 16.337 3.1849 16.1752 3.11799C16.0134 3.05108 15.8399 3.01666 15.6648 3.0167C15.4896 3.01674 15.3162 3.05124 15.1544 3.11823C14.9926 3.18522 14.8456 3.28338 14.7218 3.40711L10.008 8.11644L5.29327 3.40711C5.17031 3.27983 5.0232 3.17828 4.86053 3.10839C4.69786 3.0385 4.52288 3.00168 4.34581 3.00006C4.16874 2.99844 3.99311 3.03206 3.82919 3.09896C3.66526 3.16586 3.51632 3.2647 3.39105 3.38971C3.26577 3.51472 3.16668 3.66341 3.09955 3.82708C3.03242 3.99076 2.99859 4.16615 3.00005 4.34302C3.0015 4.51989 3.03821 4.6947 3.10802 4.85725C3.17783 5.0198 3.27936 5.16684 3.40667 5.28978L8.12316 10L3.40756 14.7102C3.28025 14.8332 3.17872 14.9802 3.10891 15.1427C3.03909 15.3053 3.00239 15.4801 3.00093 15.657C2.99948 15.8339 3.0333 16.0092 3.10044 16.1729C3.16757 16.3366 3.26666 16.4853 3.39193 16.6103C3.51721 16.7353 3.66615 16.8341 3.83008 16.901C3.994 16.9679 4.16963 17.0016 4.3467 16.9999C4.52377 16.9983 4.69875 16.9615 4.86142 16.8916C5.02409 16.8217 5.1712 16.7202 5.29416 16.5929L10.008 11.8844Z" fill="#6A6A61"/>
              </svg>
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
            error={error ? "Password doesn't meet requirements" : null}
          />
          <div className={`${styles.signupHintText} body2`}>Password must have at least 8 characters.</div>
        </div>
        <div className={styles.actionGroup}>
          <BottomButton onClick={e => { e.preventDefault(); handleSignup(e); }}>
            Sign up
          </BottomButton>
          <div className={`${styles.signupTerms} body2`}>
            By creating an account, you agree to our <span className={styles.termsBold}>Privacy Notice</span>
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