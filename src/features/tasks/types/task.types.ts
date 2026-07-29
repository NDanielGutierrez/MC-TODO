import type { Timestamp } from "firebase/firestore";

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  userId: string;
  createdAt: Timestamp;
  priority: TaskPriority;
  dueDate: string | null;
  order: number;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
}

export type TaskFilter = "all" | "pending" | "completed";
