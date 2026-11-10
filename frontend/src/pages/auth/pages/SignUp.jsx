import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import InputField from '../../../components/auth/InputField';
import FormError from '../../../components/auth/FormError';
import BottomButton from '../../../components/common/BottomButton';
import ModalWrapper from '../../../components/common/ModalWrapper';
import { validateEmail, validatePassword } from '../../../utils/core/validation';
import { getFriendlyErrorMessage } from '../../../utils/core/errors';
import useCooldown from '../../../hooks/useCooldown';
import styles from '../styles/Auth.module.css';
import '../../../index.css';

export default function SignUp({ open, onClose, onAuth, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, startResendCooldown] = useCooldown(60);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (isLoading) return; // Enter + 点击按钮 / 连点 不会重复提交
    setError('');
    setEmailError('');
    setPasswordError('');
    setSuccess('');

    // 去掉首尾空格：手机自动填充/粘贴常带空格，否则会被当成无效邮箱
    const trimmedEmail = email.trim();

    // 验证邮箱格式
    const emailValidation = validateEmail(trimmedEmail);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.message);
      return;
    }

    // 验证密码长度
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.message);
      return;
    }
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          // Keep confirmation links on the active official deployment rather
          // than relying on a stale Supabase Site URL.
          emailRedirectTo: window.location.origin
        }
      });
      if (error) {
        setError(getFriendlyErrorMessage(error));
      } else if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        // 邮箱已被注册：Supabase 为防止枚举不报错、也不会发邮件。
        // 以前这里会显示"注册成功，请查收邮件"，但邮件永远不会来。
        setEmailError('An account with this email already exists. Try logging in instead.');
      } else {
        startResendCooldown();
        setSuccess('Sign up successful! Please check your email and click the confirmation link to activate your account.');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(getFriendlyErrorMessage(err, 'An unexpected error occurred. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || resendCooldown > 0) return;

    setError('');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: trimmedEmail,
        options: { emailRedirectTo: window.location.origin }
      });
      if (error) {
        setError(getFriendlyErrorMessage(error));
      } else {
        startResendCooldown();
        setSuccess('A new confirmation email has been sent. Please check your inbox and spam folder.');
      }
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'We could not resend the confirmation email. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalWrapper open={open} onClose={onClose} size="auth">
      <form className={styles.signupMainContent} onSubmit={handleSignup} noValidate>
        <header className={styles.signupHeader}>
          <div className={styles.headerRow}>
            <div className={`${styles.signupOverline2} h2`}>Create Free Account</div>
            <button type="button" className={styles.signupCloseButton} onClick={onClose} aria-label="Close">
              <img src="/assets/close.svg" alt="Close" width="20" height="20" />
            </button>
          </div>
        </header>
        <div className={styles.inputWrapper}>
          <InputField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={setEmail}
            error={emailError}
          />
          <InputField
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            error={passwordError}
          />
          <div className={`${styles.signupHintText} body2`}>Password must have at least 8 characters.</div>
          <FormError message={error} className={styles.formErrorSpacing} />
        </div>
        {success && (
          <div className={styles.signupConfirmation} role="status">
            <p className={`${styles.successMessage} body2`}>{success}</p>
            <button
              type="button"
              className={`${styles.resendConfirmationButton} h5`}
              onClick={handleResendConfirmation}
              disabled={isLoading || resendCooldown > 0}
            >
              {resendCooldown > 0
                ? `Resend confirmation email (${resendCooldown}s)`
                : "Didn't receive it? Resend confirmation email"}
            </button>
          </div>
        )}
        <div className={`${styles.actionGroup} ${styles.signupActionGroup}`}>
          <BottomButton
            type="submit"
            isLoading={isLoading}
            loadingText="Creating account..."
          >
            Sign up
          </BottomButton>
          <div className={`${styles.signupTerms} body2`}>
            By creating an account, you agree to our{' '}
            {/* A real link: keyboard focusable, middle-click / "open in new tab" works */}
            <a
              className={styles.termsBold}
              href="/privacy-notice"
              target="_blank"
              rel="noopener noreferrer"
              style={{cursor: 'pointer', color: 'inherit'}}
            >
              Privacy Notice
            </a>
          </div>
        </div>
        <div className={styles.actionModule}>
          <span className={`${styles.actionModuleText} body1`}>Already having an account?</span>
          <button type="button" className={`${styles.actionModuleBtn} h4`} onClick={onSwitchToLogin} style={{fontWeight: 700}}>
            Log in
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
} 
