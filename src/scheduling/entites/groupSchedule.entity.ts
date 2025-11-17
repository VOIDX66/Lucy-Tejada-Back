import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Group } from '../../groups/entities/group.entity';
import { Classroom } from '../../classrooms/entities/classroom.entity';

export const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

@Entity('group_schedules')
export class GroupSchedule {
  // ================================
  // IDENTIFICADOR
  // ================================
  @ApiProperty({
    example: 'b92e83f3-f2ef-4aca-af05-1fe49f5908e4',
    description: 'Identificador único del horario (UUID).',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ================================
  // RELACIÓN: GROUP
  // ================================
  @ApiProperty({
    description: 'Grupo al que pertenece este horario.',
    type: () => Group,
  })
  @ManyToOne(() => Group, (group) => group.schedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  // ================================
  // DÍA DE LA SEMANA
  // ================================
  @ApiProperty({
    example: 'MONDAY',
    enum: DAYS_OF_WEEK,
    description: 'Día de la semana en el que aplica el horario.',
  })
  @Column({ name: 'day_of_week', type: 'varchar' })
  dayOfWeek: DayOfWeek;

  // ================================
  // HORA DE INICIO
  // ================================
  @ApiProperty({
    example: '14:00',
    description: 'Hora de inicio de la clase.',
  })
  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  // ================================
  // HORA DE FIN
  // ================================
  @ApiProperty({
    example: '16:00',
    description: 'Hora de finalización de la clase.',
  })
  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  // ================================
  // RELACIÓN: CLASSROOM
  // ================================
  @ApiProperty({
    description: 'Salón asignado a esta sesión.',
    type: () => Classroom,
    nullable: true,
  })
  @ManyToOne(() => Classroom, (classroom) => classroom.schedules, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'classroom_id' })
  classroom?: Classroom;

  // ================================
  // TIMESTAMPS
  // ================================
  @ApiProperty({
    example: '2025-11-16T15:00:00.000Z',
    description: 'Fecha de creación del registro.',
  })
  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    example: '2025-11-16T15:30:00.000Z',
    description: 'Fecha de última actualización del registro.',
  })
  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
