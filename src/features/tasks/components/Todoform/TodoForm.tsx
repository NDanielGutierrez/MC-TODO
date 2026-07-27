import { useState } from "react";
import { useAuth } from "../../../auth/context/useAuth";
import { createTask } from "../../services/taskServices";
import { getTaskErrorMessage } from "../../helpers/taskErrors";
import { validateTaskForm } from "../../helpers/validateTaskForm";
import "./TodoForm.css";

export function TodoForm() {
  const { user } = useAuth();
  const [form, setForm] = useState({ title: "", description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!user) return;

    const validationErrors = validateTaskForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
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
    <form className="todo-form" onSubmit={handleSubmit} aria-busy={status === "loading"}>
      <div className="todo-form__heading">
        <p className="todo-form__eyebrow">Nueva tarea</p>
        <h2>¿Qué necesitas hacer?</h2>
      </div>

      <div className="todo-form__field">
        <label htmlFor="task-title">Título</label>
        <input
          id="task-title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Ej. Preparar presentación"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "task-title-error" : undefined}
        />
        {errors.title && (
          <p id="task-title-error" className="todo-form__error">
            {errors.title}
          </p>
        )}
      </div>

      <div className="todo-form__field">
        <label htmlFor="task-description">Descripción</label>
        <textarea
          id="task-description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Agrega los detalles importantes"
          rows={5}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? "task-description-error" : undefined}
        />
        {errors.description && (
          <p id="task-description-error" className="todo-form__error">
            {errors.description}
          </p>
        )}
      </div>

      <button className="todo-form__submit" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Guardando..." : "Agregar tarea"}
      </button>
      {status === "error" && <p className="todo-form__alert" role="alert">{errorMessage}</p>}
    </form>
  );
}
