import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoForm } from "./TodoForm";

const mocks = vi.hoisted(() => ({
  createTask: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock("../../../auth/context/useAuth", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("../../services/taskServices", () => ({
  createTask: mocks.createTask,
}));

vi.mock("../../helpers/taskErrors", () => ({
  getTaskErrorMessage: () => "No se pudo crear la tarea",
}));

vi.mock("sonner", () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

describe("TodoForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useAuth.mockReturnValue({
      user: { uid: "user-123" },
      loading: false,
      logout: vi.fn(),
    });
  });

  it("muestra errores y no crea una tarea con datos inválidos", async () => {
    const user = userEvent.setup();
    render(<TodoForm />);

    await user.click(screen.getByRole("button", { name: "Agregar tarea" }));

    expect(screen.getByText("El título es requerido")).toBeInTheDocument();
    expect(mocks.createTask).not.toHaveBeenCalled();
  });

  it("crea una tarea con todos los datos y limpia el formulario", async () => {
    const user = userEvent.setup();
    mocks.createTask.mockResolvedValue({ id: "task-1" });
    render(<TodoForm />);

    await user.type(screen.getByLabelText("Título"), "Preparar exposición");
    await user.type(screen.getByLabelText(/Descripción/), "Revisar diapositivas");
    await user.selectOptions(screen.getByLabelText("Prioridad"), "high");
    await user.type(screen.getByLabelText(/Vencimiento/), "2099-12-31");
    await user.click(screen.getByRole("button", { name: "Agregar tarea" }));

    await waitFor(() => {
      expect(mocks.createTask).toHaveBeenCalledWith("user-123", {
        title: "Preparar exposición",
        description: "Revisar diapositivas",
        priority: "high",
        dueDate: "2099-12-31",
      });
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Tarea creada");
    expect(screen.getByLabelText("Título")).toHaveValue("");
    expect(screen.getByLabelText("Prioridad")).toHaveValue("medium");
  });

  it("muestra feedback cuando el servicio falla", async () => {
    const user = userEvent.setup();
    mocks.createTask.mockRejectedValue(new Error("Firebase unavailable"));
    render(<TodoForm />);

    await user.type(screen.getByLabelText("Título"), "Tarea válida");
    await user.click(screen.getByRole("button", { name: "Agregar tarea" }));

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith(
        "No se pudo crear la tarea",
      );
    });
    expect(screen.getByRole("button", { name: "Agregar tarea" })).toBeEnabled();
  });

  it("no intenta crear una tarea sin un usuario autenticado", async () => {
    const user = userEvent.setup();
    mocks.useAuth.mockReturnValue({
      user: null,
      loading: false,
      logout: vi.fn(),
    });
    render(<TodoForm />);

    await user.type(screen.getByLabelText("Título"), "Tarea válida");
    await user.click(screen.getByRole("button", { name: "Agregar tarea" }));

    expect(mocks.createTask).not.toHaveBeenCalled();
  });
});
