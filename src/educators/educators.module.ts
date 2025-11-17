import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EducatorsController } from './educators.controller';
import { EducatorsService } from './educators.service';
import { Educator } from './entities/educator.entity';
import { Group } from '../groups/entities/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Educator, Group])],
  controllers: [EducatorsController],
  providers: [EducatorsService],
  exports: [EducatorsService],
})
export class EducatorsModule {}
