import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateLoginForm } from "../../features/auth/helpers/validateloginForm";
import { getAuthErrorMessage } from "../../features/auth/helpers/authErrors";
import { loginUser } from "../../features/auth/services/authService";
import "./Login.css";

export function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value
    }));

    setErrors(prev => {
      const nextErrors = { ...prev };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validateLoginForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setStatus("loading");
    try {
      await loginUser(form.email, form.password);
      setStatus("success");
      navigate("/tasks");
    } catch (error) {
      setStatus("error");
      setErrorMessage(getAuthErrorMessage(error));
    }
  };

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-card__intro">
          <p className="login-card__eyebrow">Qué gusto verte</p>
          <h1 id="login-title">Inicia sesión</h1>
          <p>Vuelve a tus tareas y continúa donde lo dejaste.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} aria-busy={status === "loading"}>
          <div className="login-form__field">
            <label htmlFor="login-email">Correo electrónico</label>
            <input
              id="login-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tu@correo.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "login-email-error" : undefined}
            />
            {errors.email && <span id="login-email-error" className="login-form__error">{errors.email}</span>}
          </div>

          <div className="login-form__field">
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Tu contraseña"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "login-password-error" : undefined}
            />
            {errors.password && <span id="login-password-error" className="login-form__error">{errors.password}</span>}
          </div>

          <button className="login-form__submit" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>

          {status === "error" && <p className="login-form__alert" role="alert">{errorMessage}</p>}
        </form>

        <p className="login-card__switch">
          ¿Aún no tienes cuenta? <Link to="/register">Crear cuenta</Link>
        </p>
      </section>
    </main>
  );
}
