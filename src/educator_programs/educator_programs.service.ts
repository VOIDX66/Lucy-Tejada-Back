import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EducatorProgram } from './entities/educatorProgram.entity';

@Injectable()
export class EducatorProgramsService {
  constructor(
    @InjectRepository(EducatorProgram)
    private readonly repo: Repository<EducatorProgram>,
  ) {}

  async assignEducatorToProgram(educatorId: string, programId: string) {
    try {
      const relation = this.repo.create({
        educator_id: educatorId,
        program_id: programId,
      });
      return await this.repo.save(relation);
    } catch (error) {
      const err = error as { code: string };
      if (err.code === '23505') {
        throw new BadRequestException('Ya está asignado.');
      }
      throw error;
    }
  }

  async assignEducatorToPrograms(educatorId: string, programIds: string[]) {
    const results = [];
    for (const pid of programIds) {
      try {
        const relation = this.repo.create({
          educator_id: educatorId,
          program_id: pid,
        });
        const saved = await this.repo.save(relation);
        const results: Array<EducatorProgram> = [];
        results.push(saved);
      } catch (error) {
        const err = error as { code: string };
        if (err.code === '23505') continue;
        throw error;
      }
    }
    return results;
  }
}
