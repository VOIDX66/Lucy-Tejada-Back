// src/students/dto/enroll-student.dto.ts
import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnrollStudentDto {
  @ApiProperty({
    description: 'ID del programa al que se inscribe el estudiante',
    type: 'string',
    format: 'uuid',
    example: 'a3caa25f-3028-4c4e-9eb2-95b6ecd7d3d7',
  })
  @IsNotEmpty()
  @IsUUID()
  programId: string;
}
