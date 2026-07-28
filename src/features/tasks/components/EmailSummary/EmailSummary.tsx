import { useState } from "react";
import { useAuth } from "../../../auth/context/useAuth";
import { sendTaskSummary } from "../../services/emailService";
import type { Task } from "../../types/task.types";
import "./EmailSummary.css";

interface EmailSummaryProps {
  tasks: Task[];
  loading: boolean;
}

export function EmailSummary({ tasks, loading }: EmailSummaryProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSendSummary = async () => {
    if (!user) return;

    setStatus("loading");
    setMessage("");

    try {
      await sendTaskSummary(user, tasks);
      setStatus("success");
      setMessage("Resumen enviado a tu correo.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo enviar el resumen."
      );
    }
  };

  return (
    <div className="email-summary">
      <button
        className="email-summary__button"
        type="button"
        onClick={handleSendSummary}
        disabled={loading || status === "loading"}
      >
        {status === "loading" ? "Enviando..." : "Enviar resumen"}
      </button>

      {message && (
        <p
          className={`email-summary__message email-summary__message--${status}`}
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      )}
    </div>
  );
}
