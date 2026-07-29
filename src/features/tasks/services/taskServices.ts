import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Timestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../../services/firebase";
import type { Task, TaskFormData } from "../types/task.types";

export async function createTask(userId: string, data: TaskFormData) {
  return await addDoc(collection(db, "tasks"), {
    title: data.title.trim(),
    description: data.description.trim(),
    completed: false,
    userId,
    createdAt: Timestamp.now(),
    priority: data.priority,
    dueDate: data.dueDate || null,
    order: -Date.now(),
  });
}

export async function updateTask(
  taskId: string,
  data: Pick<TaskFormData, "title" | "description" | "priority" | "dueDate">
) {
  const taskRef = doc(db, "tasks", taskId);
  return await updateDoc(taskRef, {
    title: data.title.trim(),
    description: data.description.trim(),
    priority: data.priority,
    dueDate: data.dueDate || null,
  });
}

export async function deleteTask(taskId: string) {
  const taskRef = doc(db, "tasks", taskId);
  return await deleteDoc(taskRef);
}

export async function toggleTaskCompleted(taskId: string, completed: boolean) {
  const taskRef = doc(db, "tasks", taskId);
  return await updateDoc(taskRef, { completed });
}

export async function persistTaskOrder(tasks: Task[]) {
  const batch = writeBatch(db);

  tasks.forEach((task, index) => {
    batch.update(doc(db, "tasks", task.id), { order: index });
  });

  await batch.commit();
}
