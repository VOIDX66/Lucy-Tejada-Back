import { Test, TestingModule } from '@nestjs/testing';
import { EducatorProgramsController } from './educator_programs.controller';

describe('EducatorProgramsController', () => {
  let controller: EducatorProgramsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EducatorProgramsController],
    }).compile();

    controller = module.get<EducatorProgramsController>(
      EducatorProgramsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
