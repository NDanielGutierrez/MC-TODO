import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { validateLoginForm } from "../../features/auth/helpers/validateloginForm";
import { getAuthErrorMessage } from "../../features/auth/helpers/authErrors";
import { loginUser } from "../../features/auth/services/authService";

export function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: ""});
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
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" />
      {errors.email && <span>{errors.email}</span>}
      <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" />
      {errors.password && <span>{errors.password}</span>}
      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Iniciando sesión..." : "Iniciar Sesión"}
      </button>
      {status === "error" && <p className="text-red-500">{errorMessage}</p>}
    </form>
  );
}

