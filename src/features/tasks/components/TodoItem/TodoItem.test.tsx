import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Task } from "../../types/task.types";
import { TodoItem } from "./TodoItem";

const mocks = vi.hoisted(() => ({
  toggleTaskCompleted: vi.fn(),
  deleteTask: vi.fn(),
  updateTask: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: () => undefined } },
}));

vi.mock("../../services/taskServices", () => ({
  toggleTaskCompleted: mocks.toggleTaskCompleted,
  deleteTask: mocks.deleteTask,
  updateTask: mocks.updateTask,
}));

vi.mock("../../helpers/taskErrors", () => ({
  getTaskErrorMessage: () => "No se pudo actualizar la tarea",
}));

vi.mock("sonner", () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

const task: Task = {
  id: "task-1",
  title: "Preparar exposición",
  description: "Revisar diapositivas",
  completed: false,
  userId: "user-123",
  createdAt: {} as Task["createdAt"],
  priority: "medium",
  dueDate: null,
  order: 0,
};

describe("TodoItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.toggleTaskCompleted.mockResolvedValue(undefined);
    mocks.deleteTask.mockResolvedValue(undefined);
    mocks.updateTask.mockResolvedValue(undefined);
  });

  it("cambia una tarea pendiente a completada", async () => {
    const user = userEvent.setup();
    render(<TodoItem task={task} dragEnabled />);

    await user.click(screen.getByRole("checkbox"));

    await waitFor(() => {
      expect(mocks.toggleTaskCompleted).toHaveBeenCalledWith("task-1", true);
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Tarea completada");
  });

  it("elimina la tarea seleccionada", async () => {
    const user = userEvent.setup();
    render(<TodoItem task={task} dragEnabled />);

    await user.click(
      screen.getByRole("button", { name: 'Eliminar "Preparar exposición"' }),
    );

    await waitFor(() => {
      expect(mocks.deleteTask).toHaveBeenCalledWith("task-1");
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Tarea eliminada");
  });

  it("edita todos los campos configurables", async () => {
    const user = userEvent.setup();
    render(<TodoItem task={task} dragEnabled />);

    await user.click(screen.getByRole("button", { name: "Editar" }));
    await user.clear(screen.getByLabelText("Título"));
    await user.type(screen.getByLabelText("Título"), "Exposición final");
    await user.clear(screen.getByLabelText(/Descripción/));
    await user.type(screen.getByLabelText(/Descripción/), "Ensayar contenido");
    await user.selectOptions(screen.getByLabelText("Prioridad"), "high");
    await user.type(screen.getByLabelText(/Vencimiento/), "2099-12-31");
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => {
      expect(mocks.updateTask).toHaveBeenCalledWith("task-1", {
        title: "Exposición final",
        description: "Ensayar contenido",
        priority: "high",
        dueDate: "2099-12-31",
      });
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Tarea editada");
  });

  it("muestra un error cuando Firebase rechaza una actualización", async () => {
    const user = userEvent.setup();
    mocks.toggleTaskCompleted.mockRejectedValue(
      new Error("Firebase unavailable"),
    );
    render(<TodoItem task={task} dragEnabled />);

    await user.click(screen.getByRole("checkbox"));

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith(
        "No se pudo actualizar la tarea",
      );
    });
  });
});
