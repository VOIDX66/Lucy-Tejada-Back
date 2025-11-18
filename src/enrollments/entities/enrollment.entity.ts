// src/enrollments/entities/enrollment.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Program } from '../../programs/entities/program.entity';
import { Group } from '../../groups/entities/group.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('enrollments')
@Unique(['student', 'group'])
export class Enrollment {
  @ApiProperty({
    description: 'ID de la inscripción',
    type: 'string',
    format: 'uuid',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: () => Student, description: 'Estudiante inscrito' })
  @ManyToOne(() => Student, (student) => student.enrollments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ApiProperty({
    type: () => Program,
    description: 'Programa al que pertenece la inscripción',
  })
  @ManyToOne(() => Program, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'program_id' })
  program: Program;

  @ApiProperty({
    type: () => Group,
    description: 'Grupo asignado (NULL si aún no se ha generado)',
  })
  @ManyToOne(() => Group, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group | null;

  @ApiProperty({
    description: 'Fecha de inscripción',
    type: 'string',
    format: 'date-time',
  })
  @CreateDateColumn({ name: 'enrolled_at' })
  enrolledAt: Date;

  @ApiProperty({
    enum: EnrollmentStatus,
    description: 'Estado de la inscripción',
    default: EnrollmentStatus.ACTIVE,
  })
  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status: EnrollmentStatus;
}
