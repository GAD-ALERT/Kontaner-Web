import { Bell, ChevronDown, LogOut, Search, Settings, User } from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/auth';
import { useLoginGate } from '../stores/favorites';
import { useNotifications } from '../stores/notifications';
import { LoginGate } from './LoginGate';
import { NotificationsPanel } from './NotificationsPanel';

interface NavItem {
  label: string;
  to: string;
}

const navItems: readonly NavItem[] = [
  { label: 'Discover', to: '/' },
  { label: 'My Library', to: '/library' },
  { label: 'Collections', to: '/collections' },
] as const;

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <Header />
      <main>{children}</main>
      <Footer />
      <LoginGate />
    </div>
  );
}

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const showGate = useLoginGate((s) => s.show);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [notifOpen, setNotifOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const unread = useNotifications((s) =>
    s.items.reduce((n, it) => n + (it.read ? 0 : 1), 0),
  );

  const isLanding = location.pathname === '/';

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const submitSearch = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleUpload = (): void => {
    if (user === null) {
      showGate('Sign in to upload your work');
      return;
    }
    navigate('/upload');
  };

  const handleLogout = (): void => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="topbar">
      <Link className="brand" to="/">
        Kontaner
      </Link>

      <nav className="primary-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <NavLink
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
            key={item.to}
            to={item.to}
            end={item.to === '/'}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="topbar-actions">
        {!isLanding && (
          <form className="top-search" onSubmit={submitSearch}>
            <input
              aria-label="Search assets"
              placeholder="Search assets, tags, creators…"
              value={searchTerm}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(event.target.value)
              }
            />
            <button aria-label="Search" type="submit">
              <Search size={21} />
            </button>
          </form>
        )}

        {user === null ? (
          <>
            <Link className="topbar-signin" to="/login">
              Sign in
            </Link>
            <Link className="topbar-upload" to="/signup">
              Sign up free
            </Link>
          </>
        ) : (
          <>
            <div className="notif-wrap">
              <button
                className="icon-button"
                aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
                aria-expanded={notifOpen}
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
              >
                <Bell size={21} />
                {unread > 0 && (
                  <span className="notif-badge" aria-hidden="true">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
              <NotificationsPanel
                open={notifOpen}
                onClose={() => setNotifOpen(false)}
              />
            </div>
            <button
              className="topbar-upload"
              type="button"
              onClick={handleUpload}
            >
              Upload
            </button>
            <div className="avatar-wrap" ref={menuRef}>
              <button
                className="avatar-button"
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Account menu"
              >
                {user.avatarInitials}
                <ChevronDown size={14} />
              </button>
              {menuOpen && (
                <div className="avatar-menu" role="menu">
                  <div className="avatar-menu-head">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <Link to="/settings" onClick={() => setMenuOpen(false)}>
                    <User size={16} />
                    Profile
                  </Link>
                  <Link to="/settings" onClick={() => setMenuOpen(false)}>
                    <Settings size={16} />
                    Settings
                  </Link>
                  <button type="button" onClick={handleLogout}>
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <strong>Kontaner.</strong>
        <p>© 2026 Kontaner. Built for the Lazy Creative.</p>
      </div>
      <nav aria-label="Footer navigation">
        <Link to="/">Browse Assets</Link>
        <Link to="/upload">Upload Guide</Link>
        <Link to="/legal/licensing">Licensing</Link>
        <Link to="/legal/privacy">Privacy</Link>
        <Link to="/legal/support">Support</Link>
      </nav>
    </footer>
  );
}
