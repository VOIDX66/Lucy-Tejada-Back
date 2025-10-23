# Plataforma Lucy Tejada - Centro Cultural

## Descripción

La Plataforma Lucy Tejada es una aplicación web integral diseñada para modernizar y automatizar la gestión administrativa y académica del Centro Cultural Lucy Tejada en Pereira, Colombia. Permite gestionar estudiantes, educadores, programas formativos, reportes y dashboards de manera eficiente y segura.

## Características principales

* Gestión de estudiantes: registro, actualización de datos, inscripción a programas.
* Gestión de educadores: asignación de grupos, registro de asistencia, evaluación cualitativa.
* Gestión administrativa: filtros avanzados, reportes exportables, dashboards interactivos.
* Seguridad: autenticación segura, roles y permisos, trazabilidad completa.
* Notificaciones automáticas y segmentadas.
* Exportación de datos en formatos estándar (Excel, CSV, PDF).
* Cumple estándares de accesibilidad web (WCAG 2.1).

## Tecnologías utilizadas

* **Backend:** NestJS, TypeORM, PostgreSQL/Supabase
* **Frontend:** React (con Vite)
* **Autenticación:** JWT, bcrypt
* **Notificaciones y almacenamiento:** servicios personalizados (MailService, FileStorageService)
* **Testing:** Jest para backend, tests automatizados para funcionalidades críticas

## Requisitos

* Node.js >= 20
* npm >= 9
* PostgreSQL o Supabase
* Yarn opcional para el frontend

## Instalación

1. Clonar el repositorio:

```bash
git clone git@github.com:VOIDX66/Lucy-Tejada-Back.git
cd Lucy-Tejada-Back
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno (`.env`) con tu conexión a la base de datos, JWT secret y claves de servicios externos.

4. Crear la base de datos (Postgres/Supabase).

5. Ejecutar migraciones:

```bash
npm run migration:run
```

> ⚠️ **Nota:** Para este proyecto, las migraciones generadas automáticamente deben **editarse manualmente** antes de ejecutarlas para evitar errores y cambios innecesarios.

## Uso

* Levantar backend:

```bash
npm run start:dev
```

* Levantar frontend (desde la carpeta del frontend):

```bash
npm run dev
```

* Acceder a la aplicación en `http://localhost:5173` (frontend) y API en `http://localhost:3000`.

## Estructura del proyecto

```
src/
 ├─ auth/               # Módulo de autenticación
 ├─ users/              # Gestión de usuarios
 ├─ enrollments/        # Gestión de inscripciones
 ├─ programs/           # Gestión de programas formativos
 ├─ migrations/         # Migraciones (editar manualmente)
 ├─ common/             # Servicios y utilidades comunes
 └─ main.ts             # Entry point
```

## Buenas prácticas de migraciones

1. Generar migración base con:

```bash
npm run migration:generate nombre-migracion
```

2. Editar **manualmente** la migración para:

   * Quitar cambios no deseados.
   * Ajustar columnas `NOT NULL` y defaults.
   * Formatear para ESLint/Prettier.

3. Ejecutar migración:

```bash
npm run migration:run
```

4. Si hay que revertir:

```bash
npm run migration:revert
```

## Testing

* Backend: Jest

```bash
npm run test
```

* Frontend: React Testing Library / vitest (según configuración)

## Licencia

* Proyecto académico desarrollado en la Universidad Tecnológica de Pereira.
* Uso limitado a fines educativos y de evaluación de la materia/proyecto.
