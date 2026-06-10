import { Archive, CheckCircle2 } from 'lucide-react';
import type { FormEvent } from 'react';
import type { NavigateFn } from '../types';

interface LoginProps {
  navigate: NavigateFn;
}

export function Login({ navigate }: LoginProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    navigate('/discover');
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
              <CheckCircle2 size={12} />
              Auto-tagged in seconds
            </li>
            <li>
              <CheckCircle2 size={12} />
              Search in plain English
            </li>
            <li>
              <CheckCircle2 size={12} />
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
            <input type="email" placeholder="name@creativehub.com" />
          </label>
          <label>
            <span className="label-row">
              Password
              <a href="#/login">Forgot password?</a>
            </span>
            <input type="password" placeholder="••••••••" />
          </label>
          <button className="primary-button login-submit" type="submit">
            Sign in
          </button>
          <p className="signup-copy">
            New to Kontaner? <a href="#/login">Create an account</a>
          </p>
        </form>
      </section>
    </main>
  );
}
