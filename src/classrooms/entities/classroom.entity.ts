import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { GroupSchedule } from '../../scheduling/entities/groupSchedule.entity';

export enum ClassroomType {
  DANZA = 'DANZA',
  MUSICA = 'MUSICA',
  TEATRO = 'TEATRO',
  ARTES_VISUALES = 'ARTES_VISUALES',
  GENERAL = 'GENERAL',
}

export enum ClassroomStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

@Entity('classrooms')
export class Classroom {
  @ApiProperty({
    example: 'f3d8c94b-1a42-4050-afc1-bab8a90a523b',
    description: 'Identificador único del salón (UUID).',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Salón de Danza 01',
    description: 'Nombre único del salón.',
  })
  @Column({ name: 'name', type: 'varchar', unique: true })
  name: string;

  @ApiProperty({
    enum: ClassroomType,
    example: ClassroomType.DANZA,
    description: 'Tipo de salón.',
  })
  @Column({
    name: 'type',
    type: 'enum',
    enum: ClassroomType,
    enumName: 'classroom_type',
    default: ClassroomType.GENERAL,
  })
  type: ClassroomType;

  @ApiProperty({
    example: 30,
    description: 'Capacidad máxima del salón.',
  })
  @Column({ name: 'capacity', type: 'int' })
  capacity: number;

  @ApiProperty({
    example: 'Segundo piso, bloque B',
    description: 'Ubicación del salón dentro del centro cultural.',
    nullable: true,
  })
  @Column({ name: 'location', type: 'varchar', length: 150, nullable: true })
  location?: string;

  @ApiProperty({
    enum: ClassroomStatus,
    example: ClassroomStatus.ACTIVE,
    description: 'Estado operativo del salón.',
  })
  @Column({
    name: 'status',
    type: 'enum',
    enum: ClassroomStatus,
    enumName: 'classroom_status',
    default: ClassroomStatus.ACTIVE,
  })
  status: ClassroomStatus;

  @ApiProperty({
    example: '2025-11-16T18:00:00.000Z',
    description: 'Fecha de creación del registro.',
  })
  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    example: '2025-11-16T18:10:00.000Z',
    description: 'Fecha de última actualización.',
  })
  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => GroupSchedule, (schedule) => schedule.classroom)
  schedules: GroupSchedule[];
}
