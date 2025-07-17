import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import InputField from '../../../components/auth/InputField';
import NavLogo from '../../../components/navbar/Nav-Logo';
import styles from '../styles/Auth.module.css';
import '../../../index.css';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
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
        setSuccess('Password updated successfully! Redirecting to login...');
        // 密码更新成功后，登出用户并跳转到登录页面
        setTimeout(async () => {
          await supabase.auth.signOut();
          navigate('/log-in');
        }, 2000);
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
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--Brand-Background, #F3F3EC)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--Brand-Background, #F3F3EC)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.1)'
      }}>
        <NavLogo hideEat />
        <button
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--Brand-Dark, #2A4E14)',
            cursor: 'pointer',
            fontFamily: 'Kanit',
            fontSize: '16px',
            fontWeight: '500'
          }}
          onClick={async () => {
            await supabase.auth.signOut();
            navigate('/log-in');
          }}
        >
          Back to Login
        </button>
      </header>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '400px',
          width: '100%',
          background: 'var(--Brand-Background, #F3F3EC)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <header style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{
              fontFamily: 'Kanit',
              fontSize: '24px',
              fontWeight: '700',
              color: '#22221B',
              margin: '0 0 8px 0'
            }}>
              Reset Password
            </h1>
            <p style={{
              fontFamily: 'Kanit',
              fontSize: '16px',
              color: '#666',
              margin: '0'
            }}>
              Enter your new password below
            </p>
          </header>


          {!isAuthenticated && (
            <div style={{
              color: 'var(--Alert-Warning, #EEB85B)',
              fontSize: '14px',
              textAlign: 'center',
              marginBottom: '16px',
              padding: '12px',
              background: 'rgba(238, 184, 91, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(238, 184, 91, 0.3)'
            }}>
              Please click the link in your email to continue with password reset.
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <InputField
              label="New Password"
              type="password"
              value={password}
              onChange={setPassword}
              error={null}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <InputField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={null}
            />
          </div>

          {error && (
            <div style={{
              color: 'var(--Alert-Error, #E16A60)',
              fontSize: '14px',
              textAlign: 'center',
              marginBottom: '16px',
              padding: '8px',
              background: 'rgba(225, 106, 96, 0.1)',
              borderRadius: '8px'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              color: 'var(--Alert-Success, #6FB977)',
              fontSize: '14px',
              textAlign: 'center',
              marginBottom: '16px',
              padding: '8px',
              background: 'rgba(111, 185, 119, 0.1)',
              borderRadius: '8px'
            }}>
              {success}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <button
              style={{
                display: 'flex',
                width: '240px',
                height: '80px',
                padding: '0px 16px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                borderRadius: '36px',
                background: isAuthenticated && !isLoading ? 'var(--Brand-Dark, #2A4E14)' : '#ccc',
                color: '#FFF',
                border: 'none',
                cursor: isAuthenticated && !isLoading ? 'pointer' : 'not-allowed',
                opacity: isLoading ? 0.7 : 1,
                fontFamily: 'Kanit',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onClick={handleResetPassword}
              disabled={!isAuthenticated || isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
