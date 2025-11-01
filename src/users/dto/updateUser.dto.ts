import {
  IsOptional,
  IsString,
  IsEmail,
  Length,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Nombre del usuario.',
    example: 'Juan',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Apellido del usuario.',
    example: 'Pérez',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Tipo de documento (por ejemplo: CC, CE, TI).',
    example: 'CC',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  documentType?: string;

  @ApiPropertyOptional({
    description: 'Número de documento.',
    example: '1045632299',
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  documentNumber?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico del usuario.',
    example: 'juan.perez@example.com',
    maxLength: 120,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  email?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono del usuario.',
    example: '+57 3104567890',
    minLength: 7,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @Length(7, 20)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Dirección de residencia del usuario.',
    example: 'Cra 10 #15-20, Pereira',
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  address?: string;
}
