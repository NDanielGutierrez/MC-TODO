import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { DecodedIdToken } from "firebase-admin/auth";

interface TaskSummaryInput {
  title: string;
  description: string;
  completed: boolean;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta configurar la variable ${name}`);
  }

  return value;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseTasks(value: unknown): TaskSummaryInput[] | null {
  if (!Array.isArray(value) || value.length > 200) {
    return null;
  }

  const tasks: TaskSummaryInput[] = [];

  for (const item of value) {
    if (
      typeof item !== "object" ||
      item === null ||
      !("title" in item) ||
      !("description" in item) ||
      !("completed" in item) ||
      typeof item.title !== "string" ||
      typeof item.description !== "string" ||
      typeof item.completed !== "boolean"
    ) {
      return null;
    }

    const title = item.title.trim();
    const description = item.description.trim();

    if (!title || title.length > 30 || description.length > 280) {
      return null;
    }

    tasks.push({ title, description, completed: item.completed });
  }

  return tasks;
}

function buildEmailHtml(tasks: TaskSummaryInput[]): string {
  const completedCount = tasks.filter((task) => task.completed).length;
  const taskItems = tasks.length === 0
    ? "<p>No tienes tareas registradas.</p>"
    : `<ul>${tasks.map((task) => `
        <li>
          <strong>${escapeHtml(task.title)}</strong>
          — ${task.completed ? "Completada" : "Pendiente"}
          ${task.description ? `<br><span>${escapeHtml(task.description)}</span>` : ""}
        </li>
      `).join("")}</ul>`;

  return `
    <h1>Resumen de tus tareas</h1>
    <p>Total: ${tasks.length} · Completadas: ${completedCount} · Pendientes: ${tasks.length - completedCount}</p>
    ${taskItems}
  `;
}

const region = getRequiredEnv("AWS_REGION");
const sourceEmail = getRequiredEnv("SES_FROM_EMAIL");

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: getRequiredEnv("FIREBASE_ADMIN_PROJECT_ID"),
      clientEmail: getRequiredEnv("FIREBASE_ADMIN_CLIENT_EMAIL"),
      privateKey: getRequiredEnv("FIREBASE_ADMIN_PRIVATE_KEY").replace(/\\n/g, "\n"),
    }),
  });
}
const sesClient = new SESClient({
  region,
  credentials: {
    accessKeyId: getRequiredEnv("AWS_ACCESS_KEY_ID"),
    secretAccessKey: getRequiredEnv("AWS_SECRET_ACCESS_KEY"),
  },
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Autenticación requerida" });
    return;
  }

  const idToken = authorization.slice("Bearer ".length);
  let decodedToken: DecodedIdToken;

  try {
    decodedToken = await getAuth().verifyIdToken(idToken);
  } catch (error) {
    console.warn("Token de Firebase inválido:", error);
    res.status(401).json({ error: "Sesión inválida o expirada" });
    return;
  }

  if (!decodedToken.email) {
    res.status(403).json({ error: "La cuenta no tiene un correo asociado" });
    return;
  }

  const tasks = parseTasks(req.body?.tasks);

  if (!tasks) {
    res.status(400).json({ error: "La lista de tareas no es válida" });
    return;
  }

  try {
    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [decodedToken.email],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: buildEmailHtml(tasks),
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Resumen de tus tareas",
        },
      },
      Source: sourceEmail,
    });

    await sesClient.send(command);
    res.status(200).json({ message: "Correo enviado correctamente" });
  } catch (error) {
    console.error("Error al enviar el correo mediante SES:", error);
    res.status(500).json({ error: "No se pudo enviar el correo" });
  }
}
