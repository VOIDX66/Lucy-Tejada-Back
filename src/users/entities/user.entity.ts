import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'ADMIN',
  EDUCATOR = 'EDUCATOR',
  STUDENT = 'STUDENT',
}

@Entity('users')
export class User {
  @ApiProperty({
    example: 'a52f8cb9-70e7-4b61-b84b-3afc6a43b8a1',
    description: 'Identificador único del usuario (UUID).',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Juan', description: 'Nombre del usuario.' })
  @Column({ name: 'first_name', type: 'varchar' })
  firstName: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido del usuario.' })
  @Column({ name: 'last_name', type: 'varchar' })
  lastName: string;

  @ApiProperty({
    example: 'CC',
    description: 'Tipo de documento del usuario.',
    nullable: true,
  })
  @Column({ name: 'document_type', type: 'varchar', nullable: true })
  documentType: string;

  @ApiProperty({
    example: '1045632299',
    description: 'Número de documento.',
    nullable: true,
  })
  @Column({
    name: 'document_number',
    type: 'varchar',
    unique: true,
    nullable: true,
  })
  documentNumber: string;

  @ApiProperty({
    example: 'juan.perez@example.com',
    description: 'Correo electrónico único del usuario.',
  })
  @Column({ type: 'varchar', unique: true })
  email: string;

  @ApiProperty({
    example: '+57 3104567890',
    description: 'Teléfono del usuario.',
    nullable: true,
  })
  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @ApiProperty({
    example: 'Cra 10 #15-20, Pereira',
    description: 'Dirección de residencia.',
    nullable: true,
  })
  @Column({ type: 'varchar', nullable: true })
  address: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.STUDENT,
    description: 'Rol asignado al usuario.',
  })
  @Column({ type: 'varchar' })
  role: string;

  @ApiHideProperty()
  @Column({ name: 'password_hash', type: 'varchar' })
  passwordHash: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el usuario está activo.',
  })
  @Column({ name: 'is_active', type: 'boolean' })
  isActive: boolean;

  @ApiProperty({
    example: '2025-10-23T15:00:00.000Z',
    description: 'Fecha de creación del usuario.',
  })
  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    example: '2025-10-24T10:15:00.000Z',
    description: 'Último inicio de sesión del usuario.',
    nullable: true,
  })
  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin: Date | null;

  @Column({ name: 'profile_picture', type: 'varchar', nullable: true })
  profilePicture: string | null;
}
