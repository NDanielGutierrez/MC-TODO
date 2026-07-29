import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Task } from "../../types/task.types";
import { TodoItem } from "../TodoItem/TodoItem";
import "./TodoList.css";

interface TodoListProps {
  tasks: Task[];
  loading: boolean;
  reorderEnabled: boolean;
  onReorder: (tasks: Task[]) => Promise<void>;
}

export function TodoList({ tasks, loading, reorderEnabled, onReorder }: TodoListProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!reorderEnabled || !over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((task) => task.id === active.id);
    const newIndex = tasks.findIndex((task) => task.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    try {
      await onReorder(arrayMove(tasks, oldIndex, newIndex));
    } catch (error) {
      console.error("Error al reordenar las tareas:", error);
    }
  };

  if (loading) {
    return <div className="todo-list__state" role="status">Cargando tareas...</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="todo-list__state todo-list__state--empty">
        <span aria-hidden="true">✦</span>
        <p>No hay tareas en esta vista.</p>
        <small>Crea una nueva tarea o cambia el filtro.</small>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <ul className="todo-list" aria-label="Tareas">
          {tasks.map((task) => (
            <TodoItem key={task.id} task={task} dragEnabled={reorderEnabled} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
