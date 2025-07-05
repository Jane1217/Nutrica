import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import NavBarSimple from '../../components/navbar/NavBarSimple';
import styles from './Auth.module.css';

export default function LogIn({ onAuth }) {
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
    <div>
      <NavBarSimple />
      <div className={styles['auth-main']}>
        <form className={styles['auth-form']} onSubmit={handleLogin}>
          <div className={styles['auth-title']}>Log In</div>
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
          <button className={styles['auth-btn']} type="submit">Log In</button>
        </form>
        <div className={styles['auth-bottom']}>
          New to Nutrica?{' '}
          <span className={styles['auth-link']} onClick={() => navigate('/sign-up')}>Create Free Account</span>
        </div>
      </div>
    </div>
  );
} 