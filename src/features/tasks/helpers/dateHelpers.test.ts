import { afterEach, describe, expect, it, vi } from "vitest";
import { getDueDateLabel, getTodayDate } from "./dateHelpers";

describe("dateHelpers", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("obtiene la fecha local en formato ISO", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-29T12:00:00"));

    expect(getTodayDate()).toBe("2026-07-29");
  });

  it("prioriza el estado completado", () => {
    expect(getDueDateLabel("2026-07-20", true)).toBe("Completada");
  });

  it("devuelve null cuando no hay fecha", () => {
    expect(getDueDateLabel(null, false)).toBeNull();
  });

  it.each([
    ["2026-07-29", "Vence hoy"],
    ["2026-07-30", "Falta 1 día"],
    ["2026-08-01", "Faltan 3 días"],
    ["2026-07-28", "Expiró ayer"],
    ["2026-07-26", "Expiró hace 3 días"],
  ])("calcula la etiqueta de vencimiento para %s", (dueDate, expectedLabel) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-29T12:00:00"));

    expect(getDueDateLabel(dueDate, false)).toBe(expectedLabel);
  });
});
