import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import InputField from '../../../components/auth/InputField';
import BottomButton from '../../../components/common/BottomButton';
import styles from '../styles/ResetPassword.module.css';
import '../../../index.css';

// 简单的Logo组件，只显示Logo
const SimpleLogo = () => (
  <div className={styles.logo}>
    <svg xmlns="http://www.w3.org/2000/svg" width="69" height="19" viewBox="0 0 69 19" fill="none">
      <path d="M66.2886 15H64.8081V13.5H66.2886V15ZM66.2886 13.5H64.8081V12H66.2886V13.5ZM64.8081 13.5H63.3276V12H64.8081V13.5ZM63.3276 15H61.8472V13.5H63.3276V15ZM61.8472 15H60.3667V13.5H61.8472V15ZM60.3667 15H58.8862V13.5H60.3667V15ZM60.3667 13.5H58.8862V12H60.3667V13.5ZM61.8472 13.5H60.3667V12H61.8472V13.5ZM58.8862 13.5H57.4058V12H58.8862V13.5ZM58.8862 12H57.4058V10.5H58.8862V12ZM58.8862 6H57.4058V4.5H58.8862V6ZM60.3667 6H58.8862V4.5H60.3667V6ZM60.3667 12H58.8862V10.5H60.3667V12ZM61.8472 6H60.3667V4.5H61.8472V6ZM60.3667 4.5H58.8862V3H60.3667V4.5ZM61.8472 4.5H60.3667V3H61.8472V4.5ZM63.3276 4.5H61.8472V3H63.3276V4.5ZM64.8081 4.5H63.3276V3H64.8081V4.5ZM66.2886 4.5H64.8081V3H66.2886V4.5ZM66.2886 6H64.8081V4.5H66.2886V6ZM64.8081 6H63.3276V4.5H64.8081V6ZM66.2886 7.5H64.8081V6H66.2886V7.5ZM67.769 6H66.2886V4.5H67.769V6ZM67.769 7.5H66.2886V6H67.769V7.5ZM67.769 9H66.2886V7.5H67.769V9ZM67.769 10.5H66.2886V9H67.769V10.5ZM67.769 12H66.2886V10.5H67.769V12ZM67.769 13.5H66.2886V12H67.769V13.5ZM66.2886 12H64.8081V10.5H66.2886V12ZM66.2886 10.5H64.8081V9H66.2886V10.5ZM66.2886 9H64.8081V7.5H66.2886V9ZM63.3276 6H61.8472V4.5H63.3276V6ZM63.3276 13.5H61.8472V12H63.3276V13.5ZM66.2886 13.5H67.769V15H66.2886V13.5ZM63.3276 7.5H64.8081V9H63.3276V7.5ZM61.8472 7.5H63.3276V9H61.8472V7.5ZM60.3667 7.5H61.8472V9H60.3667V7.5ZM58.8862 7.5H60.3667V9H58.8862V7.5ZM57.4058 9H58.8862V10.5H57.4058V9ZM58.8862 9H60.3667V10.5H58.8862V9ZM63.3276 9H64.8081V10.5H63.3276V9ZM61.8472 9H63.3276V10.5H61.8472V9ZM60.3667 9H61.8472V10.5H60.3667V9Z" fill="#49693D"/>
      <path d="M49.0723 3H50.5527V4.5H49.0723V3ZM47.5918 3H49.0723V4.5H47.5918V3ZM47.5918 4.5H49.0723V6H47.5918V4.5ZM49.0723 4.5H50.5527V6H49.0723V4.5ZM50.5527 3H52.0332V4.5H50.5527V3ZM52.0332 3H53.5137V4.5H52.0332V3ZM53.5137 3H54.9941V4.5H53.5137V3ZM53.5137 4.5H54.9941V6H53.5137V4.5ZM52.0332 4.5H53.5137V6H52.0332V4.5ZM54.9941 4.5H56.4746V6H54.9941V4.5ZM54.9941 6H56.4746V7.5H54.9941V6ZM54.9941 10.5H56.4746V12H54.9941V10.5ZM54.9941 12H56.4746V13.5H54.9941V12ZM53.5137 12H54.9941V13.5H53.5137V12ZM53.5137 10.5H54.9941V12H53.5137V10.5ZM53.5137 6H54.9941V7.5H53.5137V6ZM52.0332 12H53.5137V13.5H52.0332V12ZM53.5137 13.5H54.9941V15H53.5137V13.5ZM52.0332 13.5H53.5137V15H52.0332V13.5ZM50.5527 13.5H52.0332V15H50.5527V13.5ZM49.0723 13.5H50.5527V15H49.0723V13.5ZM47.5918 13.5H49.0723V15H47.5918V13.5ZM47.5918 12H49.0723V13.5H47.5918V12ZM49.0723 12H50.5527V13.5H49.0723V12ZM47.5918 10.5H49.0723V12H47.5918V10.5ZM46.1113 12H47.5918V13.5H46.1113V12ZM46.1113 10.5H47.5918V12H46.1113V10.5ZM46.1113 9H47.5918V10.5H46.1113V9ZM46.1113 7.5H47.5918V9H46.1113V7.5ZM46.1113 6H47.5918V7.5H46.1113V6ZM46.1113 4.5H47.5918V6H46.1113V4.5ZM47.5918 6H49.0723V7.5H47.5918V6ZM47.5918 7.5H49.0723V9H47.5918V7.5ZM47.5918 9H49.0723V10.5H47.5918V9ZM50.5527 12H52.0332V13.5H50.5527V12ZM50.5527 4.5H52.0332V6H50.5527V4.5Z" fill="#49693D"/>
      <path d="M42.2109 0H45.1719V3H42.2109V0ZM42.2109 4.5H45.1719V15H42.2109V4.5Z" fill="#22221B"/>
      <path d="M32.4006 4.5H33.8811V6H32.4006V4.5ZM32.4006 3H33.8811V4.5H32.4006V3ZM33.8811 3H35.3616V4.5H33.8811V3ZM33.8811 4.5H35.3616V6H33.8811V4.5ZM33.8811 6H35.3616V7.5H33.8811V6ZM33.8811 7.5H35.3616V9H33.8811V7.5ZM33.8811 9H35.3616V10.5H33.8811V9ZM32.4006 9H33.8811V10.5H32.4006V9ZM32.4006 7.5H33.8811V9H32.4006V7.5ZM32.4006 6H33.8811V7.5H32.4006V6ZM32.4006 10.5H33.8811V12H32.4006V10.5ZM33.8811 10.5H35.3616V12H33.8811V10.5ZM33.8811 12H35.3616V13.5H33.8811V12ZM33.8811 13.5H35.3616V15H33.8811V13.5ZM32.4006 13.5H33.8811V15H32.4006V13.5ZM32.4006 12H33.8811V13.5H32.4006V12ZM35.3616 4.5H36.842V6H35.3616V4.5ZM36.842 4.5H38.3225V6H36.842V4.5ZM38.3225 4.5H39.803V6H38.3225V4.5ZM38.3225 3H39.803V4.5H38.3225V3ZM36.842 3H38.3225V4.5H36.842V3ZM35.3616 6H36.842V7.5H35.3616V6ZM39.803 4.5H41.2834V6H39.803V4.5ZM38.3225 6H39.803V7.5H38.3225V6Z" fill="#22221B"/>
      <path d="M29.9961 12H31.4766V13.5H29.9961V12ZM29.9961 13.5H31.4766V15H29.9961V13.5ZM28.5156 13.5H29.9961V15H28.5156V13.5ZM28.5156 12H29.9961V13.5H28.5156V12ZM27.0352 13.5H28.5156V15H27.0352V13.5ZM27.0352 12H28.5156V13.5H27.0352V12ZM25.5547 12H27.0352V13.5H25.5547V12ZM25.5547 10.5H27.0352V12H25.5547V10.5ZM25.5547 9H27.0352V10.5H25.5547V9ZM25.5547 7.5H27.0352V9H25.5547V7.5ZM25.5547 6H27.0352V7.5H25.5547V6ZM25.5547 4.5H27.0352V6H25.5547V4.5ZM27.0352 9H28.5156V10.5H27.0352V9ZM27.0352 10.5H28.5156V12H27.0352V10.5ZM27.0352 7.5H28.5156V9H27.0352V7.5ZM27.0352 6H28.5156V7.5H27.0352V6ZM27.0352 0H28.5156V1.5H27.0352V0ZM27.0352 1.5H28.5156V3H27.0352V1.5ZM27.0352 3H28.5156V4.5H27.0352V3ZM27.0352 4.5H28.5156V6H27.0352V4.5ZM25.5547 3H27.0352V4.5H25.5547V3ZM24.0742 4.5H25.5547V6H24.0742V4.5ZM28.5156 4.5H29.9961V6H28.5156V4.5ZM29.9961 4.5H31.4766V6H29.9961V4.5ZM25.5547 1.5H27.0352V3H25.5547V1.5ZM24.0742 6H25.5547V7.5H24.0742V6ZM28.5156 6H29.9961V7.5H28.5156V6ZM29.9961 6H31.4766V7.5H29.9961V6Z" fill="#22221B"/>
      <path d="M23.1428 13.5H21.6624V12H23.1428V13.5ZM23.1428 15H21.6624V13.5H23.1428V15ZM21.6624 15H20.1819V13.5H21.6624V15ZM21.6624 13.5H20.1819V12H21.6624V13.5ZM21.6624 12H20.1819V10.5H21.6624V12ZM21.6624 10.5H20.1819V9H21.6624V10.5ZM21.6624 9H20.1819V7.5H21.6624V9ZM23.1428 9H21.6624V7.5H23.1428V9ZM23.1428 10.5H21.6624V9H23.1428V10.5ZM23.1428 12H21.6624V10.5H23.1428V12ZM23.1428 7.5H21.6624V6H23.1428V7.5ZM21.6624 7.5H20.1819V6H21.6624V7.5ZM21.6624 6H20.1819V4.5H21.6624V6ZM21.6624 4.5H20.1819V3H21.6624V4.5ZM23.1428 4.5H21.6624V3H23.1428V4.5ZM23.1428 6H21.6624V4.5H23.1428V6ZM15.7405 4.5H14.26V3H15.7405V4.5ZM14.26 4.5H12.7795V3H14.26V4.5ZM14.26 6H12.7795V4.5H14.26V6ZM14.26 7.5H12.7795V6H14.26V7.5ZM14.26 9H12.7795V7.5H14.26V9ZM14.26 10.5H12.7795V9H14.26V10.5ZM14.26 12H12.7795V10.5H14.26V12ZM14.26 13.5H12.7795V12H14.26V13.5ZM15.7405 10.5H14.26V9H15.7405V10.5ZM15.7405 9H14.26V7.5H15.7405V9ZM15.7405 7.5H14.26V6H15.7405V7.5ZM15.7405 6H14.26V4.5H15.7405V6ZM15.7405 12H14.26V10.5H15.7405V12ZM20.1819 13.5H18.7014V12H20.1819V13.5ZM18.7014 13.5H17.2209V12H18.7014V13.5ZM17.2209 13.5H15.7405V12H17.2209V13.5ZM17.2209 15H15.7405V13.5H17.2209V15ZM15.7405 15H14.26V13.5H15.7405V15ZM15.7405 13.5H14.26V12H15.7405V13.5ZM18.7014 15H17.2209V13.5H18.7014V15Z" fill="#22221B"/>
      <path d="M4.44141 7.5H5.92188V9H4.44141V7.5ZM4.44141 6H5.92188V7.5H4.44141V6ZM5.92188 6H7.40234V7.5H5.92188V6ZM5.92188 7.5H7.40234V9H5.92188V7.5ZM5.92188 9H7.40234V10.5H5.92188V9ZM4.44141 9H5.92188V10.5H4.44141V9ZM4.44141 3H5.92188V4.5H4.44141V3ZM4.44141 4.5H5.92188V6H4.44141V4.5ZM2.96094 6H4.44141V7.5H2.96094V6ZM2.96094 4.5H4.44141V6H2.96094V4.5ZM2.96094 3H4.44141V4.5H2.96094V3ZM0 0H1.48047V1.5H0V0ZM1.48047 0H2.96094V1.5H1.48047V0ZM2.96094 0H4.44141V1.5H2.96094V0ZM2.96094 1.5H4.44141V3H2.96094V1.5ZM1.48047 1.5H2.96094V3H1.48047V1.5ZM0 1.5H1.48047V3H0V1.5ZM0 3H1.48047V4.5H0V3ZM1.48047 3H2.96094V4.5H1.48047V3ZM1.48047 4.5H2.96094V6H1.48047V4.5ZM1.48047 6H2.96094V7.5H1.48047V6ZM0 6H1.48047V7.5H0V6ZM0 4.5H1.48047V6H0V4.5ZM0 7.5H1.48047V9H0V7.5ZM1.48047 7.5H2.96094V9H1.48047V7.5ZM1.48047 9H2.96094V10.5H1.48047V9ZM1.48047 10.5H2.96094V12H1.48047V10.5ZM1.48047 12H2.96094V13.5H1.48047V12ZM1.48047 13.5H2.96094V15H1.48047V13.5ZM0 13.5H1.48047V15H0V13.5ZM0 12H1.48047V13.5H0V12ZM0 10.5H1.48047V12H0V10.5ZM0 9H1.48047V10.5H0V9ZM5.92188 10.5H7.40234V12H5.92188V10.5ZM5.92188 12H7.40234V13.5H5.92188V12ZM7.40234 10.5H8.88281V12H7.40234V10.5ZM7.40234 9H8.88281V10.5H7.40234V9ZM7.40234 12H8.88281V13.5H7.40234V12ZM7.40234 13.5H8.88281V15H7.40234V13.5ZM8.88281 13.5H10.3633V15H8.88281V13.5ZM10.3633 13.5H11.8438V15H10.3633V13.5ZM10.3633 12H11.8438V13.5H10.3633V12ZM10.3633 10.5H11.8438V12H10.3633V10.5ZM8.88281 10.5H10.3633V12H8.88281V10.5ZM8.88281 12H10.3633V13.5H8.88281V12ZM8.88281 9H10.3633V10.5H8.88281V9ZM10.3633 7.5H11.8438V9H10.3633V7.5ZM10.3633 6H11.8438V7.5H10.3633V6ZM10.3633 9H11.8438V10.5H10.3633V9ZM8.88281 7.5H10.3633V9H8.88281V7.5ZM8.88281 6H10.3633V7.5H8.88281V6ZM8.88281 4.5H10.3633V6H8.88281V4.5ZM10.3633 4.5H11.8438V6H10.3633V4.5ZM10.3633 3H11.8438V4.5H10.3633V3ZM8.88281 0H10.3633V1.5H8.88281V0ZM10.3633 0H11.8438V1.5H10.3633V0ZM10.3633 1.5H11.8438V3H10.3633V1.5ZM8.88281 1.5H10.3633V3H8.88281V1.5ZM8.88281 3H10.3633V4.5H8.88281V3Z" fill="#22221B"/>
      <rect x="57.2449" y="16" width="10.8568" height="3" fill="#A1CE90"/>
      <rect x="46.3879" y="16" width="10.8568" height="3" fill="#49693D"/>
    </svg>
  </div>
);

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 检查用户是否已通过邮件链接认证
  useEffect(() => {
    console.log('ResetPassword page loaded');
    
    const checkAuthAndSession = async () => {
      try {
        // 检查URL参数
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        const access_token = searchParams.get('access_token');
        const refresh_token = searchParams.get('refresh_token');
        
        console.log('URL params - token:', token, 'type:', type, 'access_token:', access_token);
        
        // 检查当前session状态
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Current session:', session);
        console.log('Session error:', sessionError);
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
        }
        
        if (session) {
          console.log('User is authenticated for password reset');
          setIsAuthenticated(true);
          setError('');
        } else if (access_token && refresh_token) {
          console.log('Found access_token and refresh_token in URL, setting session');
          // 如果有access_token和refresh_token，设置session
          const { data, error } = await supabase.auth.setSession({
            access_token: access_token,
            refresh_token: refresh_token
          });
          
          if (error) {
            console.error('Error setting session:', error);
            setError('Invalid or expired reset link. Please request a new one.');
          } else {
            console.log('Session set successfully');
            setIsAuthenticated(true);
            setError('');
          }
        } else if (token && type === 'recovery') {
          console.log('Token found in URL, attempting to verify');
          // 如果有token，尝试验证
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery'
          });
          
          if (error) {
            console.error('Token verification error:', error);
            setError('Invalid or expired reset link. Please request a new one.');
          } else {
            console.log('Token verified successfully');
            setIsAuthenticated(true);
            setError('');
          }
        } else {
          console.log('No session or valid token found');
          setError('Please click the link in your email to reset your password.');
        }
      } catch (err) {
        console.error('Error in auth check:', err);
        setError('Error loading page. Please try again.');
      } finally {
        setIsLoadingPage(false);
      }
    };

    checkAuthAndSession();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      if (event === 'PASSWORD_RECOVERY' && session) {
        console.log('Password recovery session established');
        setIsAuthenticated(true);
        setError('');
      } else if (event === 'SIGNED_IN' && session) {
        console.log('User signed in, checking if this is password recovery');
        // 检查是否是通过密码重置链接登录的
        const token = searchParams.get('token');
        const access_token = searchParams.get('access_token');
        if (token || access_token) {
          setIsAuthenticated(true);
          setError('');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [searchParams]);

  const handleResetPassword = async () => {
    if (!isAuthenticated) {
      setError('Please click the link in your email first');
      return;
    }

    if (!password) {
      setError('Please enter a new password');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Password update error:', error);
        setError(error.message);
      } else {
        console.log('Password updated successfully:', data);
        setSuccess('Password updated successfully!');
        setShowSuccess(true);
        // 密码更新成功后，登出用户
        setTimeout(async () => {
          await supabase.auth.signOut();
        }, 1500);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingPage) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <SimpleLogo />
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {!showSuccess ? (
          <div className={styles.card}>
            <h1 className={`${styles.title} h1`}>
              Reset Password
            </h1>
            <p className={`${styles.subtitle} body1`}>
              Please set your new password.
            </p>

            {!isAuthenticated && (
              <div className={styles.warning}>
                Please click the link in your email to continue with password reset.
              </div>
            )}

            <div className={styles.inputWrapper}>
              <InputField
                label="New Password"
                type="password"
                value={password}
                onChange={setPassword}
                error={null}
              />
            </div>

            <div className={styles.inputWrapper}>
              <InputField
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                error={null}
              />
            </div>

            <div className={`${styles.hint} body2`}>
              Password must have at least 8 characters.
            </div>

            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            {success && (
              <div className={styles.success}>
                {success}
              </div>
            )}

            <BottomButton
              onClick={handleResetPassword}
              disabled={!isAuthenticated}
              isLoading={isLoading}
              loadingText="Updating..."
            >
              Reset password
            </BottomButton>
          </div>
        ) : (
          <div className={styles.successCard}>
            {/* Success Icon */}
            <div className={styles.successIcon}>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="40" fill="var(--Alert-Success, #477E2D)"/>
                <path d="M25 40L35 50L55 30" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Success Message */}
            <p className={`${styles.successMessage} body1`}>
              Your password has been reset successfully.
            </p>

            {/* Login Button */}
            <BottomButton
              onClick={() => navigate('/', { state: { showLoginModal: true } })}
            >
              Log in
            </BottomButton>
          </div>
        )}
      </div>
    </div>
  );
}
