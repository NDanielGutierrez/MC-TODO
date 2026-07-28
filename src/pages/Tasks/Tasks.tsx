import { useTasks } from "../../features/tasks/hooks/useTasks";
import { TodoForm } from "../../features/tasks/components/TodoForm/TodoForm";
import { TodoList } from "../../features/tasks/components/TodoList/TodoList";
import { EmailSummary } from "../../features/tasks/components/EmailSummary/EmailSummary";
import "./Tasks.css";

export function Tasks() {
  const { tasks, loading } = useTasks();

  return (
    <main className="tasks-page">
      <header className="tasks-page__header">
        <div>
          <p className="tasks-page__eyebrow">Tu espacio de trabajo</p>
          <h1>Mis tareas</h1>
          <p>Organiza tus pendientes y mantén el foco.</p>
        </div>

        <EmailSummary tasks={tasks} loading={loading} />
      </header>

      <div className="tasks-page__layout">
        <aside className="tasks-page__form-panel">
          <TodoForm />
        </aside>

        <section className="tasks-page__list-panel" aria-labelledby="tasks-list-title">
          <h2 id="tasks-list-title">Lista de tareas</h2>
          <TodoList tasks={tasks} loading={loading} />
        </section>
      </div>
    </main>
  );
}
