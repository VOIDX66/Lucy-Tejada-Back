import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { User } from '../users/entities/user.entity';
import { Program } from '../programs/entities/program.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { AuditLog } from '../audit_logs/entities/audit.entity';
import { Attendance } from '../attendances/entities/attendance.entity';
import { Evaluation } from '../evaluations/entities/evaluation.entity';
import { EnrollmentsModule } from 'src/enrollments/enrollments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      User,
      Program,
      Enrollment,
      AuditLog,
      Attendance,
      Evaluation,
    ]),
    EnrollmentsModule,
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
