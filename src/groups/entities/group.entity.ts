import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Program } from '../../programs/entities/program.entity';
import { Educator } from '../../educators/entities/educator.entity';
import { GroupSchedule } from '../../scheduling/entites/groupSchedule.entity';
import { Attendance } from '../../attendances/entities/attendance.entity';
import { Evaluation } from '../../evaluations/entities/evaluation.entity';

@Entity('groups')
export class Group {
  @ApiProperty({
    example: 'b0ecac20-8a10-4e5e-9f51-25b0489d20d1',
    description: 'Identificador único del grupo (UUID).',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Grupo A - Danza Infantil',
    description: 'Nombre del grupo.',
  })
  @Column({ name: 'group_name', type: 'varchar', length: 100 })
  groupName: string;

  // -------------------------------------------------------------------------
  // RELACIÓN CON PROGRAM
  // -------------------------------------------------------------------------

  @ApiProperty({
    example: 'a18b6a30-d37c-42ce-987a-02e20b2b3693',
    description: 'ID del programa al que pertenece este grupo.',
  })
  @Column({ name: 'program_id', type: 'uuid' })
  programId: string;

  @ManyToOne(() => Program, (program) => program.groups, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'program_id' })
  program: Program;

  // -------------------------------------------------------------------------
  // RELACIÓN CON EDUCATOR
  // -------------------------------------------------------------------------

  @ApiProperty({
    example: 'b82cc4cf-6b56-4f37-9db0-3a2575c92510',
    description: 'ID del educador asignado al grupo.',
    nullable: true,
  })
  @Column({ name: 'educator_id', type: 'uuid', nullable: true })
  educatorId?: string;

  @ManyToOne(() => Educator, (educator) => educator.groups, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'educator_id' })
  educator?: Educator;

  @OneToMany(() => GroupSchedule, (schedule) => schedule.group)
  schedules: GroupSchedule[];

  @OneToMany(() => Attendance, (attendance) => attendance.group)
  attendanceRecords: Attendance[];

  @OneToMany(() => Evaluation, (evaluation) => evaluation.group)
  evaluations: Evaluation[];
}
