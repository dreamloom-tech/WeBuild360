"use client";

import { useState } from 'react';
import styles from './auth.module.css';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (!res.ok) return setError(data.error || 'Login failed');
    // store token in localStorage for demo
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    router.push('/dashboard');
  };

  return (
    <div className={styles.wrap}>
      <form className={styles.box} onSubmit={submit}>
        <h2>Login</h2>
        {error && <div className={styles.error}>{error}</div>}
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <label>Password</label>
        <div className={styles.passwordInput}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className={styles.showPassword}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <button className={styles.submit}>Login</button>
        <div className={styles.linkRow}>Need an account? <a href="/register">Register</a></div>
      </form>
      <div className={styles.copyright}>
        © {new Date().getFullYear()} SDL CREATIVE GROUPS - <a href="https://www.sdlcreativegroups.com/" target="_blank" rel="noopener noreferrer">www.sdlcreativegroups.com</a>
      </div>
    </div>
  );
}
