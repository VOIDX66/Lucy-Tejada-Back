// src/users/dto/createUser.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  // --- Campos Requeridos ---

  @ApiProperty({
    example: 'nuevo.usuario@example.com',
    description:
      'Correo electrónico del usuario. Debe ser único en el sistema.',
    maxLength: 150,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  email: string;

  @ApiProperty({
    example: 'MiClaveSegura123',
    description: 'Contraseña del usuario (mínimo 6 caracteres).',
    minLength: 6,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  @MaxLength(255)
  password: string;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario.',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  first_name: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del usuario.',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  last_name: string;

  // --- Campos Opcionales ---

  @ApiPropertyOptional({
    example: 'CC',
    description: 'Tipo de documento (CC, TI, CE, etc.)',
    maxLength: 10,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  document_type?: string;

  @ApiPropertyOptional({
    example: '1045632299',
    description: 'Número de documento.',
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  document_number?: string;

  @ApiPropertyOptional({
    example: '+57 3104567890',
    description: 'Teléfono de contacto.',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    example: 'Cra 10 #15-20, Pereira',
    description: 'Dirección de residencia.',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;
}
