interface LoginFormValues {
  email: string;
  password: string;

}

export function validateLoginForm(values: LoginFormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!values.email) {
    errors.email = "Email es requerido";
  } else if (!emailRegex.test(values.email)) {
    errors.email = "Email inválido";
  }

  if (!values.password) {
    errors.password = "Password es requerido";

  }

  return errors;
}