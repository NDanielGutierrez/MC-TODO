import type { Task } from "../../types/task.types";
import "./TaskProgress.css";

interface TaskProgressProps {
  tasks: Task[];
}

export function TaskProgress({ tasks }: TaskProgressProps) {
  const completed = tasks.filter((task) => task.completed).length;
  const percentage = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

  return (
    <section className="task-progress" aria-label={`Progreso: ${percentage}% de tareas completadas`}>
      <div className="task-progress__chart">
        <svg viewBox="0 0 200 112" role="img" aria-hidden="true">
          <path className="task-progress__track" pathLength="100" d="M20 100 A80 80 0 0 1 180 100" />
          <path
            className="task-progress__value"
            pathLength="100"
            strokeDasharray={`${percentage} 100`}
            d="M20 100 A80 80 0 0 1 180 100"
          />
        </svg>
        <strong>{percentage}%</strong>
      </div>
      <div>
        <p className="task-progress__label">Progreso general</p>
        <p className="task-progress__count">{completed} de {tasks.length} completadas</p>
      </div>
    </section>
  );
}
