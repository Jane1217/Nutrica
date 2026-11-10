import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import InputField from '../../../components/auth/InputField';
import BottomButton from '../../../components/common/BottomButton';
import ModalWrapper from '../../../components/common/ModalWrapper';
import Toast from '../../../components/common/Toast';
import { isNetworkError, isRateLimitError, NETWORK_ERROR_MESSAGE, RATE_LIMIT_MESSAGE, getFriendlyErrorMessage } from '../../../utils/core/errors';
import useCooldown from '../../../hooks/useCooldown';
import styles from '../styles/Auth.module.css';
import '../../../index.css';

export default function LogIn({ open, onClose, onAuth, onSwitchToSignUp, onSwitchToForgotPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');
  const [isLoading, setIsLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resendCooldown, startResendCooldown] = useCooldown(60);
  const navigate = useNavigate();

  const notify = (message, type = 'error') => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
  };

  // A hidden login dialog must not leave an old error toast floating above the
  // next dialog (for example, the password-recovery form).
  useEffect(() => {
    if (!open) {
      setShowToast(false);
      setToastMessage('');
    }
  }, [open]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return; // Enter + 点击按钮 / 连点 不会重复提交
    setError('');
    setNeedsConfirmation(false);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      notify(!trimmedEmail ? 'Please enter your email' : 'Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
      if (error) {
        if (isNetworkError(error)) {
          // supabase-js 把断网/服务不可用作为 error 返回（不会 throw），
          // 以前会被误报为"邮箱或密码错误"
          notify(NETWORK_ERROR_MESSAGE);
        } else if (isRateLimitError(error)) {
          notify(RATE_LIMIT_MESSAGE);
        } else if (error.code === 'email_not_confirmed' || /email not confirmed/i.test(error.message || '')) {
          setError('Please verify your email address by clicking the confirmation link sent to your inbox.');
          setNeedsConfirmation(true);
        } else {
          notify('Incorrect email or password');
        }
      } else {
        // 路由负责跳转（/log-in 会回到用户原本想去的页面，欢迎页弹窗则留在首页）
        onAuth && onAuth();
      }
    } catch (err) {
      console.error('Login error:', err);
      notify(isNetworkError(err) ? NETWORK_ERROR_MESSAGE : 'Incorrect email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || resendCooldown > 0) return;
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: trimmedEmail,
        options: { emailRedirectTo: window.location.origin }
      });
      if (error) {
        notify(getFriendlyErrorMessage(error));
      } else {
        startResendCooldown();
        notify('A new confirmation email has been sent. Please check your inbox and spam folder.', 'success');
      }
    } catch (err) {
      notify(getFriendlyErrorMessage(err));
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
        type={toastType}
        show={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />
      <ModalWrapper open={open} onClose={onClose} size="auth">
        {/* <form>: Enter submits, and password managers recognise the login form */}
        <form className={styles.loginMainContent} onSubmit={handleLogin} noValidate>
          <header className={styles.loginHeader}>
            <div className={styles.headerRow}>
              <div className={`${styles.loginOverline2} h2`}>Log In</div>
              <button type="button" className={styles.loginCloseButton} onClick={onClose} aria-label="Close">
                <img src="/assets/close.svg" alt="Close" width="20" height="20" />
              </button>
            </div>
          </header>
          <div className={styles.inputWrapper}>
            <InputField
              label="Email"
              type="email"
              name="email"
              autoComplete="username"
              inputMode="email"
              value={email}
              onChange={setEmail}
              error={null}
            />
            <InputField
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
              error={error || null}
            />
            {needsConfirmation && (
              <button
                type="button"
                className={`${styles.resendConfirmationButton} h5`}
                onClick={handleResendConfirmation}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0 ? `Resend confirmation email (${resendCooldown}s)` : 'Resend confirmation email'}
              </button>
            )}
          </div>
          <div className={styles.actionGroup}>
            <BottomButton type="submit" isLoading={isLoading} loadingText="Logging in...">
              Log In
            </BottomButton>
            <button type="button" className={`${styles.forgotPasswordBtn} h4`} onClick={handleForgotPassword} style={{fontWeight: 700}}>Forgot Password</button>
          </div>
          <div className={styles.actionModule}>
            <span className={`${styles.actionModuleText} body1`}>New to Nutrica?</span>
            <button type="button" className={`${styles.actionModuleBtn} h4`} onClick={handleSwitchToSignUp} style={{fontWeight: 700}}>Create Free Account</button>
          </div>
        </form>
      </ModalWrapper>
    </>
  );
} 
