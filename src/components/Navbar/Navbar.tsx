import { useAuth } from "../../features/auth/context/useAuth";

export function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav >
      {user && (
        <button onClick={handleLogout}>Cerrar sesión</button>
      )}
    </nav>
  );
}