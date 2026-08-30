import { FormEvent, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ApiError, login } from '../api/client';
import { setToken } from '../auth/token';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // `from` arrives either via router state (RequireAuth) or query param (client 401 redirect)
  const state = location.state as { from?: string } | null;
  const from = state?.from ?? searchParams.get('from') ?? '/';

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { token } = await login(username, password);
      setToken(token);
      navigate(from.startsWith('/') ? from : '/', { replace: true });
    } catch (err) {
      // On 401 show the error WITHOUT clearing the entered username (R5.1)
      if (err instanceof ApiError && err.status === 401) {
        setError('Usuario o contraseña incorrectos');
      } else {
        setError(err instanceof Error ? err.message : 'Error de conexión');
      }
      setPassword('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="panel login-panel" onSubmit={onSubmit}>
        <h1>Store Backoffice</h1>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="field">
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
