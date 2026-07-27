import type { Task } from "../../types/task.types";
import { TodoItem } from "../TodoItem/TodoItem";
import "./TodoList.css";

interface TodoListProps {
  tasks: Task[];
  loading: boolean;
}

export function TodoList({ tasks, loading }: TodoListProps) {
  if (loading) {
    return <div className="todo-list__state" role="status">Cargando tareas...</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="todo-list__state todo-list__state--empty">
        <span aria-hidden="true">✦</span>
        <p>Todavía no has creado una tarea.</p>
        <small>Usa el formulario para agregar la primera.</small>
      </div>
    );
  }

  return (
    <ul className="todo-list" aria-label="Tareas">
      {tasks.map((task) => (
        <TodoItem key={task.id} task={task} />
      ))}
    </ul>
  );
}
