'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import styles from '../app/dashboard/dashboard.module.css';
import {
  FaHome,
  FaFolderOpen,
  FaMoneyBillWave,
  FaChevronDown,
  FaArrowUp,
  FaArrowDown,
  FaBoxOpen,
  FaExchangeAlt,
  FaClipboardList,
  FaUsers,
  FaChartBar,
  FaCog,
  FaBook,
  FaBuilding,
  FaBell,
} from 'react-icons/fa';

type Props = { collapsed?: boolean; mobileOpen?: boolean; onClose?: () => void; };

export default function Sidebar({ collapsed = false, mobileOpen = false, onClose }: Props) {
  const pathname = usePathname() || '/';
  const [openFunds, setOpenFunds] = useState(false);
  const [openMaterials, setOpenMaterials] = useState(false);
  const [openWorkers, setOpenWorkers] = useState(false);
  const [openReports, setOpenReports] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);

  // flyout state used only when sidebar is collapsed
  const [flyout, setFlyout] = useState<{key: string | null; top: number | null} | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (!flyout) return;
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) setFlyout(null);
    }
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, [flyout]);

  const classes = [styles.sidebar, collapsed ? styles.collapsed : '', mobileOpen ? styles.mobileOpen : ''].join(' ').trim();

  const handleLink = () => { if (mobileOpen) onClose?.(); };

  const handleLogout = () => {
    // Clear any auth tokens or user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login page
    window.location.href = '/login';
  };

  const openFlyoutFor = (key: string, e: React.MouseEvent) => {
    if (!collapsed) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setFlyout({ key, top: Math.max(64, rect.top - 8) }); // keep below topbar
  };

  const toggleOrFlyout = (key: string, setter: (v: boolean) => void, stateVal: boolean, e: React.MouseEvent) => {
    if (collapsed) {
      if (flyout?.key === key) setFlyout(null);
      else openFlyoutFor(key, e);
    } else {
      setter(!stateVal);
    }
  };

  return (
    <aside ref={containerRef as any} className={classes} aria-hidden={mobileOpen ? false : undefined}>
      {/* <div className={styles.profile}>
        <img src="/images/profile.png" alt="John" className={styles.avatar} />
        <div className={styles.profileInfo}>
          <div className={styles.name}>John David</div>
          <div className={styles.status}>● Online</div>
        </div>
      </div> */}

      <nav className={styles.menu} aria-label="Main menu">
        <div className={styles.menuSection}>General</div>
        <ul>
          <li className={`${styles.menuItem} ${pathname === '/dashboard' ? styles.active : ''}`}>
            <Link href="/dashboard" onClick={handleLink} className={styles.menuLink}>
              <span className={styles.icon}><FaHome /></span>
              <span className={styles.menuText}>Dashboard</span>
            </Link>
          </li>

          <li className={`${styles.menuItem} ${pathname.startsWith('/projects') ? styles.active : ''}`}>
            <Link href="/projects" onClick={handleLink} className={styles.menuLink}>
              <span className={styles.icon}><FaFolderOpen /></span>
              <span className={styles.menuText}>Projects</span>
            </Link>
          </li>

          {/* Funds */}
          <li className={styles.menuItem}>
            <button
              type="button"
              className={styles.menuButton}
              aria-expanded={openFunds}
              onClick={(e) => toggleOrFlyout('funds', setOpenFunds, openFunds, e)}
            >
              <span className={styles.icon}><FaMoneyBillWave /></span>
              <span className={styles.menuText}>Funds</span>
              <span className={styles.caret} aria-hidden><FaChevronDown /></span>
            </button>

            {!collapsed && openFunds && (
              <ul className={styles.submenu}>
                <li className={styles.menuItem}><Link href="/funds/inflow" onClick={handleLink}><span className={styles.icon}><FaArrowUp/></span><span className={styles.menuText}>Inflow</span></Link></li>
                <li className={styles.menuItem}><Link href="/funds/expense" onClick={handleLink}><span className={styles.icon}><FaArrowDown/></span><span className={styles.menuText}>Expense</span></Link></li>
              </ul>
            )}
          </li>

          {/* Materials */}
          <li className={styles.menuItem}>
            <button
              type="button"
              className={styles.menuButton}
              aria-expanded={openMaterials}
              onClick={(e) => toggleOrFlyout('materials', setOpenMaterials, openMaterials, e)}
            >
              <span className={styles.icon}><FaBoxOpen /></span>
              <span className={styles.menuText}>Materials</span>
              <span className={styles.caret} aria-hidden><FaChevronDown /></span>
            </button>

            {!collapsed && openMaterials && (
              <ul className={styles.submenu}>
                <li className={styles.menuItem}><Link href="/materials/manage" onClick={handleLink}><span className={styles.icon}><FaBoxOpen/></span><span className={styles.menuText}>Manage Stocks</span></Link></li>
                <li className={styles.menuItem}><Link href="/materials/transfer" onClick={handleLink}><span className={styles.icon}><FaExchangeAlt/></span><span className={styles.menuText}>Transfer</span></Link></li>
              </ul>
            )}
          </li>

          {/* Workers */}
          <li className={styles.menuItem}>
            <button
              type="button"
              className={styles.menuButton}
              aria-expanded={openWorkers}
              onClick={(e) => toggleOrFlyout('workers', setOpenWorkers, openWorkers, e)}
            >
              <span className={styles.icon}><FaUsers /></span>
              <span className={styles.menuText}>Workers</span>
              <span className={styles.caret} aria-hidden><FaChevronDown /></span>
            </button>

            {!collapsed && openWorkers && (
              <ul className={styles.submenu}>
                <li className={styles.menuItem}><Link href="/workers/manage" onClick={handleLink}><span className={styles.icon}><FaClipboardList/></span><span className={styles.menuText}>Manage</span></Link></li>
                <li className={styles.menuItem}><Link href="/workers/salary" onClick={handleLink}><span className={styles.icon}><FaMoneyBillWave/></span><span className={styles.menuText}>Salary</span></Link></li>
                <li className={styles.menuItem}><Link href="/workers/advance" onClick={handleLink}><span className={styles.icon}><FaBook/></span><span className={styles.menuText}>Advance</span></Link></li>
              </ul>
            )}
          </li>

          {/* Reports */}
          <li className={styles.menuItem}>
            <button
              type="button"
              className={styles.menuButton}
              aria-expanded={openReports}
              onClick={(e) => toggleOrFlyout('reports', setOpenReports, openReports, e)}
            >
              <span className={styles.icon}><FaChartBar /></span>
              <span className={styles.menuText}>Reports</span>
              <span className={styles.caret} aria-hidden><FaChevronDown /></span>
            </button>

            {!collapsed && openReports && (
              <ul className={styles.submenu}>
                <li className={styles.menuItem}><Link href="/reports/projects" onClick={handleLink}><span className={styles.icon}><FaFolderOpen/></span><span className={styles.menuText}>Projects</span></Link></li>
              </ul>
            )}
          </li>

          {/* Settings */}
          <li className={styles.menuItem}>
            <button
              type="button"
              className={styles.menuButton}
              aria-expanded={openSettings}
              onClick={(e) => toggleOrFlyout('settings', setOpenSettings, openSettings, e)}
            >
              <span className={styles.icon}><FaCog /></span>
              <span className={styles.menuText}>Settings</span>
              <span className={styles.caret} aria-hidden><FaChevronDown /></span>
            </button>

            {!collapsed && openSettings && (
              <ul className={styles.submenu}>
                <li className={styles.menuItem}><Link href="/settings/categories" onClick={handleLink}><span className={styles.icon}><FaBook/></span><span className={styles.menuText}>Categories</span></Link></li>
              </ul>
            )}
          </li>
        </ul>
      </nav>

      <div className={styles.sidebarFooter}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <span className={styles.icon}><FaArrowDown /></span>
          <span className={styles.menuText}>Logout</span>
        </button>
        <div className={styles.copyright}>© WeBuild360</div>
      </div>

      {/* collapsed-mode flyout (render outside main DOM flow for position) */}
      {collapsed && flyout?.key && (
        <div
          className={styles.flyout}
          style={{ top: flyout.top ?? 120, left: `calc(${getComputedStyle(document.documentElement).getPropertyValue('--sidebar-collapsed-width') || '72px'})` }}
          role="dialog"
        >
          {/* map flyout content by key */}
          {flyout.key === 'funds' && (
            <ul className={styles.submenu}>
              <li className={styles.menuItem}><Link href="/funds/inflow" onClick={handleLink}><span className={styles.icon}><FaArrowUp/></span><span className={styles.menuText}>Inflow</span></Link></li>
              <li className={styles.menuItem}><Link href="/funds/expense" onClick={handleLink}><span className={styles.icon}><FaArrowDown/></span><span className={styles.menuText}>Expense</span></Link></li>
            </ul>
          )}
          {flyout.key === 'materials' && (
            <ul className={styles.submenu}>
              <li className={styles.menuItem}><Link href="/materials/manage" onClick={handleLink}><span className={styles.icon}><FaBoxOpen/></span><span className={styles.menuText}>Manage Stocks</span></Link></li>
              <li className={styles.menuItem}><Link href="/materials/transfer" onClick={handleLink}><span className={styles.icon}><FaExchangeAlt/></span><span className={styles.menuText}>Transfer</span></Link></li>
            </ul>
          )}
          {flyout.key === 'workers' && (
            <ul className={styles.submenu}>
              <li className={styles.menuItem}><Link href="/workers/manage" onClick={handleLink}><span className={styles.icon}><FaClipboardList/></span><span className={styles.menuText}>Manage</span></Link></li>
              <li className={styles.menuItem}><Link href="/workers/salary" onClick={handleLink}><span className={styles.icon}><FaMoneyBillWave/></span><span className={styles.menuText}>Salary</span></Link></li>
              <li className={styles.menuItem}><Link href="/workers/advance" onClick={handleLink}><span className={styles.icon}><FaBook/></span><span className={styles.menuText}>Advance</span></Link></li>
            </ul>
          )}
          {flyout.key === 'reports' && (
            <ul className={styles.submenu}>
              <li className={styles.menuItem}><Link href="/reports/projects" onClick={handleLink}><span className={styles.icon}><FaFolderOpen/></span><span className={styles.menuText}>Projects</span></Link></li>
            </ul>
          )}
          {flyout.key === 'settings' && (
            <ul className={styles.submenu}>
              <li className={styles.menuItem}><Link href="/settings/categories" onClick={handleLink}><span className={styles.icon}><FaBook/></span><span className={styles.menuText}>Categories</span></Link></li>
            </ul>
          )}
        </div>
      )}

      {mobileOpen && (
        <button className={styles.mobileClose} onClick={onClose} aria-label="Close menu">✕</button>
      )}
    </aside>
  );
}