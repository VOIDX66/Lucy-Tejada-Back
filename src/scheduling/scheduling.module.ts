import { Module } from '@nestjs/common';
import { SchedulingController } from './scheduling.controller';
import { SchedulingService } from './scheduling.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupSchedule } from './entities/groupSchedule.entity';
import { Group } from '../groups/entities/group.entity';
import { Classroom } from '../classrooms/entities/classroom.entity';
import { Educator } from '../educators/entities/educator.entity';
import { Program } from '../programs/entities/program.entity';
import { AuditLog } from '../audit_logs/entities/audit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GroupSchedule,
      Group,
      GroupSchedule,
      Classroom,
      Educator,
      Program,
      AuditLog,
    ]),
  ],
  controllers: [SchedulingController],
  providers: [SchedulingService],
  exports: [SchedulingService],
})
export class SchedulingModule {}
