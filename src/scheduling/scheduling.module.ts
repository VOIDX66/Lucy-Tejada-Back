import { Module } from '@nestjs/common';
import { SchedulingController } from './scheduling.controller';
import { SchedulingService } from './scheduling.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupSchedule } from './entites/groupSchedule.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Classroom } from 'src/classrooms/entities/classroom.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GroupSchedule, Group, Classroom])],
  controllers: [SchedulingController],
  providers: [SchedulingService],
})
export class SchedulingModule {}
