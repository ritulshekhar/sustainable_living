import { NavLink } from 'react-router-dom';
import './Navbar.css';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/activity', icon: '✏️', label: 'Log Activity' },
  { to: '/social', icon: '👥', label: 'Social' },
  { to: '/tips', icon: '💡', label: 'Tips' },
  { to: '/profile', icon: '👤', label: 'Profile' },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span className="logo-icon">🌿</span>
        <div>
          <div className="logo-title">CarbonTrack</div>
          <div className="logo-sub">Sustainability Tracker</div>
        </div>
      </div>

      <div className="navbar-divider" />

      <ul className="navbar-links">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="navbar-footer">
        <div className="co2-badge">
          <span className="co2-dot" />
          <span>Live Tracking</span>
        </div>
      </div>
    </nav>
  );
}
