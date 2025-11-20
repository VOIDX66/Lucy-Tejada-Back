import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min, IsString } from 'class-validator';

export class GenerateGroupsDto {
  @ApiPropertyOptional({
    description:
      'Capacidad por grupo. Si no se provee, se usa group capacity por defecto (25) o el valor por programa si existe.',
    example: 25,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  groupCapacity?: number;

  @ApiPropertyOptional({
    description:
      'Prefijo para los nombres de los grupos. Si no se provee, se usa el nombre del programa + "Grupo".',
    example: 'Grupo',
  })
  @IsOptional()
  @IsString()
  namePrefix?: string;
}
