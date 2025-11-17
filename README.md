# **Lucy Tejada Cultural Center - Backend**

Este repositorio contiene el **backend** de la plataforma de gestión del Lucy Tejada Cultural Center, desarrollado con **NestJS**, **TypeORM** y **PostgreSQL (Supabase)**.

El sistema maneja:

* Gestión de **usuarios** (Admins, Educadores, Estudiantes)
* CRUD de **Programas**
* CRUD de **Grupos** con relación a Programas y Educadores
* Gestión de **Aulas** (Classrooms)
* Horarios de clases (**GroupSchedules**)
* Auditoría de acciones mediante **Audit Logs**

---

## **Tecnologías**

* Node.js 20+
* NestJS 10+
* TypeScript
* PostgreSQL / Supabase
* TypeORM
* Swagger para documentación de API
* Jest para pruebas unitarias

---

## **Instalación**

1. Clonar el repositorio:

```bash
git clone git@github.com:VOIDX66/Lucy-Tejada-Back.git
cd Lucy-Tejada-Back
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno (crear `.env` basado en `.env.example`):

```env
DATABASE_URL=postgres://user:password@db.supabase.co:5432/lucy_tejada
JWT_SECRET=supersecret
PORT=3000
```

> La base de datos ya está creada en Supabase, no es necesario correr migraciones.

---

## **Estructura del proyecto**

```text
src/
├─ app.module.ts
├─ users/
├─ educators/
├─ students/
├─ programs/
├─ groups/
├─ classrooms/
├─ scheduling/
├─ audit_logs/
```

* **users/**: gestión de usuarios y roles
* **educators/**: CRUD de educadores
* **students/**: gestión de estudiantes
* **programs/**: CRUD de programas con auditoría
* **groups/**: CRUD de grupos y relaciones
* **classrooms/**: gestión de aulas
* **scheduling/**: gestión de horarios de clases
* **audit_logs/**: registro de acciones importantes del sistema

---

## **Uso**

Levantar el servidor en modo desarrollo:

```bash
npm run start:dev
```

* Servidor disponible en: `http://localhost:3000`
* Documentación Swagger en: `http://localhost:3000/docs`

---

## **Pruebas**

Ejecutar pruebas unitarias:

```bash
npm run test
```

---

## **Auditoría**

Todas las acciones críticas (crear, actualizar, eliminar programas, grupos, usuarios, etc.) quedan registradas en la tabla `audit_logs`.

Campos principales:

| Campo      | Descripción                                           |
| ---------- | ----------------------------------------------------- |
| user_id    | Usuario que realiza la acción                         |
| action     | Tipo de acción (CREATE_PROGRAM, UPDATE_PROGRAM, etc.) |
| entity     | Entidad afectada (Program, Group, Educator)           |
| ip_address | IP desde la cual se realizó la acción                 |
| result     | Resultado / mensaje de la acción                      |

---

## **Endpoints principales**

* `/users` → CRUD de usuarios
* `/educators` → CRUD de educadores
* `/students` → CRUD de estudiantes
* `/programs` → CRUD de programas (solo ADMIN)
* `/groups` → CRUD de grupos (solo ADMIN)
* `/classrooms` → CRUD de aulas (solo ADMIN)
* `/schedules` → Gestión de horarios de grupos
* `/docs` → Documentación Swagger

> Todos los endpoints protegidos con **JWT Guard** y roles según secciones.

---

## **Licencia**

Este proyecto es **propiedad del Lucy Tejada Cultural Center**. Uso interno y educativo.
