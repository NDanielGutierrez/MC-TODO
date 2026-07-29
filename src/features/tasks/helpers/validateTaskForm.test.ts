import { describe, expect, it, vi, afterEach } from "vitest";
import { validateTaskForm } from "./validateTaskForm";

describe("validateTaskForm", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("rechaza un título vacío", () => {
    const errors = validateTaskForm({ title: "   ", description: "" });

    expect(errors.title).toBe("El título es requerido");
  });

  it.each([
    ["ab", "El título debe tener al menos 3 caracteres"],
    ["a".repeat(31), "El título no puede superar los 30 caracteres"],
  ])("rechaza un título fuera de los límites", (title, expectedMessage) => {
    const errors = validateTaskForm({ title, description: "" });

    expect(errors.title).toBe(expectedMessage);
  });

  it("permite una descripción vacía", () => {
    const errors = validateTaskForm({ title: "Tarea válida", description: "" });

    expect(errors.description).toBeUndefined();
  });

  it("rechaza una descripción mayor de 280 caracteres", () => {
    const errors = validateTaskForm({
      title: "Tarea válida",
      description: "a".repeat(281),
    });

    expect(errors.description).toBe(
      "La descripción no puede superar los 280 caracteres",
    );
  });

  it("rechaza una fecha anterior a hoy", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-29T12:00:00"));

    const errors = validateTaskForm({
      title: "Tarea válida",
      description: "",
      dueDate: "2026-07-28",
    });

    expect(errors.dueDate).toBe(
      "La fecha de vencimiento no puede ser anterior a hoy",
    );
  });

  it("acepta un formulario válido", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-29T12:00:00"));

    const errors = validateTaskForm({
      title: "Preparar exposición",
      description: "Revisar las diapositivas",
      dueDate: "2026-07-30",
    });

    expect(errors).toEqual({});
  });
});
