-- ==========================================
-- LUCY TEJADA CULTURAL CENTER PLATFORM
-- DATABASE SCHEMA (PostgreSQL / Supabase)
-- VERSION: SCHEDULING READY v3.0
-- ==========================================

-- Enable UUID generation
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

-- Nuevos ENUMS para salones
CREATE TYPE classroom_type AS ENUM ('DANZA', 'MUSICA', 'TEATRO', 'ARTES_VISUALES', 'GENERAL');
CREATE TYPE classroom_status AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

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
-- CLASSROOMS (Nueva tabla de salones)
-- ==========================================

CREATE TABLE classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    type classroom_type NOT NULL DEFAULT 'GENERAL',
    capacity INT NOT NULL CHECK (capacity > 0),
    location VARCHAR(150),
    status classroom_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- GROUPS
-- ==========================================

CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_name VARCHAR(100) NOT NULL,
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    educator_id UUID REFERENCES educators(id) ON DELETE SET NULL
);

-- ==========================================
-- GROUP SCHEDULES (Modificada con classroom_id)
-- ==========================================

CREATE TABLE group_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,

    day_of_week VARCHAR(10) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    classroom_id UUID REFERENCES classrooms(id) ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (group_id, day_of_week, start_time)
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trg_update_group_schedules_updated_at
BEFORE UPDATE ON group_schedules
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

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
    result VARCHAR(255)
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_groups_program ON groups(program_id);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_attendance_class_date ON attendance(class_date);
CREATE INDEX idx_evaluations_student ON evaluations(student_id);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);

-- Horarios
CREATE INDEX idx_group_schedules_day ON group_schedules(day_of_week);
CREATE INDEX idx_group_schedules_time ON group_schedules(start_time, end_time);
CREATE INDEX idx_group_schedules_classroom ON group_schedules(classroom_id);
CREATE INDEX idx_group_schedules_group ON group_schedules(group_id);

-- Educadores → horario
CREATE INDEX idx_groups_educator ON groups(educator_id);

-- Ultra optimizado para detección de conflicto
CREATE INDEX idx_group_schedules_day_time_classroom
ON group_schedules(day_of_week, classroom_id, start_time, end_time);

-- ==========================================
-- END OF SCHEMA
-- ==========================================
