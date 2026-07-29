const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export function getTodayDate(): string {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60 * 1000;
  return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

export function getDueDateLabel(
  dueDate: string | null,
  completed: boolean
): string | null {
  if (completed) {
    return "Completada";
  }

  if (!dueDate) {
    return null;
  }

  const today = new Date(`${getTodayDate()}T00:00:00`);
  const due = new Date(`${dueDate}T00:00:00`);
  const difference = Math.round((due.getTime() - today.getTime()) / ONE_DAY_IN_MS);

  if (difference === 0) return "Vence hoy";
  if (difference === 1) return "Falta 1 día";
  if (difference > 1) return `Faltan ${difference} días`;
  if (difference === -1) return "Expiró ayer";
  return `Expiró hace ${Math.abs(difference)} días`;
}
