import logo from '../../assets/images/Cooper-Standard-Logo.jpeg';

const navItems = [
  { route: '/dashboard', label: 'Dashboard' }
];

export default function AppShell({ children, route, onNavigate, status }) {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand-mark">
          <img src={logo} alt="Cooper Standard" className="brand-logo" />
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <button
              key={item.route}
              type="button"
              className={route === item.route ? 'nav-item active' : 'nav-item'}
              onClick={() => onNavigate(item.route)}
            >
              <span className="nav-indicator" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className={status === 'ready' ? 'status-dot ready' : 'status-dot'} />
          <span>{status === 'ready' ? 'CSV connected' : 'Loading data'}</span>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
