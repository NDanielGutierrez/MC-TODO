import type { Timestamp } from "firebase/firestore";

export interface Task {
  id?: string;
  title: string;
  description: string;
  completed: boolean;
  userId: string;
  createdAt: Timestamp;
}

export type NewTask = Omit<Task, "id" | "createdAt">;