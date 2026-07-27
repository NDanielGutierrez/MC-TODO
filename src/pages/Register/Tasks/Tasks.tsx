import { useTasks } from "../../../features/tasks/hooks/useTasks";
import { TodoForm } from "../../../features/tasks/components/TodoForm/TodoForm";
import { TodoList } from "../../../features/tasks/components/TodoList/TodoList";

export function Tasks() {
  const { tasks, loading } = useTasks();

  return (
    <div>
      <h1>Mis Tareas</h1>
      <TodoForm />
      <TodoList tasks={tasks} loading={loading} />
    </div>
  );
}