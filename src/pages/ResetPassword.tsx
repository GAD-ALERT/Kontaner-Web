import { Archive, CheckCircle2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../lib/api';

export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!token) return setError('This reset link is missing its token.');
    if (password !== confirmation) return setError('Passwords do not match.');
    setSubmitting(true);
    setError('');
    try {
      await apiRequest('/auth/reset-password', { method: 'POST', body: { token, password } });
      setComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password could not be reset.');
    } finally { setSubmitting(false); }
  };

  return (
    <main className="login-page">
      <section className="login-visual"><div className="login-overlay">
        <div className="login-brand"><span><Archive size={28} /></span><strong>Kontaner</strong></div>
        <h1>Choose a secure new password.</h1>
      </div></section>
      <section className="login-panel">
        {complete ? <div className="forgot-sent">
          <div className="forgot-check"><CheckCircle2 size={48} /></div>
          <h2>Password updated</h2><p>You can now sign in with your new password.</p>
          <Link className="primary-button login-submit" to="/login">Sign in</Link>
        </div> : <form className="login-form" onSubmit={(event) => void submit(event)}>
          <p className="eyebrow">Account recovery</p><h2>Set a new password</h2>
          <label>New password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <label>Confirm password<input required minLength={8} type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button login-submit" type="submit" disabled={submitting || !token}>{submitting ? 'Updating…' : 'Update password'}</button>
        </form>}
      </section>
    </main>
  );
}
