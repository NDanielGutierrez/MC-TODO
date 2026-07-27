import { useState } from "react";
import type { Task } from "../../types/task.types";
import { toggleTaskCompleted, deleteTask, updateTask } from "../../services/taskServices";

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
      <li>
        <input name="title" value={editForm.title} onChange={handleEditChange} />
        <textarea name="description" value={editForm.description} onChange={handleEditChange} />
        <button onClick={handleSave}>Guardar</button>
        <button onClick={handleCancel}>Cancelar</button>
      </li>
    );
  }

  return (
    <li>
      <input type="checkbox" checked={task.completed} onChange={handleToggle} />
      <span>{task.title}</span>
      <p>{task.description}</p>
      <button onClick={handleEditClick}>Editar</button>
      <button onClick={handleDelete}>🗑️</button>
    </li>
  );
}