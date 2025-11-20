import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Group } from './entities/group.entity';
import { Educator } from '../educators/entities/educator.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Program } from '../programs/entities/program.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { EducatorProgram } from '../educator_programs/entities/educatorProgram.entity';
import { Student } from '../students/entities/student.entity';
import { AuditLog } from '../audit_logs/entities/audit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Group,
      Educator,
      Program,
      EducatorProgram,
      Enrollment,
      Student,
      AuditLog,
    ]),
  ],
  providers: [GroupsService],
  controllers: [GroupsController],
  exports: [GroupsService],
})
export class GroupsModule {}
