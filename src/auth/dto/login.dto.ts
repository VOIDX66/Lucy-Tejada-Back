// src/auth/dto/login.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'usuario@example.com',
    description: 'Correo electrónico registrado.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'MiClaveSegura123',
    description: 'Contraseña del usuario (mínimo 6 caracteres).',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
