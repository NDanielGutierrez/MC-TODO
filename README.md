# MC-TODO

Aplicación web SPA de gestión de tareas con autenticación de usuarios, persistencia en tiempo real y notificaciones por email. Desarrollada como Proyecto Integrador (Módulo 4 · Full Stack) .

**Demo en producción:** [mc-todo-rho.vercel.app](https://mc-todo-rho.vercel.app/login)
**Repositorio:** [github.com/NDanielGutierrez/MC-TODO](https://github.com/NDanielGutierrez/MC-TODO)

---

## Índice

- [Descripción](#descripción)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura y decisiones de diseño](#arquitectura-y-decisiones-de-diseño)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Instalación local](#instalación-local)
- [Variables de entorno](#variables-de-entorno)
- [Flujo de envío de emails](#flujo-de-envío-de-emails)
- [Seguridad](#seguridad)
- [Testing](#testing)
- [Deploy](#deploy)
- [Funcionalidades extra](#funcionalidades-extra)
- [Uso de IA en el desarrollo](#uso-de-ia-en-el-desarrollo) -[Documentacion uso de IA](#documentacion-uso-de-ia)

---

## Descripción

MC-TODO permite a un usuario registrarse, iniciar sesión y gestionar sus propias tareas (crear, editar, completar, eliminar) con persistencia en tiempo real en la nube. Cada usuario solo tiene acceso a sus propias tareas. Adicionalmente, puede solicitar el envío de un resumen de su lista de tareas a su correo electrónico.

## Stack tecnológico

| Capa               | Tecnología                                          |
| ------------------ | --------------------------------------------------- |
| Frontend           | React 19 + TypeScript, Vite                         |
| Enrutamiento       | React Router DOM                                    |
| Autenticación      | Firebase Authentication (Email/Password)            |
| Base de datos      | Cloud Firestore (tiempo real)                       |
| Backend serverless | Vercel Functions                                    |
| Envío de emails    | AWS SES + `firebase-admin` (verificación de sesión) |
| Reordenamiento     | `@dnd-kit`                                          |
| Notificaciones UI  | `sonner`                                            |
| Testing            | Vitest + React Testing Library                      |

## Arquitectura y decisiones de diseño

**Organización por capas y por dominio.** El código bajo `src/features/` se agrupa por dominio (`auth`, `tasks`), y cada dominio contiene sus propios `components/`, `hooks/`, `services/` y `helpers/`. Los componentes verdaderamente genéricos (sin lógica de negocio) viven en `src/components/`. Esto evita que una carpeta `components/` única mezcle responsabilidades de dominios distintos a medida que el proyecto crece.

**Autenticación centralizada con Context API.** `AuthProvider` se suscribe una única vez a `onAuthStateChanged` de Firebase y expone `{ user, loading, logout }` a toda la aplicación mediante `useAuth()`. El campo `loading` existe específicamente para distinguir "todavía no sé si hay sesión" de "confirmé que no hay sesión", evitando redirecciones prematuras al recargar la página.

**Separación de tipos de un componente/contexto en archivos propios.** `AuthContext`, su tipo `AuthContextValue` y el hook `useAuth` viven en archivos separados del componente `AuthProvider`, requerido por las reglas de Fast Refresh de Vite (un archivo que exporta JSX no puede exportar también hooks o contexto sin perder el hot-reload en caliente).

**Servicios como funciones puras.** `authService.ts` y `taskServices.ts` no dependen de React ni de hooks — reciben datos primitivos (por ejemplo `userId: string`), no acceden a contexto por sí mismos. Esto los hace testeables de forma aislada, sin necesidad de renderizar componentes ni mockear el árbol de React.

**Sincronización en tiempo real vía `onSnapshot`.** El hook `useTasks` escucha cambios en la colección `tasks` filtrada por `userId`, por lo que crear, editar, eliminar o completar una tarea actualiza la interfaz automáticamente, sin recargar la página.

**Componentes presentacionales vs. contenedores.** `TodoList` y `EmailSummary` reciben `tasks`/`loading` como props en lugar de llamar a `useTasks()` internamente. La página `Tasks.tsx` es la única responsable de obtener los datos, lo que simplifica testear estos componentes con datos de prueba.

**Backend serverless para credenciales sensibles.** Las credenciales de AWS y la cuenta de servicio de Firebase Admin solo existen en variables de entorno del lado del servidor (Vercel Functions), nunca en el bundle del cliente. El frontend no habla directo con AWS SES bajo ninguna circunstancia.

## Estructura del proyecto

```
MC-TODO/
├─ api/
│  └─ send-email.ts          # Vercel Function: verifica sesión y envía resumen vía SES
├─ src/
│  ├─ components/            # Componentes genéricos (Navbar, AppToaster)
│  ├─ features/
│  │  ├─ auth/
│  │  │  ├─ context/          # AuthContext, AuthProvider, useAuth
│  │  │  ├─ helpers/          # validaciones y traducción de errores de Firebase Auth
│  │  │  └─ services/         # authService.ts (register/login/logout)
│  │  └─ tasks/
│  │     ├─ components/       # TodoForm, TodoList, TodoItem, TaskFilters, TaskProgress, EmailSummary
│  │     ├─ helpers/          # validación de tareas, cálculo de fechas de vencimiento
│  │     ├─ hooks/             # useTasks (onSnapshot en tiempo real)
│  │     ├─ services/          # taskServices.ts, emailService.ts
│  │     └─ types/             # interface Task
│  ├─ pages/                  # Login, Register, Tasks
│  ├─ routes/                 # ProtectedRoute
│  ├─ services/                # firebase.ts (inicialización compartida)
│  └─ test/                   # setup de Vitest
├─ vercel.json
└─ .env.example
```

## Instalación local

```bash
git clone https://github.com/NDanielGutierrez/MC-TODO.git
cd MC-TODO
npm install
cp .env.example .env   # completar con credenciales reales, ver sección siguiente
npm run dev
```

Para probar la función de envío de email localmente (requiere las variables de backend configuradas):

```bash
npm install -g vercel
vercel dev
```

## Variables de entorno

Ver `.env.example` para la plantilla completa. Ninguna de estas claves se sube al repositorio (`.env` está en `.gitignore`).

**Frontend (expuestas al navegador, prefijo obligatorio `VITE_`):**

| Variable                            | Descripción                             |
| ----------------------------------- | --------------------------------------- |
| `VITE_FIREBASE_API_KEY`             | Config pública del proyecto de Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Dominio de autenticación                |
| `VITE_FIREBASE_PROJECT_ID`          | ID del proyecto                         |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Bucket de almacenamiento                |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ID de mensajería                        |
| `VITE_FIREBASE_APP_ID`              | ID de la app registrada                 |

**Backend / Vercel Functions (nunca expuestas al cliente):**

| Variable                      | Descripción                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------- |
| `AWS_REGION`                  | Región de AWS donde está configurado SES                                         |
| `AWS_ACCESS_KEY_ID`           | Access Key de un usuario IAM con permisos mínimos (solo SES)                     |
| `AWS_SECRET_ACCESS_KEY`       | Secret Key correspondiente                                                       |
| `SES_FROM_EMAIL`              | Dirección remitente verificada en SES                                            |
| `FIREBASE_ADMIN_PROJECT_ID`   | Project ID de la cuenta de servicio de Firebase Admin                            |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Email de la cuenta de servicio                                                   |
| `FIREBASE_ADMIN_PRIVATE_KEY`  | Clave privada de la cuenta de servicio (con saltos de línea escapados como `\n`) |

## Flujo de envío de emails

1. El usuario, autenticado y con al menos una tarea, hace clic en "Enviar resumen" (`EmailSummary`).
2. El cliente obtiene un ID token fresco de Firebase (`user.getIdToken()`) y lo envía como header `Authorization: Bearer <token>` junto con su lista de tareas al endpoint `POST /api/send-email`.
3. La función serverless (`api/send-email.ts`) verifica el token con `firebase-admin`. Si no es válido o no está presente, responde `401` sin llamar a AWS.
4. El destino del email se toma del **email verificado del token decodificado**, no de un valor enviado por el cliente — un usuario autenticado solo puede enviarse el resumen a sí mismo.
5. Las tareas recibidas se validan estrictamente (forma, tipos, longitudes) y su contenido se sanitiza (`escapeHtml`) antes de insertarse en el HTML del email, para prevenir inyección.
6. Se arma el HTML del resumen (total, completadas, pendientes) y se envía mediante AWS SES (`@aws-sdk/client-ses`), usando un usuario IAM con permisos acotados exclusivamente a SES.
7. La cuenta de SES está en **modo sandbox**: solo puede enviar a direcciones de correo previamente verificadas en la consola de AWS. Para pruebas fuera de un email propio verificado, sería necesario solicitar acceso de producción a AWS.

## Seguridad

- Las reglas de Firestore (`firestore.rules`) exigen que el usuario esté autenticado y que el `userId` del documento coincida con el `uid` de quien hace la petición, tanto para lectura/eliminación como para escritura/edición (evitando que se reasigne el dueño de una tarea vía update). También validan la forma y tipos de los campos.
- Las credenciales de AWS y la cuenta de servicio de Firebase Admin solo existen como variables de entorno del servidor; nunca se incluyen en el bundle del frontend.
- El endpoint `/api/send-email` exige un token de sesión válido y determina el destinatario a partir de ese token, no de un valor enviado por el cliente.
- El usuario IAM usado para AWS SES tiene permisos limitados exclusivamente a ese servicio (no es la cuenta root ni tiene acceso administrativo).

## Testing

```bash
npm run test
```

Cobertura incluida (Vitest + React Testing Library, con Firebase y `dnd-kit` mockeados — sin llamadas externas reales):

- Validación de formularios de tareas y cálculo de fechas límite.
- Creación de tareas válida e inválida, incluyendo simulación de error de Firebase.
- Completar, eliminar y editar tareas.
- Estados de carga y lista vacía.
- Activación del asa de arrastre y reordenamiento de tareas.

## Deploy

Desplegado en Vercel: [mc-todo-rho.vercel.app](https://mc-todo-rho.vercel.app/login). Incluye rewrites configurados en `vercel.json` para que las rutas de React Router (`/login`, `/register`, `/tasks`) funcionen correctamente al recargar o acceder de forma directa.

## Funcionalidades extra

Como complemento a los requerimientos principales del proyecto, se agregaron funcionalidades orientadas a mejorar la organización de las tareas, la experiencia de usuario y la visualización del progreso.

Progreso de tareas

Se incorporó un indicador semicircular que muestra el porcentaje de tareas completadas. El cálculo siempre considera el total de tareas del usuario, independientemente del filtro seleccionado.

Prioridades

Cada tarea puede clasificarse con una de las siguientes prioridades:

- Baja: borde verde.
- Media: borde naranja.
- Alta: borde rojo.

La prioridad media se selecciona inicialmente al crear una tarea. También puede modificarse posteriormente desde la opción de edición.

Fechas de vencimiento

Las tareas pueden incluir una fecha de vencimiento opcional. El formulario impide seleccionar fechas anteriores al día actual y cada tarjeta muestra un mensaje contextual:

- `Vence hoy`.
- `Falta 1 día`.
- `Faltan N días`.
- `Expiró ayer`.
- `Expiró hace N días`.
- `Completada`, cuando la tarea ya fue terminada.

Filtros

La lista puede visualizarse mediante tres filtros:

- Todas.
- Pendientes.
- Completadas.

El indicador de progreso continúa calculándose con todas las tareas, aunque se aplique un filtro.

Reordenamiento

Las tareas pueden reorganizarse mediante una asa de arrastre visible. Esta función está disponible en la vista **Todas**, funciona con mouse, teclado y dispositivos táctiles, y conserva el orden en Firestore después de recargar la aplicación.

El reordenamiento se implementó con:

- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`

Notificaciones

Se utilizó `Sonner` para mostrar notificaciones tipo toast después de las acciones principales:

- Creación, edición y eliminación de tareas.
- Cambio entre tarea pendiente y completada.
- Inicio y cierre de sesión.
- Registro de una cuenta.
- Envío del resumen por correo.
- Errores durante estas operaciones.

Los toast aparecen en la esquina superior derecha en escritorio y en la parte inferior central en dispositivos móviles. El reordenamiento no genera una notificación.

Lista adaptable

En tablet y escritorio, la lista utiliza un contenedor con desplazamiento interno para evitar que la página crezca indefinidamente. En móvil se mantiene el desplazamiento normal de la página para ofrecer una interacción más natural.

Modelo de una tarea

Las tareas almacenadas en Firestore utilizan la siguiente estructura:

| Campo         | Tipo                    | Descripción                                  |
| ------------- | ----------------------- | -------------------------------------------- |
| `title`       | `string`                | Título de la tarea, entre 3 y 30 caracteres. |
| `description` | `string`                | Descripción opcional, hasta 280 caracteres.  |
| `completed`   | `boolean`               | Indica si la tarea está completada.          |
| `userId`      | `string`                | Identificador del propietario.               |
| `createdAt`   | `Timestamp`             | Fecha de creación.                           |
| `priority`    | `low \| medium \| high` | Prioridad asignada.                          |
| `dueDate`     | `string \| null`        | Fecha de vencimiento o valor nulo.           |
| `order`       | `number`                | Posición utilizada para conservar el orden.  |

Seguridad en Firestore

Las reglas de Firestore:

- Requieren que el usuario esté autenticado.
- Permiten acceder únicamente a las tareas propias.
- Validan la estructura y los tipos de todos los campos.
- Rechazan campos adicionales.
- Limitan la longitud del título y la descripción.
- Restringen la prioridad a los tres valores admitidos.

Organización del código

Las nuevas responsabilidades se mantuvieron separadas por componente:

- `TaskProgress`: indicador de progreso.
- `TaskFilters`: controles de filtrado.
- `TodoForm`: creación, prioridad y vencimiento.
- `TodoList`: lista y contexto de reordenamiento.
- `TodoItem`: presentación, edición y asa de arrastre.
- `AppToaster`: configuración global de notificaciones.
- `dateHelpers`: cálculo y presentación de vencimientos.
- `taskServices`: operaciones y persistencia en Firestore.

Cada componente conserva su archivo CSS dentro de su propia carpeta y la interfaz mantiene un enfoque **mobile first**.

Verificación

La implementación fue comprobada con:

```bash
npm run build
npm run lint
```

Ambos comandos finalizaron correctamente.

## Uso de IA en el desarrollo

Este proyecto se desarrolló con la asistencia de Claude (Anthropic) en un rol de mentor: en lugar de generar el código directamente, guiaba con preguntas, pistas progresivas y revisión de lo que yo ya había escrito.

**Dónde fue más efectiva.** El mayor aporte estuvo al inicio del proyecto, construyendo la base: decidir la arquitectura de carpetas (por capas y por dominio), diseñar el flujo de autenticación con Context API y `onAuthStateChanged`, y entender por qué separar tipos, contexto y provider en archivos distintos. Ese acompañamiento inicial marcó el criterio que después repliqué solo en el resto del proyecto (validaciones, servicios, hooks).

**Dónde me generó fricción.** En secciones donde yo ya tenía conocimiento previo o una idea clara de cómo resolver algo (por ejemplo, ciertas integraciones y testing), el enfoque de proponer alternativas o cuestionar el camino elegido a veces me desviaba hacia objetivos distintos a los que yo ya tenía en mente, haciendo más lento el avance en esos tramos.

**Qué aprendí de verdad, no solo copié.** La modularización real del código (separar por responsabilidad, no solo por tipo de archivo), a perfeccionar la integración con servicios externos (Firebase, AWS SES, Vercel Functions) entendiendo por qué cada pieza va donde va, y a escribir CSS más fluido y consistente. También mejoré mucho mi capacidad de debuggear: leer errores de consola con atención, diferenciar ruido de errores reales, y aislar la causa antes de aplicar una solución.

Ajusté algunos puntos para que coincidan con la implementación actual: se usa `Timestamp.now()`, `task.id` ya es obligatorio y la edición incluye prioridad y vencimiento.

## Documentacion uso de IA

| Tema                            | Consulta o dificultad                                                                                                     | Aprendizaje / solución aplicada                                                                                                                          | Decisión final                                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Contexto de autenticación       | Definir un contexto que todavía no tiene un valor disponible al iniciar la aplicación.                                    | Se utilizó `createContext<AuthContextValue \| undefined>(undefined)` y un hook `useAuth` que valida que el contexto exista.                              | Mantener el tipo `undefined` permite detectar cuando `useAuth` se usa fuera de `AuthProvider`.                               |
| Estado inicial de autenticación | Confirmar que `useAuth()` inicia con `{ user: null, loading: true }` y después cambia a `{ user: null, loading: false }`. | Se comprobó el ciclo de carga de Firebase Auth antes de decidir si existe una sesión activa.                                                             | La aplicación espera a que Firebase resuelva la autenticación para evitar redirecciones prematuras.                          |
| Persistencia de sesión          | Identificar en qué parte de la aplicación se conserva la sesión al recargar.                                              | Firebase Auth mantiene la sesión y `onAuthStateChanged` restaura el usuario dentro de `AuthProvider`.                                                    | No fue necesario guardar manualmente el usuario en `localStorage`.                                                           |
| Sincronización en tiempo real   | Manejar el estado de carga de `useAuth` y la suscripción `onSnapshot` cuando `user` puede ser `null`.                     | Se aplicó un `early return` para evitar consultas con `user.uid` inexistente y se inicializó el estado mediante `useState(!!user)`.                      | Firestore sólo recibe consultas cuando existe una sesión activa.                                                             |
| Mapeo de datos de Firestore     | Los datos devueltos por `document.data()` no incluyen automáticamente el ID del documento.                                | Se creó una función de mapeo que obtiene `document.id` y normaliza los demás campos.                                                                     | El ID real de Firestore se asigna explícitamente y no puede ser sobrescrito por los datos internos.                          |
| Tipado del modelo de tareas     | Definir una estructura consistente entre Firestore, los formularios y los componentes.                                    | Se separaron los tipos `Task`, `TaskFormData`, `TaskPriority` y `TaskFilter`.                                                                            | Los documentos nuevos requieren ID, título, descripción, estado, usuario, fecha de creación, prioridad, vencimiento y orden. |
| Diseño de métodos CRUD          | Definir firmas claras para crear, actualizar, eliminar y completar tareas.                                                | Los servicios reciben únicamente los datos necesarios. Para actualizar se usa `Pick<TaskFormData, ...>` y las acciones individuales reciben un `taskId`. | La UI entrega datos del formulario y el servicio se encarga de construir la operación de Firestore.                          |
| Creación de tareas              | Evitar que la UI tenga que construir directamente un documento de Firestore.                                              | `createTask` recibe `userId` y `TaskFormData`, limpia los textos y añade los campos controlados por la aplicación.                                       | El documento se crea con `completed: false`, prioridad, vencimiento, orden y fecha de creación.                              |
| Persistencia de fechas          | Registrar correctamente cuándo se crea cada documento.                                                                    | Se comparó `serverTimestamp()` con `Timestamp.now()`. El primero usa la hora del servidor; el segundo genera el valor inmediatamente desde el cliente.   | La implementación actual utiliza `Timestamp.now()` para disponer inmediatamente de un `Timestamp`.                           |
| Validación del formulario       | Permitir una descripción vacía sin dejar de validar los demás campos.                                                     | `validateTaskForm` comprueba el título, limita la descripción a 280 caracteres y rechaza fechas anteriores al día actual.                                | La descripción continúa siendo opcional.                                                                                     |
| Limpieza de errores por campo   | Quitar un mensaje de validación cuando el usuario corrige el campo correspondiente.                                       | `handleChange` elimina solamente el error asociado al campo modificado.                                                                                  | No se borran los errores de otros campos que aún requieren corrección.                                                       |
| Manejo de errores de Firebase   | Mostrar mensajes comprensibles en lugar de códigos técnicos.                                                              | Se crearon traductores específicos para errores de autenticación y tareas.                                                                               | Los servicios dejan propagar el error y la capa de UI decide cómo presentarlo.                                               |
| Defensa de tipos en la UI       | Evitar operaciones con identificadores indefinidos.                                                                       | Inicialmente se utilizaron guardas como `if (!task.id) return`. Posteriormente, el modelo se hizo más estricto.                                          | Actualmente `Task.id` es obligatorio, por lo que los componentes reciben siempre un identificador válido.                    |
| Edición inline                  | Editar una tarea sin modificar Firestore antes de pulsar “Guardar”.                                                       | `TodoItem` mantiene un estado local que se inicializa al comenzar la edición. Cancelar descarta ese estado sin ejecutar servicios externos.              | La edición permite modificar título, descripción, prioridad y vencimiento.                                                   |
| Prioridades                     | Representar visualmente qué tareas requieren mayor atención.                                                              | Se definieron las prioridades `low`, `medium` y `high`, con una etiqueta textual y un borde de color.                                                    | Baja usa verde, media naranja y alta rojo; la prioridad inicial es media.                                                    |
| Fechas de vencimiento           | Comunicar cuánto falta para completar una tarea.                                                                          | Se creó un helper que calcula mensajes relativos utilizando la fecha local.                                                                              | Se muestran mensajes como “Vence hoy”, “Faltan N días”, “Expiró ayer” o “Completada”.                                        |
| Reordenamiento persistente      | Permitir arrastrar tareas y conservar el orden después de recargar.                                                       | Se utilizó `dnd-kit`, una asa visible y escrituras agrupadas mediante `writeBatch`.                                                                      | Sólo se puede reordenar desde el filtro “Todas” y funciona con mouse, teclado y dispositivos táctiles.                       |
| Filtros y progreso              | Filtrar la lista sin alterar el cálculo general de avance.                                                                | El filtro se aplica únicamente a las tareas entregadas a `TodoList`; `TaskProgress` recibe siempre la colección completa.                                | El velocímetro continúa representando todas las tareas.                                                                      |
| Feedback al usuario             | Informar el resultado de acciones sin llenar los componentes de mensajes permanentes.                                     | Se integró Sonner mediante un componente global `AppToaster`.                                                                                            | Se muestran toast para autenticación, CRUD y correo, pero no al reordenar.                                                   |
| Seguridad del envío de correo   | Evitar que cualquier persona pueda llamar directamente a `/api/send-email`.                                               | El frontend envía el token de Firebase y la función del servidor lo verifica antes de usar AWS SES.                                                      | Las credenciales de AWS permanecen únicamente en variables de entorno del servidor.                                          |
| Reglas de Firestore             | Impedir que un usuario consulte o modifique tareas ajenas.                                                                | Las reglas comprueban autenticación, propiedad, campos permitidos, tipos y límites.                                                                      | Cada usuario sólo puede operar sobre sus tareas y todos los documentos deben cumplir el modelo nuevo.                        |
| Modularización                  | Evitar que `Tasks.tsx` o `TodoItem.tsx` acumulen responsabilidades no relacionadas.                                       | Se separaron progreso, filtros, formulario, lista, tarjeta, toast, helpers y servicios en sus carpetas correspondientes.                                 | Cada componente visual conserva también su propio archivo CSS con enfoque mobile first.                                      |
| Pruebas automatizadas           | Probar componentes conectados conceptualmente con Firebase sin realizar llamadas reales.                                  | Se configuraron Vitest y React Testing Library y se mockearon autenticación, servicios de tareas, Sonner y `dnd-kit`.                                    | `npm run test` ejecuta 27 pruebas distribuidas en cinco archivos, incluyendo casos exitosos, errores y situaciones límite.   |
