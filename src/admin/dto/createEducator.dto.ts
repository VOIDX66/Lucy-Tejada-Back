import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
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
}
