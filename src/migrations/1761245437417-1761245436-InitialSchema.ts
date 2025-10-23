import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1761245437417 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
-- ==========================================
-- LUCY TEJADA CULTURAL CENTER PLATFORM
-- DATABASE SCHEMA (PostgreSQL / Supabase)
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- ENUM TYPES
-- ==========================================
CREATE TYPE user_role AS ENUM ('ADMIN', 'EDUCATOR', 'STUDENT');
CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE student_status AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED');
CREATE TYPE educator_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE program_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE enrollment_status AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE performance_level AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR');
CREATE TYPE report_type AS ENUM ('ENROLLMENT', 'ATTENDANCE', 'DROPOUT', 'PERFORMANCE');

-- ==========================================
-- USERS
-- ==========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    document_type VARCHAR(10),
    document_number VARCHAR(30) UNIQUE,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(255),
    role user_role NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- ==========================================
-- STUDENTS
-- ==========================================
CREATE TABLE students (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    birth_date DATE,
    gender gender_type,
    city_of_origin VARCHAR(100),
    enrollment_status student_status DEFAULT 'ACTIVE',
    notes TEXT
);

-- ==========================================
-- EDUCATORS
-- ==========================================
CREATE TABLE educators (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(150),
    description TEXT,
    hire_date DATE,
    status educator_status DEFAULT 'ACTIVE'
);

-- ==========================================
-- PROGRAMS
-- ==========================================
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    capacity INT DEFAULT 0,
    status program_status DEFAULT 'ACTIVE',
    start_date DATE,
    end_date DATE
);

-- ==========================================
-- GROUPS
-- ==========================================
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_name VARCHAR(100) NOT NULL,
    schedule VARCHAR(100),
    classroom VARCHAR(100),
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    educator_id UUID REFERENCES educators(id) ON DELETE SET NULL
);

-- ==========================================
-- ENROLLMENTS
-- ==========================================
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT NOW(),
    status enrollment_status DEFAULT 'ACTIVE',
    UNIQUE (student_id, group_id)
);

-- ==========================================
-- ATTENDANCE
-- ==========================================
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_date DATE NOT NULL,
    attended BOOLEAN DEFAULT FALSE,
    comments TEXT,
    recorded_by UUID REFERENCES educators(id) ON DELETE SET NULL,
    UNIQUE (group_id, student_id, class_date)
);

-- ==========================================
-- EVALUATIONS
-- ==========================================
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    educator_id UUID REFERENCES educators(id) ON DELETE SET NULL,
    evaluation_date DATE DEFAULT NOW(),
    description TEXT,
    performance_level performance_level,
    UNIQUE (group_id, student_id, evaluation_date)
);

-- ==========================================
-- REPORTS
-- ==========================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type report_type NOT NULL,
    period VARCHAR(20),
    data JSONB,
    generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    generated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- AUDIT LOGS
-- ==========================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    ip_address VARCHAR(45),
    result VARCHAR(50)
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_groups_program ON groups(program_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_attendance_class_date ON attendance(class_date);
CREATE INDEX idx_evaluations_student ON evaluations(student_id);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS audit_logs, reports, evaluations, attendance, enrollments,
      groups, programs, educators, students, users CASCADE;
      DROP TYPE IF EXISTS user_role, gender_type, student_status, educator_status,
      program_status, enrollment_status, performance_level, report_type CASCADE;
    `);
  }
}
