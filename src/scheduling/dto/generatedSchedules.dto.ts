// src/scheduling/dto/generateSchedules.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsIn } from 'class-validator';

export class GenerateSchedulesDto {
  @ApiPropertyOptional({
    description: 'Duración en minutos por sesión (por defecto 120 = 2h)',
    example: 120,
  })
  @IsOptional()
  @IsInt()
  @Min(30)
  sessionDuration?: number = 120;

  @ApiPropertyOptional({
    description: 'Número de sesiones por semana por grupo (por defecto 2)',
    example: 2,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  sessionsPerWeek?: number = 2;

  @ApiPropertyOptional({
    description:
      'Días válidos (subconjunto de Lunes..Viernes). Valores posibles: Lunes,Martes,Miércoles,Jueves,Viernes',
  })
  @IsOptional()
  @IsIn(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'], { each: true })
  days?: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  @ApiPropertyOptional({
    description: 'Hora de inicio del horario (HH:MM), por defecto "08:00"',
    example: '08:00',
  })
  @IsOptional()
  startTime?: string = '08:00';

  @ApiPropertyOptional({
    description: 'Hora límite (no hay clases después de), por defecto "20:00"',
    example: '20:00',
  })
  @IsOptional()
  endTime?: string = '20:00';

  @ApiPropertyOptional({
    description:
      'Prefiero que el servicio asigne educadores solo si el grupo NO tiene uno asignado (default true)',
  })
  @IsOptional()
  assignEducatorsIfMissing?: boolean = true;
}
