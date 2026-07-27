import { useState } from "react";
import type { Task } from "../../types/task.types";
import { toggleTaskCompleted, deleteTask, updateTask } from "../../services/taskServices";
import "./TodoItem.css";

interface TodoItemProps {
  task: Task;
}

export function TodoItem({ task }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: task.title, description: task.description });

  const handleToggle = async () => {
    if (!task.id) return;
    try {
      await toggleTaskCompleted(task.id, !task.completed);
    } catch (error) {
      console.error("Error al actualizar la tarea:", error);
    }
  };

  const handleDelete = async () => {
    if (!task.id) return;
    try {
      await deleteTask(task.id);
    } catch (error) {
      console.error("Error al eliminar la tarea:", error);
    }
  };

  const handleEditClick = () => {
    setEditForm({ title: task.title, description: task.description });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!task.id) return;
    try {
      await updateTask(task.id, editForm);
      setIsEditing(false);
    } catch (error) {
      console.error("Error al editar la tarea:", error);
    }
  };

  if (isEditing) {
    return (
      <li className="todo-item todo-item--editing">
        <div className="todo-item__edit-field">
          <label htmlFor={`edit-title-${task.id}`}>Título</label>
          <input id={`edit-title-${task.id}`} name="title" value={editForm.title} onChange={handleEditChange} />
        </div>
        <div className="todo-item__edit-field">
          <label htmlFor={`edit-description-${task.id}`}>Descripción</label>
          <textarea id={`edit-description-${task.id}`} name="description" value={editForm.description} onChange={handleEditChange} rows={4} />
        </div>
        <div className="todo-item__actions">
          <button className="todo-item__button todo-item__button--primary" type="button" onClick={handleSave}>Guardar</button>
          <button className="todo-item__button" type="button" onClick={handleCancel}>Cancelar</button>
        </div>
      </li>
    );
  }

  return (
    <li className={`todo-item${task.completed ? " todo-item--completed" : ""}`}>
      <div className="todo-item__content">
        <input
          className="todo-item__checkbox"
          type="checkbox"
          checked={task.completed}
          onChange={handleToggle}
          aria-label={`Marcar "${task.title}" como ${task.completed ? "pendiente" : "completada"}`}
        />
        <div className="todo-item__copy">
          <h3>{task.title}</h3>
          <p>{task.description}</p>
        </div>
      </div>
      <div className="todo-item__actions">
        <button className="todo-item__button" type="button" onClick={handleEditClick}>Editar</button>
        <button className="todo-item__button todo-item__button--danger todo-item__icon-button" type="button" onClick={handleDelete} aria-label={`Eliminar "${task.title}"`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" />
          </svg>
        </button>
      </div>
    </li>
  );
}
