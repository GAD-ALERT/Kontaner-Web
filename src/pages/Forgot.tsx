import { Archive, MailCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

export function Forgot() {
  const [email, setEmail] = useState<string>('');
  const [sent, setSent] = useState<boolean>(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setSent(true);
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
          <h1>We'll send you a reset link.</h1>
          <p className="forgot-hint">
            Check your inbox in a few seconds. If nothing arrives, peek inside
            the spam folder.
          </p>
        </div>
      </section>
      <section className="login-panel">
        {sent ? (
          <div className="forgot-sent">
            <div className="forgot-check">
              <MailCheck size={48} />
            </div>
            <h2>Reset link on the way</h2>
            <p>
              We've sent a password reset link to <strong>{email}</strong>.
            </p>
            <Link className="primary-button login-submit" to="/login">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            <p className="eyebrow">No worries</p>
            <h2>Reset your password</h2>
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
            <button className="primary-button login-submit" type="submit">
              Send reset link
            </button>
            <p className="signup-copy">
              Remembered it? <Link to="/login">Sign in</Link>
            </p>
          </form>
        )}
      </section>
    </main>
  );
}
