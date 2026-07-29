import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../auth/context/useAuth";
import { createTask } from "../../services/taskServices";
import { getTaskErrorMessage } from "../../helpers/taskErrors";
import { validateTaskForm } from "../../helpers/validateTaskForm";
import { getTodayDate } from "../../helpers/dateHelpers";
import type { TaskFormData } from "../../types/task.types";
import "./TodoForm.css";

const initialForm: TaskFormData = {
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
};

export function TodoForm() {
  const { user } = useAuth();
  const [form, setForm] = useState<TaskFormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => {
      const nextErrors = { ...previous };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!user) return;

    const validationErrors = validateTaskForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await createTask(user.uid, form);
      setForm(initialForm);
      toast.success("Tarea creada");
    } catch (error) {
      toast.error(getTaskErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit} aria-busy={loading}>
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
        {errors.title && <p id="task-title-error" className="todo-form__error">{errors.title}</p>}
      </div>

      <div className="todo-form__field">
        <label htmlFor="task-description">Descripción <span>(opcional)</span></label>
        <textarea
          id="task-description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Agrega los detalles importantes"
          rows={4}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? "task-description-error" : undefined}
        />
        {errors.description && <p id="task-description-error" className="todo-form__error">{errors.description}</p>}
      </div>

      <div className="todo-form__row">
        <div className="todo-form__field">
          <label htmlFor="task-priority">Prioridad</label>
          <select id="task-priority" name="priority" value={form.priority} onChange={handleChange}>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </div>

        <div className="todo-form__field">
          <label htmlFor="task-due-date">Vencimiento <span>(opcional)</span></label>
          <input
            id="task-due-date"
            name="dueDate"
            type="date"
            min={getTodayDate()}
            value={form.dueDate}
            onChange={handleChange}
            aria-invalid={Boolean(errors.dueDate)}
            aria-describedby={errors.dueDate ? "task-due-date-error" : undefined}
          />
          {errors.dueDate && <p id="task-due-date-error" className="todo-form__error">{errors.dueDate}</p>}
        </div>
      </div>

      <button className="todo-form__submit" type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Agregar tarea"}
      </button>
    </form>
  );
}
