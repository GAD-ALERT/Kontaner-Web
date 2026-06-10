import { Bell, Search } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import type { NavigateFn, Route } from '../types';

interface NavItem {
  label: string;
  route: Route;
}

const navItems: readonly NavItem[] = [
  { label: 'Discover', route: '/discover' },
  { label: 'My Library', route: '/library' },
  { label: 'Collections', route: '/collections' },
] as const;

interface LayoutProps {
  activeRoute: string;
  navigate: NavigateFn;
  children: ReactNode;
}

export function Layout({ activeRoute, navigate, children }: LayoutProps) {
  return (
    <div className="app-shell">
      <Header activeRoute={activeRoute} navigate={navigate} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

interface HeaderProps {
  activeRoute: string;
  navigate: NavigateFn;
}

function Header({ activeRoute, navigate }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const showSearch = activeRoute !== '/discover';
  const activeNavRoute =
    activeRoute === '/asset' || activeRoute === '/search' ? '/library' : activeRoute;

  const submitSearch = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const query = searchTerm.trim() || 'market woman';
    navigate(`/search?query=${encodeURIComponent(query)}`);
  };

  return (
    <header className="topbar">
      <button className="brand" type="button" onClick={() => navigate('/discover')}>
        Kontaner
      </button>

      <nav className="primary-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <button
            className={activeNavRoute === item.route ? 'nav-link active' : 'nav-link'}
            key={item.route}
            type="button"
            onClick={() => navigate(item.route)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="topbar-actions">
        {showSearch ? (
          <form className="top-search" onSubmit={submitSearch}>
            <input
              aria-label="Search assets"
              placeholder={
                activeRoute === '/library' ? 'Search your library...' : 'Search assets...'
              }
              value={searchTerm}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(event.target.value)
              }
            />
            <button aria-label="Search" type="submit">
              <Search size={21} />
            </button>
          </form>
        ) : null}
        <button className="icon-button" aria-label="Notifications" type="button">
          <Bell size={21} />
        </button>
        <button
          className="topbar-upload"
          type="button"
          onClick={() => navigate('/upload')}
        >
          Upload
        </button>
        <button
          className="avatar-button"
          type="button"
          onClick={() => navigate('/settings')}
          aria-label="Account settings"
        >
          AM
        </button>
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
        <a href="#/discover">Browse Assets</a>
        <a href="#/upload">Upload Guide</a>
        <a href="#/discover">Licensing</a>
        <a href="#/discover">Privacy</a>
        <a href="#/discover">Support</a>
      </nav>
    </footer>
  );
}
