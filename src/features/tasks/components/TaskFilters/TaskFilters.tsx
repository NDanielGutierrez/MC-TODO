import type { TaskFilter } from "../../types/task.types";
import "./TaskFilters.css";

interface TaskFiltersProps {
  activeFilter: TaskFilter;
  counts: Record<TaskFilter, number>;
  onChange: (filter: TaskFilter) => void;
}

const filters: Array<{ value: TaskFilter; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "completed", label: "Completadas" },
];

export function TaskFilters({ activeFilter, counts, onChange }: TaskFiltersProps) {
  return (
    <div className="task-filters" aria-label="Filtrar tareas">
      {filters.map((filter) => (
        <button
          key={filter.value}
          className={`task-filters__button${activeFilter === filter.value ? " task-filters__button--active" : ""}`}
          type="button"
          aria-pressed={activeFilter === filter.value}
          onClick={() => onChange(filter.value)}
        >
          {filter.label}
          <span>{counts[filter.value]}</span>
        </button>
      ))}
    </div>
  );
}
