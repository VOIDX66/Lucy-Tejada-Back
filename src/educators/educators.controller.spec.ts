import { Test, TestingModule } from '@nestjs/testing';
import { EducatorsController } from './educators.controller';

describe('EducatorsController', () => {
  let controller: EducatorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EducatorsController],
    }).compile();

    controller = module.get<EducatorsController>(EducatorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
