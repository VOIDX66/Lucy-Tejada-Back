import { Module } from '@nestjs/common';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { Student } from '../students/entities/student.entity';
import { Program } from '../programs/entities/program.entity';
import { User } from '../users/entities/user.entity';
import { AuditLog } from '../audit_logs/entities/audit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment, Student, Program, User, AuditLog]),
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
