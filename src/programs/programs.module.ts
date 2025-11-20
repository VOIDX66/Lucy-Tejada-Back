// src/programs/programs.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramsService } from './programs.service';
import { ProgramsController } from './programs.controller';
import { Program } from './entities/program.entity';
import { AuditLogsModule } from 'src/audit_logs/audit_logs.module';
import { GroupsModule } from 'src/groups/groups.module';
import { EnrollmentsModule } from 'src/enrollments/enrollments.module';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { SchedulingModule } from 'src/scheduling/scheduling.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Program, Enrollment]),
    AuditLogsModule,
    GroupsModule,
    EnrollmentsModule,
    SchedulingModule,
  ],
  providers: [ProgramsService],
  controllers: [ProgramsController],
  exports: [ProgramsService],
})
export class ProgramsModule {}
