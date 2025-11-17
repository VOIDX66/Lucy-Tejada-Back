// src/programs/dto/create-program.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ProgramStatus } from '../../programs/entities/program.entity';

export class CreateProgramDto {
  @ApiProperty({
    example: 'Danza Contemporánea',
    description: 'Nombre del programa',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Programa formativo de danza contemporánea para jóvenes.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 25, description: 'Cupos máximos del programa' })
  @IsOptional()
  @IsInt()
  @Min(0)
  capacity?: number;

  @ApiProperty({
    enum: ProgramStatus,
    example: ProgramStatus.ACTIVE,
    description: 'Estado del programa',
  })
  @IsOptional()
  @IsEnum(ProgramStatus)
  status?: ProgramStatus;

  @ApiProperty({
    example: '2025-01-15',
    description: 'Fecha de inicio (YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty({
    example: '2025-06-30',
    description: 'Fecha de fin (YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;
}
