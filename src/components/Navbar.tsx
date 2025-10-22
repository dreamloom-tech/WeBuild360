 'use client';
import styles from './navbar.module.css';
import { useState as useModalState } from 'react';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

function avatarUrlWithCache(url?: string | null, ts?: string | null) {
  if (!url) return '/file.svg';
  return ts ? `${url}?t=${ts}` : url;
}

type Props = {
  collapsed?: boolean;
  onToggle?: () => void;
  onMobileToggle?: () => void;
};

/*
  Navbar: hamburger will call onMobileToggle when on small screens,
  otherwise call onToggle to collapse/expand sidebar.
*/
export default function Navbar({ collapsed = false, onToggle, onMobileToggle }: Props) {
  const handleHamburger = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 1100) {
      onMobileToggle?.();
    } else {
      onToggle?.();
    }
  };

  const [user, setUser] = useState<any>(null);
  const [avatarSrc, setAvatarSrc] = useState<string>('/file.svg');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchWithAuth('/api/auth/me');
        if (!res.ok) return;
        const data = await res.json();
        setUser(data.user);
      } catch (e) {
        // ignore
      }
    }
    load();
  }, []);

  useEffect(() => {
    try {
      const ts = typeof window !== 'undefined' ? localStorage.getItem('avatar_ts') : '';
  setAvatarSrc(avatarUrlWithCache(user?.avatar || '/file.svg', ts || null));
    } catch (e) {
  setAvatarSrc(user?.avatar || '/file.svg');
    }
  }, [user]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const [showResetModal, setShowResetModal] = useModalState(false);
  const [showPassword, setShowPassword] = useModalState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form state when modal is closed
  useEffect(() => {
    if (!showResetModal) {
      setCurrentPassword('');
      setNewPassword('');
      setError('');
      setLoading(false);
    }
  }, [showResetModal]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: currentPassword,
          newPassword: newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setShowResetModal(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (e: any) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className={styles.navbar}>
       <div
  className={`${styles.hamburger} ${collapsed ? styles.hamburgerCollapsed : styles.hamburgerShift}`}
  onClick={handleHamburger}
>
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
</div>


        <div className={styles.profile} ref={ref}>
          <button 
            className={styles.profileTrigger} 
            onClick={() => setOpen(v => !v)} 
            aria-haspopup="true" 
            aria-expanded={open}
          >
            <img 
              src={avatarSrc} 
              alt={user?.name || 'User'} 
              className={styles.avatar}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = '/file.svg';
              }}
            />
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{user?.name || 'User'}</span>
              <span className={styles.profileEmail}>{user?.email}</span>
            </div>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          <div className={`${styles.dropdown} ${open ? styles.dropdownOpen : ''}`} role="menu">
            <div className={styles.dropdownHeader}>
              <div className={styles.dropdownName}>{user?.name}</div>
              <div className={styles.dropdownEmail}>{user?.email}</div>
            </div>

            <Link href="/dashboard/profile" className={styles.dropdownItem} onClick={() => setOpen(false)}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </Link>
{/* 
            <Link href="/dashboard/settings" className={styles.dropdownItem} onClick={() => setOpen(false)}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link> */}

            <button 
              className={styles.dropdownItem} 
              onClick={() => setShowResetModal(true)}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Reset Password
            </button>

            <div className={styles.dropdownDivider} />

            <button 
              className={`${styles.dropdownItem} ${styles.logoutButton}`}
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
              }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {showResetModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Reset Password</h3>
              <button 
                className={styles.modalClose}
                onClick={() => setShowResetModal(false)}
                aria-label="Close"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePasswordReset}>
              <div className={styles.modalBody}>
                {error && <div className={styles.error}>{error}</div>}
                <div className={styles.inputGroup}>
                  <label htmlFor="currentPassword" className={styles.inputLabel}>Current Password</label>
                  <div className={styles.passwordInput}>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={showPassword ? "text" : "password"}
                      className={styles.input}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="newPassword" className={styles.inputLabel}>New Password</label>
                  <div className={styles.passwordInput}>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      className={styles.input}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={`${styles.button} ${styles.buttonSecondary}`}
                  onClick={() => setShowResetModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  disabled={loading || !currentPassword || !newPassword}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}