'use client';
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import styles from '../app/dashboard/dashboard.module.css';

type Props = { children: React.ReactNode };

export default function ClientShell({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => setCollapsed(c => !c);
  const toggleMobile = () => setMobileOpen(v => !v);
  const closeMobile = () => setMobileOpen(false);

  return (
    <div>
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onClose={closeMobile} />

      <Navbar
        collapsed={collapsed}
        onToggle={toggleSidebar}
        onMobileToggle={toggleMobile}
      />

      <div
        className={mobileOpen ? `${styles.overlay} ${styles.show}` : styles.overlay}
        onClick={closeMobile}
        aria-hidden={!mobileOpen}
      />

      <div className={collapsed ? `${styles.mainWrapper} ${styles.collapsed}` : styles.mainWrapper}>
        <div className={styles.container}>
          {children}
        </div>
      </div>
    </div>
  );
}