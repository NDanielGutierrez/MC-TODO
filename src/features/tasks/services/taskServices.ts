import { collection, addDoc, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";
import type { Task } from "../types/task.types";

export async function createTask(userId: string, data: { title: string; description: string }) {
  return await addDoc(collection(db, "tasks"), {
    title: data.title,
    description: data.description,
    completed: false,
    userId,
    createdAt: Timestamp.now(),
  });
}

export async function updateTask(taskId: string, data: Partial<Pick<Task, "title" | "description">>) {
  const taskRef = doc(db, "tasks", taskId);
  return await updateDoc(taskRef, data);
}

export async function deleteTask(taskId: string) {
  const taskRef = doc(db, "tasks", taskId);
  return await deleteDoc(taskRef);
}

export async function toggleTaskCompleted(taskId: string, completed: boolean) {
  const taskRef = doc(db, "tasks", taskId);
  return await updateDoc(taskRef, { completed });
}