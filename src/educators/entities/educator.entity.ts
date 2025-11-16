import { Entity, PrimaryColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum EducatorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('educators')
export class Educator {
  @ApiProperty({
    example: 'a52f8cb9-70e7-4b61-b84b-3afc6a43b8a1',
    description: 'ID del educador. Coincide con la tabla users.',
  })
  @PrimaryColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Danza contemporánea',
    description: 'Especialización del educador.',
  })
  @Column({ type: 'varchar', length: 150 })
  specialization: string;

  @ApiProperty({
    example: 'Profesora con experiencia de 10 años en danza.',
    description: 'Descripción del educador.',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    example: '2025-01-10',
    description: 'Fecha de contratación.',
  })
  @Column({ type: 'date', nullable: true })
  hire_date?: Date;

  @ApiProperty({
    enum: EducatorStatus,
    example: EducatorStatus.ACTIVE,
    description: 'Estado del educador.',
  })
  @Column({ type: 'varchar', default: EducatorStatus.ACTIVE })
  status: string;
}
