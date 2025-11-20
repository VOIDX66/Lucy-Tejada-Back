import { ApiProperty } from '@nestjs/swagger';

export class ProgramEnrollmentCountDto {
  @ApiProperty({ description: 'UUID del programa' })
  programId: string;

  @ApiProperty({ description: 'Total de inscripciones del programa' })
  totalEnrollments: number;

  @ApiProperty({ description: 'Inscripciones con estado ACTIVE' })
  activeEnrollments: number;

  @ApiProperty({ description: 'Inscripciones con estado COMPLETED' })
  completedEnrollments: number;

  @ApiProperty({ description: 'Inscripciones con estado CANCELLED' })
  cancelledEnrollments: number;
}
