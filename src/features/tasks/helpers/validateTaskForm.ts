interface TaskFormValues {
  title: string;
  description: string;
  dueDate?: string;
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

  if (values.dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(`${values.dueDate}T00:00:00`);

    if (selectedDate < today) {
      errors.dueDate = "La fecha de vencimiento no puede ser anterior a hoy";
    }
  }

  return errors;
}
