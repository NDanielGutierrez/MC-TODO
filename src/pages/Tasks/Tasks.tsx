import { useMemo, useState } from "react";
import { useTasks } from "../../features/tasks/hooks/useTasks";
import { TodoForm } from "../../features/tasks/components/TodoForm/TodoForm";
import { TodoList } from "../../features/tasks/components/TodoList/TodoList";
import { EmailSummary } from "../../features/tasks/components/EmailSummary/EmailSummary";
import { TaskProgress } from "../../features/tasks/components/TaskProgress/TaskProgress";
import { TaskFilters } from "../../features/tasks/components/TaskFilters/TaskFilters";
import type { TaskFilter } from "../../features/tasks/types/task.types";
import "./Tasks.css";

export function Tasks() {
  const { tasks, loading, reorderTasks } = useTasks();
  const [filter, setFilter] = useState<TaskFilter>("all");

  const filteredTasks = useMemo(() => {
    if (filter === "pending") return tasks.filter((task) => !task.completed);
    if (filter === "completed") return tasks.filter((task) => task.completed);
    return tasks;
  }, [filter, tasks]);

  const counts = {
    all: tasks.length,
    pending: tasks.filter((task) => !task.completed).length,
    completed: tasks.filter((task) => task.completed).length,
  };

  return (
    <main className="tasks-page">
      <header className="tasks-page__header">
        <div>
          <p className="tasks-page__eyebrow">Tu espacio de trabajo</p>
          <h1>Mis tareas</h1>
          <p>Organiza tus pendientes y mantén el foco.</p>
        </div>

        <div className="tasks-page__summary">
          <TaskProgress tasks={tasks} />
          <EmailSummary tasks={tasks} loading={loading} />
        </div>
      </header>

      <div className="tasks-page__layout">
        <aside className="tasks-page__form-panel">
          <TodoForm />
        </aside>

        <section className="tasks-page__list-panel" aria-labelledby="tasks-list-title">
          <h2 id="tasks-list-title">Lista de tareas</h2>
          <TaskFilters activeFilter={filter} counts={counts} onChange={setFilter} />
          <TodoList
            tasks={filteredTasks}
            loading={loading}
            reorderEnabled={filter === "all"}
            onReorder={reorderTasks}
          />
        </section>
      </div>
    </main>
  );
}
