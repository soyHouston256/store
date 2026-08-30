import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { clearToken, getToken } from './token';

export default function RequireAuth() {
  const location = useLocation();
  const navigate = useNavigate();

  if (!getToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  const logout = () => {
    clearToken();
    navigate('/login', { replace: true });
  };

  return (
    <div className="layout">
      <header className="topbar">
        <div className="topbar-left">
          <Link to="/" className="brand">
            Store Backoffice
          </Link>
          <nav className="topnav">
            <NavLink to="/" end>
              Productos
            </NavLink>
            <NavLink to="/orders">Pedidos</NavLink>
          </nav>
        </div>
        <button type="button" className="btn btn-ghost" onClick={logout}>
          Salir
        </button>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
