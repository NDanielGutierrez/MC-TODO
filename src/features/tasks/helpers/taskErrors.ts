import { FirebaseError } from "firebase/app";

const TASK_ERROR_MESSAGES: Record<string, string> = {
  "permission-denied": "No tenés permiso para realizar esta acción.",
  "unavailable": "Sin conexión. Verificá tu internet e intentá de nuevo.",
  "not-found": "La tarea que intentás modificar ya no existe.",
  "cancelled": "La operación fue cancelada.",
};

export function getTaskErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return TASK_ERROR_MESSAGES[error.code] ?? "Ocurrió un error con la tarea. Intentalo nuevamente.";
  }

  return "Ocurrió un error inesperado. Intentalo nuevamente.";
}