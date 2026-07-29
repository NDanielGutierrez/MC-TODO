import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import type { Task, TaskFormData } from "../../types/task.types";
import { deleteTask, toggleTaskCompleted, updateTask } from "../../services/taskServices";
import { getTaskErrorMessage } from "../../helpers/taskErrors";
import { getDueDateLabel, getTodayDate } from "../../helpers/dateHelpers";
import { validateTaskForm } from "../../helpers/validateTaskForm";
import "./TodoItem.css";

interface TodoItemProps {
  task: Task;
  dragEnabled: boolean;
}

const priorityLabels = { low: "Baja", medium: "Media", high: "Alta" };

export function TodoItem({ task, dragEnabled }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editForm, setEditForm] = useState<TaskFormData>({
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate ?? "",
  });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !dragEnabled || isEditing,
  });
  const sortableStyle = { transform: CSS.Transform.toString(transform), transition };

  const handleToggle = async () => {
    try {
      await toggleTaskCompleted(task.id, !task.completed);
      toast.success(task.completed ? "Tarea marcada como pendiente" : "Tarea completada");
    } catch (error) {
      toast.error(getTaskErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
      toast.success("Tarea eliminada");
    } catch (error) {
      toast.error(getTaskErrorMessage(error));
    }
  };

  const handleEditClick = () => {
    setEditForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ?? "",
    });
    setErrors({});
    setIsEditing(true);
  };

  const handleEditChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setEditForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => {
      const nextErrors = { ...previous };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const handleSave = async () => {
    const validationErrors = validateTaskForm(editForm);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await updateTask(task.id, editForm);
      setIsEditing(false);
      toast.success("Tarea editada");
    } catch (error) {
      toast.error(getTaskErrorMessage(error));
    }
  };

  const priorityClass = `todo-item--priority-${task.priority}`;

  if (isEditing) {
    return (
      <li ref={setNodeRef} style={sortableStyle} className={`todo-item todo-item--editing ${priorityClass}`}>
        <div className="todo-item__edit-field">
          <label htmlFor={`edit-title-${task.id}`}>Título</label>
          <input id={`edit-title-${task.id}`} name="title" value={editForm.title} onChange={handleEditChange} aria-invalid={Boolean(errors.title)} />
          {errors.title && <p className="todo-item__error">{errors.title}</p>}
        </div>
        <div className="todo-item__edit-field">
          <label htmlFor={`edit-description-${task.id}`}>Descripción <span>(opcional)</span></label>
          <textarea id={`edit-description-${task.id}`} name="description" value={editForm.description} onChange={handleEditChange} rows={3} aria-invalid={Boolean(errors.description)} />
          {errors.description && <p className="todo-item__error">{errors.description}</p>}
        </div>
        <div className="todo-item__edit-row">
          <div className="todo-item__edit-field">
            <label htmlFor={`edit-priority-${task.id}`}>Prioridad</label>
            <select id={`edit-priority-${task.id}`} name="priority" value={editForm.priority} onChange={handleEditChange}>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
          <div className="todo-item__edit-field">
            <label htmlFor={`edit-due-date-${task.id}`}>Vencimiento <span>(opcional)</span></label>
            <input id={`edit-due-date-${task.id}`} name="dueDate" type="date" min={getTodayDate()} value={editForm.dueDate} onChange={handleEditChange} aria-invalid={Boolean(errors.dueDate)} />
            {errors.dueDate && <p className="todo-item__error">{errors.dueDate}</p>}
          </div>
        </div>
        <div className="todo-item__actions">
          <button className="todo-item__button todo-item__button--primary" type="button" onClick={handleSave}>Guardar</button>
          <button className="todo-item__button" type="button" onClick={() => setIsEditing(false)}>Cancelar</button>
        </div>
      </li>
    );
  }

  const dueDateLabel = getDueDateLabel(task.dueDate, task.completed);
  const isExpired = !task.completed && Boolean(task.dueDate && task.dueDate < getTodayDate());

  return (
    <li
      ref={setNodeRef}
      style={sortableStyle}
      className={`todo-item ${priorityClass}${task.completed ? " todo-item--completed" : ""}${isDragging ? " todo-item--dragging" : ""}`}
    >
      <div className={`todo-item__content${dragEnabled ? " todo-item__content--draggable" : ""}`}>
        {dragEnabled && (
          <button className="todo-item__drag-handle" type="button" aria-label={`Reordenar "${task.title}"`} {...attributes} {...listeners}>
            <span /><span /><span />
          </button>
        )}
        <input className="todo-item__checkbox" type="checkbox" checked={task.completed} onChange={handleToggle} aria-label={`Marcar "${task.title}" como ${task.completed ? "pendiente" : "completada"}`} />
        <div className="todo-item__copy">
          <div className="todo-item__title-row">
            <h3>{task.title}</h3>
            <span className="todo-item__priority">Prioridad {priorityLabels[task.priority]}</span>
          </div>
          {task.description && <p>{task.description}</p>}
          {dueDateLabel && <p className={`todo-item__due-date${isExpired ? " todo-item__due-date--expired" : ""}`}>{dueDateLabel}</p>}
        </div>
      </div>
      <div className="todo-item__actions">
        <button className="todo-item__button" type="button" onClick={handleEditClick}>Editar</button>
        <button className="todo-item__button todo-item__button--danger todo-item__icon-button" type="button" onClick={handleDelete} aria-label={`Eliminar "${task.title}"`}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" /></svg>
        </button>
      </div>
    </li>
  );
}
