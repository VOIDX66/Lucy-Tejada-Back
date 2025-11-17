import { Test, TestingModule } from '@nestjs/testing';
import { EducatorProgramsService } from './educator_programs.service';

describe('EducatorProgramsService', () => {
  let service: EducatorProgramsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EducatorProgramsService],
    }).compile();

    service = module.get<EducatorProgramsService>(EducatorProgramsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
