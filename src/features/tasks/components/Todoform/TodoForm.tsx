import { useState } from "react";
import { useAuth } from "../../../auth/context/useAuth";
import { createTask } from "../../services/taskServices";
import { getTaskErrorMessage } from "../../helpers/taskErrors";

export function TodoForm() {
  const { user } = useAuth();
  const [form, setForm] = useState({ title: "", description: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!user) return;

    setStatus("loading");
    try {
      await createTask(user.uid, form);
      setForm({ title: "", description: "" });
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setErrorMessage(getTaskErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" value={form.title} onChange={handleChange} placeholder="Título" />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descripción" />
      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Guardando..." : "Agregar tarea"}
      </button>
      {status === "error" && <span>{errorMessage}</span>}
    </form>
  );
}
