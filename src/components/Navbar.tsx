'use client';
import styles from '../app/dashboard/dashboard.module.css';

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

  return (
    <header className={collapsed ? `${styles.topbar} ${styles.collapsed}` : styles.topbar}>
      <div className={styles.topLeft}>
        <button
          className={styles.hamburger}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={handleHamburger}
          title="Toggle Sidebar"
        >
          ☰
        </button>

        <div className={styles.logo}>
          {/* <div className={styles.logoIcon}>🔵</div> */}
          <div className={styles.brand}>WeBuild360</div>
        </div>
      </div>

      <div className={styles.topRight}>
        {/* <div className={styles.iconGroup}>
          <div className={styles.bell}>🔔<span className={styles.badge}>2</span></div>
          <div className={styles.help}>❓</div>
          <div className={styles.mail}>✉️<span className={styles.badge}>3</span></div>
        </div> */}
        <div className={styles.user}>
          <img src="/images/profile.png" alt="JD" className={styles.topAvatar} />
          <span className={styles.userName}>Profile</span>
        </div>
      </div>
    </header>
  );
}