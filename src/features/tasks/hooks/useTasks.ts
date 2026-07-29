import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { useAuth } from "../../auth/context/useAuth";
import { persistTaskOrder } from "../services/taskServices";
import type { Task, TaskPriority } from "../types/task.types";

function isTaskPriority(value: unknown): value is TaskPriority {
  return value === "low" || value === "medium" || value === "high";
}

function mapTask(docSnapshot: QueryDocumentSnapshot<DocumentData>): Task {
  const data = docSnapshot.data();
  const createdAtMillis =
    typeof data.createdAt?.toMillis === "function"
      ? data.createdAt.toMillis()
      : 0;

  return {
    id: docSnapshot.id,
    title: typeof data.title === "string" ? data.title : "",
    description: typeof data.description === "string" ? data.description : "",
    completed: data.completed === true,
    userId: typeof data.userId === "string" ? data.userId : "",
    createdAt: data.createdAt,
    priority: isTaskPriority(data.priority) ? data.priority : "medium",
    dueDate: typeof data.dueDate === "string" ? data.dueDate : null,
    order: typeof data.order === "number" ? data.order : -createdAtMillis,
  };
}

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(!!user);

  useEffect(() => {
    if (!user) {
      return;
    }

    const tasksQuery = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs
        .map(mapTask)
        .sort((first, second) => first.order - second.order);

      setTasks(tasksData);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const reorderTasks = async (orderedTasks: Task[]) => {
    const previousTasks = tasks;
    const nextTasks = orderedTasks.map((task, index) => ({
      ...task,
      order: index,
    }));

    setTasks(nextTasks);

    try {
      await persistTaskOrder(nextTasks);
    } catch (error) {
      setTasks(previousTasks);
      throw error;
    }
  };

  return { tasks, loading, reorderTasks };
}
