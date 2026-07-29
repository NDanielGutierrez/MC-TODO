import type { User } from "firebase/auth";
import type { Task } from "../types/task.types";

export async function sendTaskSummary(user: User, tasks: Task[]): Promise<void> {
  const idToken = await user.getIdToken();
  const response = await fetch("/api/send-email", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tasks: tasks.map(({ title, description, completed }) => ({
        title,
        description,
        completed,
      })),
    }),
  });

  if (!response.ok) {
    let message = "No se pudo enviar el resumen";

    try {
      const result: unknown = await response.json();

      if (
        typeof result === "object" &&
        result !== null &&
        "error" in result &&
        typeof result.error === "string"
      ) {
        message = result.error;
      }
    } catch {
      // Vercel puede devolver texto plano cuando la función no logra iniciar.
    }

    throw new Error(message);
  }
}
