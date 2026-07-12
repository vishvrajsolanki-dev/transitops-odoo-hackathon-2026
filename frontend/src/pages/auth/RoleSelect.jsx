import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './RoleSelect.css';

const ROLES = [
  {
    id: 'fleet_manager',
    label: 'Fleet Manager',
    description: 'Full access — manage vehicles, drivers, trips, maintenance, analytics & settings.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="4" y="12" width="28" height="12" rx="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M10 12V9a5 5 0 015-5h6a5 5 0 015 5v3" stroke="currentColor" strokeWidth="2"/>
        <circle cx="11" cy="28" r="3" stroke="currentColor" strokeWidth="2"/>
        <circle cx="25" cy="28" r="3" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    modules: ['Dashboard', 'Fleet', 'Drivers', 'Trips', 'Maintenance', 'Analytics', 'Settings'],
  },
  {
    id: 'driver',
    label: 'Driver',
    description: 'Creates trips, assigns vehicles and drivers, monitors active deliveries.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M6 18h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M18 6v24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3"/>
        <circle cx="6" cy="18" r="4" stroke="currentColor" strokeWidth="2"/>
        <circle cx="30" cy="18" r="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M11 10l7-5 7 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    modules: ['Dashboard', 'Trips', 'Fuel & Expenses'],
  },
  {
    id: 'safety_officer',
    label: 'Safety Officer',
    description: 'Monitor fleet health, driver safety scores, and maintenance compliance.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M18 4L6 10v8c0 7.7 5.1 14.9 12 17 6.9-2.1 12-9.3 12-17v-8L18 4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M13 18l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    modules: ['Dashboard', 'Fleet', 'Drivers', 'Maintenance', 'Analytics'],
  },
  {
    id: 'financial_analyst',
    label: 'Financial Analyst',
    description: 'Review fleet costs, fuel expenses, maintenance budgets and financial analytics.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M5 30V20" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M13 30V14" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M21 30V18" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M29 30V8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M5 18l8-6 8 4 8-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    modules: ['Dashboard', 'Fleet', 'Drivers', 'Maintenance', 'Fuel & Expenses', 'Analytics'],
  },
];

export default function RoleSelect() {
  const navigate = useNavigate();
  const { isAuthenticated, hasSelectedRole, selectRole, logout, user } = useAuth();
  const [hoveredRole, setHoveredRole] = useState(null);

  // Must be authenticated to reach this page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If role already selected, go to app
  if (hasSelectedRole) {
    return <Navigate to="/" replace />;
  }

  function handleSelectRole(roleId) {
    selectRole(roleId);
    navigate('/', { replace: true });
  }

  function handleBack() {
    logout();
    navigate('/login');
  }

  return (
    <div className="role-select-page">
      <div className="role-select-container">
        {/* Back button at top */}
        <button className="role-select-back-btn" onClick={handleBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to sign in
        </button>

        <div className="role-select-header">
          <div className="role-select-logo">
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="var(--color-accent)"/>
              <path d="M14 32V20L24 14L34 20V32L24 38L14 32Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
              <circle cx="24" cy="26" r="4" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <h1>Choose your role</h1>
          <p>
            Select a role to customize your dashboard and navigation.
            {user?.email && (
              <span className="role-select-email"> Signed in as <strong>{user.email}</strong></span>
            )}
          </p>
        </div>

        <div className="role-select-grid">
          {ROLES.map((role) => (
            <button
              key={role.id}
              className={`role-card ${hoveredRole === role.id ? 'role-card--hovered' : ''}`}
              onClick={() => handleSelectRole(role.id)}
              onMouseEnter={() => setHoveredRole(role.id)}
              onMouseLeave={() => setHoveredRole(null)}
            >
              <div className="role-card-icon">{role.icon}</div>
              <h3 className="role-card-label">{role.label}</h3>
              <p className="role-card-description">{role.description}</p>
              <div className="role-card-modules">
                {role.modules.map((mod) => (
                  <span key={mod} className="role-card-module-tag">{mod}</span>
                ))}
              </div>
              <div className="role-card-arrow">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          ))}
        </div>

        <p className="role-select-note">
          Demo mode — role selection scopes your view for this session only.
        </p>
      </div>
    </div>
  );
}
