'use client';

import styles from '../app/dashboard/dashboard.module.css';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

type Props = {
  collapsed?: boolean;
  onToggle?: () => void;
  onMobileToggle?: () => void;
};

export default function Navbar({ collapsed = false, onToggle, onMobileToggle }: Props) {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState('light');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [open]);

  const handleHamburger = () => {
    if (window.innerWidth < 768 && onMobileToggle) {
      onMobileToggle();
    } else if (onToggle) {
      onToggle();
    }
  };

  return (
    <div className={styles.navbar}>
      <header className={styles.header}>
        <button
          className={styles.hamburger}
          onClick={handleHamburger}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={styles.actions} ref={ref}>
          <button
            className={styles.userButton}
            onClick={() => setOpen(!open)}
            aria-label="User menu"
          >
            {user?.name || 'Guest'}
          </button>

          {open && (
            <div className={styles.dropdown}>
              <Link href="/settings/company" className={styles.dropdownItem}>
                Settings
              </Link>
              <button
                className={styles.dropdownItem}
                onClick={() => {
                  setOpen(false);
                  setShowResetModal(true);
                }}
              >
                Change Password
              </button>
              <button
                className={styles.dropdownItem}
                onClick={() => setModal('help')}
              >
                Help
              </button>
              <button
                className={styles.dropdownItem}
                onClick={() => {
                  localStorage.removeItem('user');
                  setUser(null);
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {modal === 'help' && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Help</h3>
                <button
                  className={styles.modalClose}
                  onClick={() => setModal(null)}
                  aria-label="Close"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className={styles.modalBody}>
                <div style={{marginBottom: 16}}>
                  For support, contact admin@webuild360.com or visit the documentation.
                </div>
              </div>
            </div>
          </div>
        )}

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

              <div className={styles.modalBody}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Current Password</label>
                  <div className={styles.passwordInput}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className={styles.input}
                      placeholder="Enter current password"
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
                  <label className={styles.inputLabel}>New Password</label>
                  <div className={styles.passwordInput}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className={styles.input}
                      placeholder="Enter new password"
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
                  <label className={styles.inputLabel}>Confirm Password</label>
                  <div className={styles.passwordInput}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className={styles.input}
                      placeholder="Confirm new password"
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
                  className={`${styles.button} ${styles.buttonSecondary}`}
                  onClick={() => setShowResetModal(false)}
                >
                  Cancel
                </button>
                <button className={`${styles.button} ${styles.buttonPrimary}`}>
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}