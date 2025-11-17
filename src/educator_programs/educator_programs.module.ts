import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EducatorProgram } from './entities/educatorProgram.entity';
import { EducatorProgramsService } from './educator_programs.service';

@Module({
  imports: [TypeOrmModule.forFeature([EducatorProgram])],
  providers: [EducatorProgramsService],
  exports: [EducatorProgramsService],
})
export class EducatorProgramsModule {}
