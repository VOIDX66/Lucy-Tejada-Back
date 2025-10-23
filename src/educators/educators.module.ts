import { Module } from '@nestjs/common';
import { EducatorsController } from './educators.controller';
import { EducatorsService } from './educators.service';

@Module({
  controllers: [EducatorsController],
  providers: [EducatorsService]
})
export class EducatorsModule {}
