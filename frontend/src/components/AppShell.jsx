import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AppShell.css';

/* ── Navigation Configuration (role-gated) ────────────── */
const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/',
    icon: 'dashboard',
    roles: null, // visible to all
  },
  {
    label: 'Fleet',
    path: '/fleet',
    icon: 'fleet',
    roles: ['fleet_manager', 'safety_officer', 'financial_analyst'],
  },
  {
    label: 'Drivers',
    path: '/drivers',
    icon: 'drivers',
    roles: ['fleet_manager', 'safety_officer', 'financial_analyst'],
  },
  {
    label: 'Trips',
    path: '/trips',
    icon: 'trips',
    roles: ['fleet_manager', 'driver'],
  },
  {
    label: 'Maintenance',
    path: '/maintenance',
    icon: 'maintenance',
    roles: ['fleet_manager', 'safety_officer', 'financial_analyst'],
  },
  {
    label: 'Fuel & Expenses',
    path: '/fuel-expenses',
    icon: 'fuel',
    roles: ['driver', 'financial_analyst'],
  },
  {
    label: 'Analytics',
    path: '/analytics',
    icon: 'analytics',
    roles: ['fleet_manager', 'safety_officer', 'financial_analyst'],
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: 'settings',
    roles: ['fleet_manager'],
  },
];

/* ── Inline SVG icons ─────────────────────────────────── */
function NavIcon({ name }) {
  const icons = {
    dashboard: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="2" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <rect x="12" y="2" width="8" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
        <rect x="12" y="8" width="8" height="12" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <rect x="2" y="12" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
    fleet: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="8" width="16" height="8" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M6 8V6a3 3 0 013-3h4a3 3 0 013 3v2" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="15" cy="18" r="2" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
    drivers: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M3 19c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    trips: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 11h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M11 4v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="3 2"/>
        <circle cx="4" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="18" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M7 6l4-3 4 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    maintenance: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M14.7 3.3a5 5 0 00-6.4 6.4L3 15l2 2 1-1 1 1 1-1 1 1 5.3-5.3a5 5 0 00-6.4-6.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="13" cy="7" r="1" fill="currentColor"/>
      </svg>
    ),
    fuel: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="4" width="10" height="15" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M13 10h2a2 2 0 012 2v4a2 2 0 002 2v0a2 2 0 002-2V8l-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="5.5" y="7" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    analytics: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 19V13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M8 19V9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M13 19V11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M18 19V5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    settings: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M11 2v2M11 18v2M2 11h2M18 11h2M4.9 4.9l1.4 1.4M15.7 15.7l1.4 1.4M4.9 17.1l1.4-1.4M15.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  };

  return icons[name] || null;
}

/* Friendly role label display */
function formatRole(role) {
  const map = {
    fleet_manager: 'Fleet Manager',
    driver: 'Driver',
    safety_officer: 'Safety Officer',
    financial_analyst: 'Financial Analyst',
  };
  return map[role] || role;
}

export default function AppShell() {
  const { user, activeRole, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Nav filtering uses the activeRole selected on the RoleSelect screen
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => item.roles === null || item.roles.includes(activeRole)
  );

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  function toggleSidebar() {
    setSidebarCollapsed((prev) => !prev);
  }

  function toggleMobileMenu() {
    setMobileMenuOpen((prev) => !prev);
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <div className={`appshell ${sidebarCollapsed ? 'appshell--collapsed' : ''}`}>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="appshell-overlay" onClick={closeMobileMenu} />
      )}

      {/* Sidebar */}
      <aside className={`appshell-sidebar ${mobileMenuOpen ? 'appshell-sidebar--mobile-open' : ''}`}>
        <div className="appshell-sidebar-header">
          <div className="appshell-logo">
            <div className="appshell-logo-icon">
              <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="var(--color-accent)"/>
                <path d="M14 32V20L24 14L34 20V32L24 38L14 32Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
                <circle cx="24" cy="26" r="4" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
            {!sidebarCollapsed && <span className="appshell-logo-text">TransitOps</span>}
          </div>
          <button
            className="appshell-collapse-btn desktop-only"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d={sidebarCollapsed ? 'M7 4l5 5-5 5' : 'M11 4L6 9l5 5'}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <nav className="appshell-nav">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `appshell-nav-item ${isActive ? 'appshell-nav-item--active' : ''}`
              }
              onClick={closeMobileMenu}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="appshell-nav-icon">
                <NavIcon name={item.icon} />
              </span>
              {!sidebarCollapsed && (
                <span className="appshell-nav-label">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="appshell-sidebar-footer">
          <div className="appshell-user-info">
            <div className="appshell-user-avatar">
              {user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="appshell-user-details">
                <span className="appshell-user-email">{user?.email}</span>
                <span className="appshell-user-role">{formatRole(activeRole)}</span>
              </div>
            )}
          </div>
          <button
            className="appshell-logout-btn"
            onClick={handleLogout}
            title="Sign out"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 17H4a1 1 0 01-1-1V4a1 1 0 011-1h3M13 14l4-4-4-4M17 10H7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="appshell-main">
        {/* Top bar */}
        <header className="appshell-topbar">
          <button
            className="appshell-mobile-menu-btn mobile-only"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          <div className="appshell-topbar-greeting">
            <span className="appshell-topbar-welcome">Welcome back,</span>
            <span className="appshell-topbar-name">{user?.email?.split('@')[0]?.replace('.', ' ')}</span>
          </div>

          <div className="appshell-topbar-right">
            <div className="appshell-role-badge">
              {formatRole(activeRole)}
            </div>
          </div>
        </header>

        {/* Page content (nested routes render here) */}
        <main className="appshell-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
