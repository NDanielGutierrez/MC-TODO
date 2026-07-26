import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateRegisterForm } from "../../features/auth/helpers/validateRegisterForm";
import { registerUser } from "../../features/auth/services/authService";
import { getAuthErrorMessage } from "../../features/auth/helpers/authErrors";

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
      navigate("/login");
    } catch (error) {
      setStatus("error");
      setErrorMessage(getAuthErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" />
      {errors.email && <span>{errors.email}</span>}
      <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" />
      {errors.password && <span>{errors.password}</span>}
      <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirmar Password" />
      {errors.confirmPassword && <span>{errors.confirmPassword}</span>}
      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Registrando..." : "Registrarse"}
      </button>
      {status === "success" && <span>Registro exitoso</span>}
      {status === "error" && <span>{errorMessage}</span>}
    </form>
  );
}

