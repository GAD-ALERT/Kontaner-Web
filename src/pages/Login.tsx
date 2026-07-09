import { Icon } from '../components/Icon';
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/auth';

interface LocationState {
  from?: string;
}

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuth((s) => s.login);
  const loginAsGuest = useAuth((s) => s.loginAsGuest);

  const intended = (location.state as LocationState | null)?.from ?? '/';

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    login(email || 'ama.serwaa@kontaner.studio');
    navigate(intended);
  };

  const handleGuest = (): void => {
    loginAsGuest();
    navigate(intended);
  };

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-overlay">
          <div className="login-brand">
            <span>
              <Icon name="inventory_2" size={24} />
            </span>
            <strong>Kontaner</strong>
          </div>
          <h1>Your creative library, intelligently organised.</h1>
          <ul>
            <li>
              <Icon name="check_circle" size={16} filled />
              Auto-tagged in seconds
            </li>
            <li>
              <Icon name="check_circle" size={16} filled />
              Search in plain English
            </li>
            <li>
              <Icon name="check_circle" size={16} filled />
              Your library, organised intelligently
            </li>
          </ul>
        </div>
      </section>
      <section className="login-panel">
        <form className="login-form" onSubmit={handleSubmit}>
          <p className="eyebrow">Welcome back</p>
          <h2>Sign in to Kontaner</h2>
          <label>
            Email Address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@creativehub.com"
            />
          </label>
          <label>
            <span className="label-row">
              Password
              <Link to="/forgot">Forgot password?</Link>
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>
          <button className="primary-button login-submit" type="submit">
            Sign in
          </button>
          <button
            className="login-guest"
            type="button"
            onClick={handleGuest}
          >
            Continue as guest
          </button>
          <p className="signup-copy">
            New to Kontaner? <Link to="/signup">Create an account</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
