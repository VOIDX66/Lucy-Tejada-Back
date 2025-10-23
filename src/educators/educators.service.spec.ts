import { Test, TestingModule } from '@nestjs/testing';
import { EducatorsService } from './educators.service';

describe('EducatorsService', () => {
  let service: EducatorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EducatorsService],
    }).compile();

    service = module.get<EducatorsService>(EducatorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
