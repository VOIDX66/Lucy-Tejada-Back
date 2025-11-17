import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedInitial1716332158155 implements MigrationInterface {
  name = 'SeedInitial1716332158155';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const password = await bcrypt.hash('12345678', 10);

    /* ===============================
            PROGRAMAS
    =============================== */
    await queryRunner.query(`
      INSERT INTO programs (id, name, description, capacity, status)
      VALUES
        (gen_random_uuid(), 'Danza', 'Programa de formación en danza contemporánea.', 80, 'ACTIVE'),
        (gen_random_uuid(), 'Teatro', 'Escuela de actuación para jóvenes.', 60, 'ACTIVE'),
        (gen_random_uuid(), 'Coros', 'Entrenamiento vocal y canto coral.', 40, 'ACTIVE'),
        (gen_random_uuid(), 'Cuerdas Pulsadas', 'Formación musical en cuerdas.', 40, 'ACTIVE'),
        (gen_random_uuid(), 'Cuerdas Sinfónicas', 'Entrenamiento musical avanzado.', 40, 'ACTIVE'),
        (gen_random_uuid(), 'Banda Músico Marcial', 'Percusión y banda marcial.', 50, 'ACTIVE'),
        (gen_random_uuid(), 'Artes Visuales', 'Programa de artes plásticas.', 60, 'ACTIVE');
    `);

    /* ===============================
            SALONES
    =============================== */
    await queryRunner.query(`
      INSERT INTO classrooms (id, name, type, capacity, location)
      VALUES
        (gen_random_uuid(), 'Aula Danza 1', 'DANZA', 25, 'Piso 2'),
        (gen_random_uuid(), 'Aula Música 1', 'MUSICA', 20, 'Piso 3'),
        (gen_random_uuid(), 'Teatrino', 'TEATRO', 40, 'Piso 1'),
        (gen_random_uuid(), 'Sala Artes 1', 'ARTES_VISUALES', 18, 'Piso 2'),
        (gen_random_uuid(), 'Aula Multifuncional', 'GENERAL', 35, 'Piso 1');
    `);

    /* ===============================
            USERS → EDUCADORES
    =============================== */
    await queryRunner.query(`
      INSERT INTO users (id, first_name, last_name, email, role, password_hash)
      VALUES
        (gen_random_uuid(), 'María', 'López', 'maria.lopez@lucy.com', 'EDUCATOR', '${password}'),
        (gen_random_uuid(), 'Juan', 'Ramírez', 'juan.ramirez@lucy.com', 'EDUCATOR', '${password}'),
        (gen_random_uuid(), 'Laura', 'Gómez', 'laura.gomez@lucy.com', 'EDUCATOR', '${password}'),
        (gen_random_uuid(), 'Andrés', 'Muñoz', 'andres.munoz@lucy.com', 'EDUCATOR', '${password}'),
        (gen_random_uuid(), 'Paula', 'Restrepo', 'paula.restrepo@lucy.com', 'EDUCATOR', '${password}');
    `);

    await queryRunner.query(`
      INSERT INTO educators (id, specialization, hire_date)
      SELECT id,
        CASE
          WHEN email LIKE '%maria%' THEN 'Danza'
          WHEN email LIKE '%juan%' THEN 'Teatro'
          WHEN email LIKE '%laura%' THEN 'Coros'
          WHEN email LIKE '%andres%' THEN 'Cuerdas'
          WHEN email LIKE '%paula%' THEN 'Artes Visuales'
        END,
        NOW()
      FROM users
      WHERE role = 'EDUCATOR';
    `);

    /* ===============================
            USERS → ESTUDIANTES
    =============================== */
    await queryRunner.query(`
      INSERT INTO users (id, first_name, last_name, email, role, password_hash)
      VALUES
        (gen_random_uuid(), 'Ana', 'Pérez', 'ana.perez@example.com', 'STUDENT', '${password}'),
        (gen_random_uuid(), 'Carlos', 'Gómez', 'carlos.gomez@example.com', 'STUDENT', '${password}'),
        (gen_random_uuid(), 'Mateo', 'Ríos', 'mateo.rios@example.com', 'STUDENT', '${password}'),
        (gen_random_uuid(), 'Valeria', 'Ruiz', 'valeria.ruiz@example.com', 'STUDENT', '${password}'),
        (gen_random_uuid(), 'Sebastián', 'Ochoa', 'sebastian.ochoa@example.com', 'STUDENT', '${password}');
    `);

    await queryRunner.query(`
      INSERT INTO students (id, gender, city_of_origin)
      SELECT id, 'FEMALE', 'Pereira'
      FROM users
      WHERE email IN ('ana.perez@example.com', 'valeria.ruiz@example.com');
    `);

    await queryRunner.query(`
      INSERT INTO students (id, gender, city_of_origin)
      SELECT id, 'MALE', 'Pereira'
      FROM users
      WHERE email IN ('carlos.gomez@example.com', 'mateo.rios@example.com', 'sebastian.ochoa@example.com');
    `);

    /* ===============================
            GRUPOS
    =============================== */
    await queryRunner.query(`
      INSERT INTO groups (id, group_name, program_id, educator_id)
      SELECT gen_random_uuid(), 'Danza Inicial 1', p.id, e.id
      FROM programs p, educators e
      WHERE p.name = 'Danza' AND e.specialization = 'Danza'
      LIMIT 1;
    `);

    await queryRunner.query(`
      INSERT INTO groups (id, group_name, program_id, educator_id)
      SELECT gen_random_uuid(), 'Actuación Básica', p.id, e.id
      FROM programs p, educators e
      WHERE p.name = 'Teatro' AND e.specialization = 'Teatro'
      LIMIT 1;
    `);

    await queryRunner.query(`
      INSERT INTO groups (id, group_name, program_id, educator_id)
      SELECT gen_random_uuid(), 'Coros Juvenil', p.id, e.id
      FROM programs p, educators e
      WHERE p.name = 'Coros' AND e.specialization = 'Coros'
      LIMIT 1;
    `);

    /* ===============================
            HORARIOS
    =============================== */
    await queryRunner.query(`
      INSERT INTO group_schedules (group_id, day_of_week, start_time, end_time, classroom_id)
      SELECT g.id, 'Lunes', '10:00', '12:00', c.id
      FROM groups g, classrooms c
      WHERE g.group_name='Danza Inicial 1' AND c.name='Aula Danza 1'
      LIMIT 1;
    `);

    await queryRunner.query(`
      INSERT INTO group_schedules (group_id, day_of_week, start_time, end_time, classroom_id)
      SELECT g.id, 'Martes', '14:00', '16:00', c.id
      FROM groups g, classrooms c
      WHERE g.group_name='Actuación Básica' AND c.name='Teatrino'
      LIMIT 1;
    `);

    await queryRunner.query(`
      INSERT INTO group_schedules (group_id, day_of_week, start_time, end_time, classroom_id)
      SELECT g.id, 'Miércoles', '10:00', '12:00', c.id
      FROM groups g, classrooms c
      WHERE g.group_name='Coros Juvenil' AND c.name='Aula Música 1'
      LIMIT 1;
    `);
  }

  /* ===============================
            DOWN
  =============================== */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM group_schedules
      WHERE group_id IN (
        SELECT id FROM groups
        WHERE group_name IN ('Danza Inicial 1','Actuación Básica','Coros Juvenil')
      );
    `);

    await queryRunner.query(`
      DELETE FROM enrollments
      WHERE group_id IN (
        SELECT id FROM groups
        WHERE group_name IN ('Danza Inicial 1','Actuación Básica','Coros Juvenil')
      );
    `);

    await queryRunner.query(`
      DELETE FROM groups
      WHERE group_name IN ('Danza Inicial 1','Actuación Básica','Coros Juvenil');
    `);

    await queryRunner.query(`
      DELETE FROM students
      WHERE id IN (
        SELECT id FROM users WHERE email IN (
          'ana.perez@example.com','valeria.ruiz@example.com',
          'carlos.gomez@example.com','mateo.rios@example.com','sebastian.ochoa@example.com'
        )
      );
    `);

    await queryRunner.query(`
      DELETE FROM educators
      WHERE id IN (
        SELECT id FROM users WHERE email IN (
          'maria.lopez@lucy.com','juan.ramirez@lucy.com',
          'laura.gomez@lucy.com','andres.munoz@lucy.com','paula.restrepo@lucy.com'
        )
      );
    `);

    await queryRunner.query(`
      DELETE FROM users
      WHERE email IN (
        'maria.lopez@lucy.com','juan.ramirez@lucy.com','laura.gomez@lucy.com',
        'andres.munoz@lucy.com','paula.restrepo@lucy.com',
        'ana.perez@example.com','valeria.ruiz@example.com',
        'carlos.gomez@example.com','mateo.rios@example.com','sebastian.ochoa@example.com'
      );
    `);

    await queryRunner.query(`
      DELETE FROM classrooms
      WHERE name IN (
        'Aula Danza 1','Aula Música 1','Teatrino','Sala Artes 1','Aula Multifuncional'
      );
    `);

    await queryRunner.query(`
      DELETE FROM programs
      WHERE name IN (
        'Danza','Teatro','Coros','Cuerdas Pulsadas','Cuerdas Sinfónicas',
        'Banda Músico Marcial','Artes Visuales'
      );
    `);
  }
}
