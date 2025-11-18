// src/attendance/entities/attendance.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Group } from '../../groups/entities/group.entity';
import { Educator } from '../../educators/entities/educator.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('attendance')
@Unique(['group', 'student', 'classDate'])
export class Attendance {
  @ApiProperty({
    description: 'ID del registro de asistencia',
    type: 'string',
    format: 'uuid',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: () => Group, description: 'Grupo de la clase' })
  @ManyToOne(() => Group, (group) => group.attendanceRecords, {
    onDelete: 'CASCADE',
  })
  group: Group;

  @ApiProperty({ type: () => Student, description: 'Estudiante que asistió' })
  @ManyToOne(() => Student, (student) => student.attendanceRecords, {
    onDelete: 'CASCADE',
  })
  student: Student;

  @ApiProperty({
    description: 'Fecha de la clase',
    type: 'string',
    format: 'date',
  })
  @Column({ type: 'date', name: 'class_date' })
  classDate: string;

  @ApiProperty({ description: 'Asistió o no el estudiante', default: false })
  @Column({ type: 'boolean', default: false })
  attended: boolean;

  @ApiProperty({ description: 'Comentarios opcionales', required: false })
  @Column({ type: 'text', nullable: true })
  comments?: string;

  @ApiProperty({
    type: () => Educator,
    description: 'Educador que registró la asistencia',
    required: false,
  })
  @ManyToOne(() => Educator, { nullable: true, onDelete: 'SET NULL' })
  recordedBy?: Educator;
}
