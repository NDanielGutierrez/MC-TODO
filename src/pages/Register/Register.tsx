import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateRegisterForm } from "../../features/auth/helpers/validateRegisterForm";
import { registerUser } from "../../features/auth/services/authService";
import { getAuthErrorMessage } from "../../features/auth/helpers/authErrors";
import "./Register.css";

export function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
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
    const validationErrors = validateRegisterForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setStatus("loading");
    try {
      await registerUser(form.email, form.password);
      setStatus("success");
      navigate("/tasks");
    } catch (error) {
      setStatus("error");
      setErrorMessage(getAuthErrorMessage(error));
    }
  };

  return (
    <main className="register-page">
      <section className="register-card" aria-labelledby="register-title">
        <div className="register-card__intro">
          <p className="register-card__eyebrow">Empieza con claridad</p>
          <h1 id="register-title">Crea tu cuenta</h1>
          <p>Organiza tus pendientes en un espacio sencillo y personal.</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit} aria-busy={status === "loading"}>
          <div className="register-form__field">
            <label htmlFor="register-email">Correo electrónico</label>
            <input
              id="register-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tu@correo.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "register-email-error" : undefined}
            />
            {errors.email && <span id="register-email-error" className="register-form__error">{errors.email}</span>}
          </div>

          <div className="register-form__field">
            <label htmlFor="register-password">Contraseña</label>
            <input
              id="register-password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "register-password-error" : undefined}
            />
            {errors.password && <span id="register-password-error" className="register-form__error">{errors.password}</span>}
          </div>

          <div className="register-form__field">
            <label htmlFor="register-confirm-password">Confirmar contraseña</label>
            <input
              id="register-confirm-password"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? "register-confirm-error" : undefined}
            />
            {errors.confirmPassword && <span id="register-confirm-error" className="register-form__error">{errors.confirmPassword}</span>}
          </div>

          <button className="register-form__submit" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          {status === "success" && <p className="register-form__success" role="status">Registro exitoso</p>}
          {status === "error" && <p className="register-form__alert" role="alert">{errorMessage}</p>}
        </form>

        <p className="register-card__switch">
          ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </section>
    </main>
  );
}
