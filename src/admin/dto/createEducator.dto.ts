import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsUUID,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/createUser.dto';

export class CreateEducatorDto extends CreateUserDto {
  @ApiProperty({
    example: 'Música • Violín',
    description: 'Especialización principal del profesor.',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  specialization: string;

  @ApiPropertyOptional({
    example: 'Profesor con amplia experiencia en formación artística.',
    description: 'Descripción general del profesor.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: [String],
    description:
      'Lista de IDs de programas a los que se asignará este profesor. Opcional.',
    example: [
      'a3f4e5a1-1234-4567-89ab-d3c5f12e9f44',
      'b9c8d7e6-9876-4321-bcde-556677889900',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  program_ids?: string[];
}
