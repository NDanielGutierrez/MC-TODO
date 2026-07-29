import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import type { Task } from "../../types/task.types";
import { TodoList } from "./TodoList";

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({
    children,
    onDragEnd,
  }: {
    children: ReactNode;
    onDragEnd: (event: {
      active: { id: string };
      over: { id: string };
    }) => void;
  }) => (
    <div>
      {children}
      <button
        type="button"
        onClick={() =>
          onDragEnd({ active: { id: "task-1" }, over: { id: "task-2" } })
        }
      >
        Simular reordenamiento
      </button>
    </div>
  ),
  KeyboardSensor: class KeyboardSensor {},
  MouseSensor: class MouseSensor {},
  TouchSensor: class TouchSensor {},
  closestCenter: vi.fn(),
  useSensor: vi.fn(() => ({})),
  useSensors: vi.fn(() => []),
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: ReactNode }) => children,
  arrayMove: (items: Task[], oldIndex: number, newIndex: number) => {
    const result = [...items];
    const [movedItem] = result.splice(oldIndex, 1);
    result.splice(newIndex, 0, movedItem);
    return result;
  },
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: vi.fn(),
}));

vi.mock("../TodoItem/TodoItem", () => ({
  TodoItem: ({
    task,
    dragEnabled,
  }: {
    task: Task;
    dragEnabled: boolean;
  }) => (
    <li>
      <span>{task.title}</span>
      {dragEnabled && (
        <button type="button" aria-label={`Reordenar "${task.title}"`}>
          Asa
        </button>
      )}
    </li>
  ),
}));

const tasks: Task[] = [
  {
    id: "task-1",
    title: "Primera tarea",
    description: "",
    completed: false,
    userId: "user-123",
    createdAt: {} as Task["createdAt"],
    priority: "medium",
    dueDate: null,
    order: 0,
  },
  {
    id: "task-2",
    title: "Segunda tarea",
    description: "",
    completed: true,
    userId: "user-123",
    createdAt: {} as Task["createdAt"],
    priority: "high",
    dueDate: null,
    order: 1,
  },
];

describe("TodoList", () => {
  it("muestra el estado de carga", () => {
    render(
      <TodoList
        tasks={[]}
        loading
        reorderEnabled
        onReorder={vi.fn()}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Cargando tareas...");
  });

  it("muestra el estado vacío", () => {
    render(
      <TodoList
        tasks={[]}
        loading={false}
        reorderEnabled
        onReorder={vi.fn()}
      />,
    );

    expect(screen.getByText("No hay tareas en esta vista.")).toBeInTheDocument();
  });

  it("oculta las asas cuando el reordenamiento está deshabilitado", () => {
    render(
      <TodoList
        tasks={tasks}
        loading={false}
        reorderEnabled={false}
        onReorder={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /Reordenar "Primera tarea"/ }),
    ).not.toBeInTheDocument();
  });

  it("entrega las tareas en el nuevo orden después de arrastrar", async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn().mockResolvedValue(undefined);
    render(
      <TodoList
        tasks={tasks}
        loading={false}
        reorderEnabled
        onReorder={onReorder}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Simular reordenamiento" }),
    );

    await waitFor(() => {
      expect(onReorder).toHaveBeenCalledWith([tasks[1], tasks[0]]);
    });
  });
});
