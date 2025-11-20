// src/scheduling/entities/groupSchedule.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Group } from '../../groups/entities/group.entity';
import { Classroom } from '../../classrooms/entities/classroom.entity';

@Entity('group_schedules')
export class GroupSchedule {
  @ApiProperty({ type: 'string', format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: () => Group })
  @ManyToOne(() => Group, (g) => g.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @ApiProperty({ description: 'Día de la semana (Lunes, Martes, ...)' })
  @Column({ name: 'day_of_week', type: 'varchar', length: 16 })
  dayOfWeek: string;

  @ApiProperty({ description: 'Hora de inicio (HH:MM)' })
  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @ApiProperty({ description: 'Hora de fin (HH:MM)' })
  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @ApiProperty({ type: () => Classroom, nullable: true })
  @ManyToOne(() => Classroom, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'classroom_id' })
  classroom?: Classroom;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
