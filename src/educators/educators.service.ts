import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Educator } from './entities/educator.entity';

@Injectable()
export class EducatorsService {
  constructor(
    @InjectRepository(Educator)
    private readonly educatorRepo: Repository<Educator>,
  ) {}

  // ===========================================
  // CREATE EDUCATOR
  // ===========================================

  async create(id: string, specialization: string, description?: string) {
    const educator = this.educatorRepo.create({
      id,
      specialization,
      description,
      hire_date: new Date(),
      status: 'ACTIVE',
    });

    return this.educatorRepo.save(educator);
  }
}
