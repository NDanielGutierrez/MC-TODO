import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../features/auth/context/useAuth";
import "./Navbar.css";

export function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="navbar" aria-label="Navegación principal">
      <Link className="navbar__brand" to={user ? "/tasks" : "/login"}>
        DeUna✓
      </Link>

      <div className="navbar__actions">
        {user ? (
          <>
            <span className="navbar__user">{user.email}</span>
            <button className="navbar__logout" type="button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <NavLink className="navbar__link" to="/login">
              Iniciar sesión
            </NavLink>
            <NavLink className="navbar__register" to="/register">
              Crear cuenta
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
