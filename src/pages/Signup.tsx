import { Archive, CheckCircle2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/auth';
import { ApiError } from '../lib/api';

const roles = [
  'Visual Designer',
  'Photographer',
  'Illustrator',
  'Creative Director',
  'Studio',
  'Student',
] as const;

export function Signup() {
  const navigate = useNavigate();
  const signup = useAuth((s) => s.signup);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<string>(roles[0]);
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signup({ name, email, password, role });
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to create your account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual signup-visual">
        <div className="login-overlay">
          <div className="login-brand">
            <span>
              <Archive size={28} />
            </span>
            <strong>Kontaner</strong>
          </div>
          <h1>Build your creative library, one upload at a time.</h1>
          <ul>
            <li>
              <CheckCircle2 size={14} />
              Free 20 GB to start
            </li>
            <li>
              <CheckCircle2 size={14} />
              AI tags every upload in seconds
            </li>
            <li>
              <CheckCircle2 size={14} />
              Built for the Ghanaian creative scene
            </li>
            <li>
              <CheckCircle2 size={14} />
              No credit card required
            </li>
          </ul>
        </div>
      </section>
      <section className="login-panel">
        <form className="login-form" onSubmit={(event) => void handleSubmit(event)}>
          <p className="eyebrow">Get started free</p>
          <h2>Create your Kontaner account</h2>
          <label>
            Full Name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ama Serwaa"
            />
          </label>
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
            Password
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={8}
            />
          </label>
          <label>
            I work as
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          {error && <p role="alert" className="form-error">{error}</p>}
          <button className="primary-button login-submit" type="submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
          <p className="signup-copy">
            Already have one? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
