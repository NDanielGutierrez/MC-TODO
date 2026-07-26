interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

export function validateRegisterForm(values: RegisterFormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!values.email) {
    errors.email = "Email es requerido";
  } else if (!emailRegex.test(values.email)) {
    errors.email = "Email inválido";
  }

  if (!values.password) {
    errors.password = "Password es requerido";
  } else if (values.password.length < 6) {
    errors.password = "Password debe tener al menos 6 caracteres";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirmar password es requerido";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Las contraseñas no coinciden";
  }

  return errors;
}