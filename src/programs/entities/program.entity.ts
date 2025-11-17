import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Group } from 'src/groups/entities/group.entity';

export enum ProgramStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('programs')
export class Program {
  @ApiProperty({
    example: 'c9c73d52-4dfd-4cd5-8f68-8d53197da1f1',
    description: 'Identificador único del programa (UUID).',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Danza Contemporánea',
    description: 'Nombre del programa formativo.',
  })
  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({
    example: 'Curso formativo para jóvenes.',
    description: 'Descripción del programa.',
    nullable: true,
  })
  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    example: 25,
    description: 'Cupos disponibles.',
  })
  @Column({ name: 'capacity', type: 'int', default: 0 })
  capacity: number;

  @ApiProperty({
    enum: ProgramStatus,
    example: ProgramStatus.ACTIVE,
    description: 'Estado del programa.',
  })
  @Column({
    name: 'status',
    type: 'enum',
    enum: ProgramStatus,
    enumName: 'program_status', // ✔ Nombre del ENUM en PostgreSQL
    default: ProgramStatus.ACTIVE,
  })
  status: ProgramStatus;

  @ApiProperty({
    example: '2025-01-15',
    description: 'Fecha de inicio.',
    nullable: true,
  })
  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate?: string;

  @ApiProperty({
    example: '2025-06-30',
    description: 'Fecha de finalización.',
    nullable: true,
  })
  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: string;

  @OneToMany(() => Group, (group) => group.program)
  groups: Group[];
}
