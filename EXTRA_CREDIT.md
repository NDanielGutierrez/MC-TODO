# Funcionalidades extra

Como complemento a los requerimientos principales del proyecto, se agregaron funcionalidades orientadas a mejorar la organización de las tareas, la experiencia de usuario y la visualización del progreso.

## Progreso de tareas

Se incorporó un indicador semicircular que muestra el porcentaje de tareas completadas. El cálculo siempre considera el total de tareas del usuario, independientemente del filtro seleccionado.

## Prioridades

Cada tarea puede clasificarse con una de las siguientes prioridades:

- Baja: borde verde.
- Media: borde naranja.
- Alta: borde rojo.

La prioridad media se selecciona inicialmente al crear una tarea. También puede modificarse posteriormente desde la opción de edición.

## Fechas de vencimiento

Las tareas pueden incluir una fecha de vencimiento opcional. El formulario impide seleccionar fechas anteriores al día actual y cada tarjeta muestra un mensaje contextual:

- `Vence hoy`.
- `Falta 1 día`.
- `Faltan N días`.
- `Expiró ayer`.
- `Expiró hace N días`.
- `Completada`, cuando la tarea ya fue terminada.

## Filtros

La lista puede visualizarse mediante tres filtros:

- Todas.
- Pendientes.
- Completadas.

El indicador de progreso continúa calculándose con todas las tareas, aunque se aplique un filtro.

## Reordenamiento

Las tareas pueden reorganizarse mediante una asa de arrastre visible. Esta función está disponible en la vista **Todas**, funciona con mouse, teclado y dispositivos táctiles, y conserva el orden en Firestore después de recargar la aplicación.

El reordenamiento se implementó con:

- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`

## Notificaciones

Se utilizó `Sonner` para mostrar notificaciones tipo toast después de las acciones principales:

- Creación, edición y eliminación de tareas.
- Cambio entre tarea pendiente y completada.
- Inicio y cierre de sesión.
- Registro de una cuenta.
- Envío del resumen por correo.
- Errores durante estas operaciones.

Los toast aparecen en la esquina superior derecha en escritorio y en la parte inferior central en dispositivos móviles. El reordenamiento no genera una notificación.

## Lista adaptable

En tablet y escritorio, la lista utiliza un contenedor con desplazamiento interno para evitar que la página crezca indefinidamente. En móvil se mantiene el desplazamiento normal de la página para ofrecer una interacción más natural.

## Modelo de una tarea

Las tareas almacenadas en Firestore utilizan la siguiente estructura:

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `title` | `string` | Título de la tarea, entre 3 y 30 caracteres. |
| `description` | `string` | Descripción opcional, hasta 280 caracteres. |
| `completed` | `boolean` | Indica si la tarea está completada. |
| `userId` | `string` | Identificador del propietario. |
| `createdAt` | `Timestamp` | Fecha de creación. |
| `priority` | `low \| medium \| high` | Prioridad asignada. |
| `dueDate` | `string \| null` | Fecha de vencimiento o valor nulo. |
| `order` | `number` | Posición utilizada para conservar el orden. |

## Seguridad en Firestore

Las reglas de Firestore:

- Requieren que el usuario esté autenticado.
- Permiten acceder únicamente a las tareas propias.
- Validan la estructura y los tipos de todos los campos.
- Rechazan campos adicionales.
- Limitan la longitud del título y la descripción.
- Restringen la prioridad a los tres valores admitidos.

## Organización del código

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

## Verificación

La implementación fue comprobada con:

```bash
npm run build
npm run lint
```

Ambos comandos finalizaron correctamente.
