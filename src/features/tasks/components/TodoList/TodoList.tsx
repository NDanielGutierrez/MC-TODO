import type { Task } from "../../types/task.types";
import { TodoItem } from "../TodoItem/TodoItem"

interface TodoListProps {
  tasks: Task[];
  loading: boolean;
}

export function TodoList({ tasks, loading }: TodoListProps) {
  if (loading) {
    return <p>Cargando tareas...</p>;
  }

  if (tasks.length === 0) {
    return <p>Todavia no haz creado una tarea</p>;
  }

  return (
    <ul>
      {tasks.map((task) => (
        <TodoItem key={task.id} task={task} />
      ))}
    </ul>
  );
}