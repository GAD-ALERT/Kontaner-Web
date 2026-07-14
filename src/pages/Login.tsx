import { Archive, CheckCircle2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/auth';
import { ApiError } from '../lib/api';

interface LocationState {
  from?: string;
}

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuth((s) => s.login);

  const queryFrom = new URLSearchParams(location.search).get('from');
  const requestedDestination = (location.state as LocationState | null)?.from ?? queryFrom;
  const intended = requestedDestination?.startsWith('/') ? requestedDestination : '/';

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(intended);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-overlay">
          <div className="login-brand">
            <span>
              <Archive size={28} />
            </span>
            <strong>Kontaner</strong>
          </div>
          <h1>Your creative library, intelligently organised.</h1>
          <ul>
            <li>
              <CheckCircle2 size={14} />
              Auto-tagged in seconds
            </li>
            <li>
              <CheckCircle2 size={14} />
              Search in plain English
            </li>
            <li>
              <CheckCircle2 size={14} />
              Your library, organised intelligently
            </li>
          </ul>
        </div>
      </section>
      <section className="login-panel">
        <form className="login-form" onSubmit={(event) => void handleSubmit(event)}>
          <p className="eyebrow">Welcome back</p>
          <h2>Sign in to Kontaner</h2>
          <label>
            Email Address
            <input
              required
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
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>
          {error && <p role="alert" className="form-error">{error}</p>}
          <button className="primary-button login-submit" type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="signup-copy">
            New to Kontaner? <Link to="/signup">Create an account</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
