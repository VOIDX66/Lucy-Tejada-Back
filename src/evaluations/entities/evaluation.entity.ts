// src/evaluations/entities/evaluation.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
  CreateDateColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Group } from '../../groups/entities/group.entity';
import { Educator } from '../../educators/entities/educator.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum PerformanceLevel {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

@Entity('evaluations')
@Unique(['group', 'student', 'evaluationDate'])
export class Evaluation {
  @ApiProperty({
    description: 'ID de la evaluación',
    type: 'string',
    format: 'uuid',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: () => Group, description: 'Grupo de la clase' })
  @ManyToOne(() => Group, (group) => group.evaluations, { onDelete: 'CASCADE' })
  group: Group;

  @ApiProperty({ type: () => Student, description: 'Estudiante evaluado' })
  @ManyToOne(() => Student, (student) => student.evaluations, {
    onDelete: 'CASCADE',
  })
  student: Student;

  @ApiProperty({
    type: () => Educator,
    description: 'Educador que realizó la evaluación',
    required: false,
  })
  @ManyToOne(() => Educator, { nullable: true, onDelete: 'SET NULL' })
  educator?: Educator;

  @ApiProperty({
    description: 'Fecha de la evaluación',
    type: 'string',
    format: 'date',
    default: 'now',
  })
  @CreateDateColumn({ name: 'evaluation_date' })
  evaluationDate: Date;

  @ApiProperty({ description: 'Descripción de la evaluación', required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    enum: PerformanceLevel,
    description: 'Nivel de desempeño',
    required: false,
  })
  @Column({ type: 'enum', enum: PerformanceLevel, nullable: true })
  performanceLevel?: PerformanceLevel;
}
