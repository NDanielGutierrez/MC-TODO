interface TaskFormValues {
  title: string;
  description: string;
}

export function validateTaskForm(values: TaskFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  const title = values.title.trim();

  if (!title) {
    errors.title = "El título es requerido";
  } else if (title.length < 3) {
    errors.title = "El título debe tener al menos 3 caracteres";
  } else if (title.length > 30) {
    errors.title = "El título no puede superar los 30 caracteres";
  }

  if (values.description.length > 280) {
    errors.description = "La descripción no puede superar los 280 caracteres";
  }

  return errors;
}
