import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedGroupsTest1716339999999 implements MigrationInterface {
  name = 'SeedGroupsTest1716339999999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const password = await bcrypt.hash('12345678', 10);

    /* ===============================
            PROGRAMAS
    =============================== */
    await queryRunner.query(`
      INSERT INTO programs (id, name, description, capacity, status)
      VALUES
        (gen_random_uuid(), 'Danza', 'Programa de Danza', 80, 'ACTIVE'),
        (gen_random_uuid(), 'Teatro', 'Programa de Teatro', 80, 'ACTIVE'),
        (gen_random_uuid(), 'Música', 'Programa de Música', 80, 'ACTIVE');
    `);

    /* ===============================
            CLASSROOMS
    =============================== */
    await queryRunner.query(`
      INSERT INTO classrooms (id, name, type, capacity, location)
      VALUES
        (gen_random_uuid(), 'Sala Danza', 'DANZA', 25, 'Piso 1'),
        (gen_random_uuid(), 'Sala Música', 'MUSICA', 25, 'Piso 2'),
        (gen_random_uuid(), 'Sala Teatro', 'TEATRO', 25, 'Piso 3');
    `);

    /* ===============================
            EDUCADORES → USERS
    =============================== */
    await queryRunner.query(`
      INSERT INTO users (id, first_name, last_name, email, role, password_hash)
      VALUES
        (gen_random_uuid(), 'Ana', 'López', 'ana.lopez@cec.com', 'EDUCATOR', '${password}'),
        (gen_random_uuid(), 'Luis', 'Ramírez', 'luis.ramirez@cec.com', 'EDUCATOR', '${password}'),
        (gen_random_uuid(), 'Marta', 'Gómez', 'marta.gomez@cec.com', 'EDUCATOR', '${password}'),
        (gen_random_uuid(), 'Pedro', 'Ruiz', 'pedro.ruiz@cec.com', 'EDUCATOR', '${password}'),
        (gen_random_uuid(), 'Sofía', 'Marín', 'sofia.marin@cec.com', 'EDUCATOR', '${password}'),
        (gen_random_uuid(), 'Diego', 'Mora', 'diego.mora@cec.com', 'EDUCATOR', '${password}');
    `);

    await queryRunner.query(`
      INSERT INTO educators (id, specialization, hire_date)
      SELECT id,
        CASE
          WHEN email LIKE '%ana%' THEN 'Danza'
          WHEN email LIKE '%luis%' THEN 'Danza'
          WHEN email LIKE '%marta%' THEN 'Teatro'
          WHEN email LIKE '%pedro%' THEN 'Teatro'
          WHEN email LIKE '%sofia%' THEN 'Música'
          WHEN email LIKE '%diego%' THEN 'Música'
        END,
        NOW()
      FROM users
      WHERE role = 'EDUCATOR';
    `);

    /* ===============================
            ASIGNAR EDUCADORES A PROGRAMAS
    =============================== */
    await queryRunner.query(`
      INSERT INTO educator_programs (educator_id, program_id)
      SELECT e.id, p.id
      FROM educators e
      JOIN programs p ON (
        (e.specialization = 'Danza' AND p.name = 'Danza') OR
        (e.specialization = 'Teatro' AND p.name = 'Teatro') OR
        (e.specialization = 'Música' AND p.name = 'Música')
      );
    `);

    /* ===============================
            DISPONIBILIDAD
    =============================== */
    await queryRunner.query(`
      INSERT INTO educator_availability (id, educator_id, day_of_week, start_time, end_time)
      SELECT gen_random_uuid(), e.id, 'Lunes', '08:00', '12:00'
      FROM educators e;
    `);

    /* ===============================
            STUDENTS → USERS
    =============================== */
    for (let i = 1; i <= 40; i++) {
      await queryRunner.query(`
        INSERT INTO users (id, first_name, last_name, email, role, password_hash)
        VALUES (
          gen_random_uuid(),
          'Est${i}',
          'Test${i}',
          'est${i}@test.com',
          'STUDENT',
          '${password}'
        );
        
        INSERT INTO students (id, gender, city_of_origin)
        SELECT id, 'OTHER', 'Pereira' FROM users WHERE email = 'est${i}@test.com';
      `);
    }

    /* ===============================
            ENROLLMENTS (random)
    =============================== */
    await queryRunner.query(`
      INSERT INTO enrollments (student_id, program_id, group_id)
      SELECT s.id,
        (SELECT id FROM programs ORDER BY RANDOM() LIMIT 1),
        NULL
      FROM students s;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM enrollments;`);
    await queryRunner.query(`DELETE FROM educator_availability;`);
    await queryRunner.query(`DELETE FROM educator_programs;`);
    await queryRunner.query(`DELETE FROM educators;`);
    await queryRunner.query(`DELETE FROM students;`);
    await queryRunner.query(`DELETE FROM classrooms;`);
    await queryRunner.query(`DELETE FROM users;`);
    await queryRunner.query(`DELETE FROM programs;`);
  }
}
