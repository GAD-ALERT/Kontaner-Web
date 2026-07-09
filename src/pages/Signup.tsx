import { Icon } from '../components/Icon';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/auth';

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    signup({ name, email, role });
    navigate('/');
  };

  return (
    <main className="login-page">
      <section className="login-visual signup-visual">
        <div className="login-overlay">
          <div className="login-brand">
            <span>
              <Icon name="inventory_2" size={24} />
            </span>
            <strong>Kontaner</strong>
          </div>
          <h1>Build your creative library, one upload at a time.</h1>
          <ul>
            <li>
              <Icon name="check_circle" size={16} filled />
              Free 20 GB to start
            </li>
            <li>
              <Icon name="check_circle" size={16} filled />
              AI tags every upload in seconds
            </li>
            <li>
              <Icon name="check_circle" size={16} filled />
              Built for the Ghanaian creative scene
            </li>
            <li>
              <Icon name="check_circle" size={16} filled />
              No credit card required
            </li>
          </ul>
        </div>
      </section>
      <section className="login-panel">
        <form className="login-form" onSubmit={handleSubmit}>
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
              minLength={6}
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
          <button className="primary-button login-submit" type="submit">
            Create account
          </button>
          <p className="signup-copy">
            Already have one? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
