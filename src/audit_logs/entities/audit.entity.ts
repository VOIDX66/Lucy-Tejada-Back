import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('audit_logs')
export class AuditLog {
  @ApiProperty({
    description: 'Identificador único del registro de auditoría (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Identificador del usuario asociado al evento' })
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ApiProperty({
    description: 'Acción registrada (LOGIN, UPDATE, DELETE, etc.)',
  })
  @Column({ type: 'varchar' })
  action: string;

  @ApiProperty({
    description:
      'Entidad o módulo sobre el cual se ejecutó la acción (Users, Auth, etc.)',
  })
  @Column({ type: 'varchar' })
  entity: string;

  @ApiProperty({ description: 'Fecha y hora del evento' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    description: 'Dirección IP desde la que se realizó la acción',
    nullable: true,
  })
  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  ipAddress?: string;

  @ApiProperty({
    description:
      'Resultado o estado final de la acción (SUCCESS, FAILURE, etc.)',
  })
  @Column({ type: 'varchar' })
  result: string;
}
