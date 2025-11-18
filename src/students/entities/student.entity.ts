// src/students/entities/student.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { Attendance } from '../../attendances/entities/attendance.entity';
import { Evaluation } from '../../evaluations/entities/evaluation.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  COMPLETED = 'COMPLETED',
}

export enum GenderType {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

@Entity('students')
export class Student {
  @ApiProperty({
    description: 'ID del estudiante (igual que user.id)',
    type: 'string',
    format: 'uuid',
  })
  @PrimaryColumn('uuid')
  id: string;

  // ==========================================
  // CAMPOS OBLIGATORIOS
  // ==========================================

  @ApiProperty({
    description: 'Fecha de nacimiento del estudiante',
    type: 'string',
    format: 'date',
    required: true,
    example: '2005-07-23',
  })
  @Column({
    name: 'birth_date',
    type: 'date',
    nullable: false,
  })
  birthDate: string;

  @ApiProperty({
    enum: GenderType,
    description: 'Género del estudiante',
    required: true,
    example: 'MALE',
  })
  @Column({
    name: 'gender',
    type: 'enum',
    enum: GenderType,
    nullable: false, // OBLIGATORIO
  })
  gender: GenderType;

  @ApiProperty({
    description: 'Ciudad de origen del estudiante',
    required: true,
    example: 'Pereira',
  })
  @Column({
    name: 'city_of_origin',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  cityOfOrigin: string;

  @ApiProperty({
    enum: StudentStatus,
    description: 'Estado del estudiante',
    default: StudentStatus.ACTIVE,
  })
  @Column({
    name: 'enrollment_status',
    type: 'enum',
    enum: StudentStatus,
    default: StudentStatus.ACTIVE,
  })
  enrollmentStatus: StudentStatus;

  @ApiProperty({
    description: 'Notas adicionales del estudiante',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  // ==========================================
  // RELACIONES
  // ==========================================

  @ApiProperty({ type: () => User })
  @OneToOne(() => User)
  @JoinColumn({ name: 'id' })
  user: User;

  @ApiProperty({ type: () => [Enrollment] })
  @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
  enrollments: Enrollment[];

  @ApiProperty({ type: () => [Attendance] })
  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendanceRecords: Attendance[];

  @ApiProperty({ type: () => [Evaluation] })
  @OneToMany(() => Evaluation, (evaluation) => evaluation.student)
  evaluations: Evaluation[];
}
