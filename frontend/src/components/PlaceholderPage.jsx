import './PlaceholderPage.css';

const MODULE_ICONS = {
  Dashboard: '📊',
  Fleet: '🚛',
  Drivers: '👤',
  Trips: '🗺️',
  Maintenance: '🔧',
  'Fuel & Expenses': '⛽',
  Analytics: '📈',
  Settings: '⚙️',
};

/**
 * Reusable placeholder page rendered for modules that haven't been
 * implemented yet. Shows a styled "Coming Soon" card with the module name.
 */
export default function PlaceholderPage({ title = 'Module' }) {
  const icon = MODULE_ICONS[title] || '📦';

  return (
    <div className="placeholder-page">
      <div className="placeholder-card">
        <span className="placeholder-icon">{icon}</span>
        <h1 className="placeholder-title">{title}</h1>
        <p className="placeholder-text">
          This module is under development and will be available soon.
        </p>
        <div className="placeholder-badge">Coming Soon</div>
      </div>
    </div>
  );
}
