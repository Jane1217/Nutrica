import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { NavLogo } from '../../components/navbar';
import styles from './Auth.module.css';

export default function SignUp({ onAuth }) {
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
      // 使用 RPC 函数检查邮箱是否存在
      const { data: emailExists, error: rpcError } = await supabase.rpc('check_email_exists', {
        email_to_check: email
      });
      
      if (rpcError) {
        console.error('RPC function error:', rpcError);
        // 如果 RPC 函数失败，继续注册流程
      } else if (emailExists) {
        setError('Email already registered.');
        return;
      }
      
      // 邮箱不存在，继续注册流程
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
    <div>
      <NavLogo />
      <div className={styles['auth-main']}>
        <form className={styles['auth-form']} onSubmit={handleSignup}>
          <div className={styles['auth-title']}>Create Free Account</div>
          <input
            className={styles['auth-input']}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className={styles['auth-input']}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className={styles['auth-error']}>{error}</div>}
          {success && <div className={styles['auth-success']}>{success}</div>}
          <button className={styles['auth-btn']} type="submit">Create Account</button>
        </form>
        <div className={styles['auth-bottom']}>
          Already having an account?{' '}
          <span className={styles['auth-link']} onClick={() => navigate('/log-in')}>Log in</span>
        </div>
        <div className={styles['auth-terms']}>
          By creating an account, you agree to our <span className={styles['auth-link']}>Terms of Use</span>
        </div>
      </div>
    </div>
  );
} 