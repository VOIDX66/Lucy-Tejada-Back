import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from './entities/program.entity';
import { Educator } from '../educators/entities/educator.entity';
import { EducatorProgram } from '../educator_programs/entities/educatorProgram.entity';
import { CreateProgramDto } from './dto/createProgram.dto';
import { UpdateProgramDto } from './dto/updateProgram.dto';
import { AuditLogsService } from 'src/audit_logs/audit_logs.service';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';
import {
  Enrollment,
  EnrollmentStatus,
} from '../enrollments/entities/enrollment.entity';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private readonly repo: Repository<Program>,
    private readonly auditService: AuditLogsService,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
  ) {}

  // ---------------------------------------------------------
  //  VALIDACIONES
  // ---------------------------------------------------------

  private async ensureNameUnique(name: string, excludeId?: string) {
    const exists = await this.repo.findOne({
      where: { name },
    });

    if (exists && exists.id !== excludeId) {
      throw new BadRequestException('Ya existe un programa con ese nombre.');
    }
  }

  private validateDates(start?: string, end?: string) {
    if (start && end) {
      const s = new Date(start);
      const e = new Date(end);
      if (s > e) {
        throw new BadRequestException(
          'La fecha de inicio debe ser anterior a la fecha de fin.',
        );
      }
    }
  }

  // ---------------------------------------------------------
  //  CREATE
  // ---------------------------------------------------------
  async create(dto: CreateProgramDto, adminId: string, ipAddress: string) {
    await this.ensureNameUnique(dto.name);
    this.validateDates(dto.start_date, dto.end_date);

    const program = this.repo.create(dto as Partial<Program>);
    const saved = await this.repo.save(program);

    await this.auditService.logAction({
      userId: adminId,
      action: 'CREATE_PROGRAM',
      entity: 'Program',
      ipAddress,
      result: `Programa ${saved.id} creado correctamente`,
    });

    return saved;
  }

  // ---------------------------------------------------------
  //  FIND ALL
  // ---------------------------------------------------------
  findAll() {
    return this.repo.find();
  }

  // ---------------------------------------------------------
  //  FIND ONE
  // ---------------------------------------------------------
  async findOne(id: string) {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) {
      throw new NotFoundException('Programa no encontrado.');
    }
    return p;
  }

  // ---------------------------------------------------------
  //  ASSIGN EDUCATOR TO PROGRAM
  // ---------------------------------------------------------
  async assignEducatorToProgram(
    programId: string,
    educatorId: string,
    adminId?: string,
    ipAddress?: string,
  ) {
    const program = await this.repo.findOne({ where: { id: programId } });
    if (!program) throw new NotFoundException('Programa no encontrado.');

    const educator = await this.repo.manager.findOne(Educator, {
      where: { id: educatorId },
      relations: ['user'],
    });
    if (!educator) throw new NotFoundException('Profesor no encontrado.');

    const existing = await this.repo.manager.findOne(EducatorProgram, {
      where: { program_id: programId, educator_id: educatorId },
    });
    if (existing) {
      throw new BadRequestException(
        'Este profesor ya está asignado a este programa.',
      );
    }

    const relation = this.repo.manager.create(EducatorProgram, {
      program_id: programId,
      educator_id: educatorId,
    });
    await this.repo.manager.save(relation);

    // Audit log
    if (adminId && ipAddress) {
      await this.auditService.logAction({
        userId: adminId,
        action: 'ASSIGN_EDUCATOR_TO_PROGRAM',
        entity: 'EducatorProgram',
        ipAddress,
        result: `Educador ${educatorId} asignado al programa ${programId}`,
      });
    }

    return {
      message: 'Profesor asignado al programa correctamente.',
      program_id: programId,
      educator: {
        id: educator.id,
        name: educator.user.firstName + ' ' + educator.user.lastName,
        email: educator.user.email,
        specialization: educator.specialization,
      },
    };
  }

  // ---------------------------------------------------------
  //  GET EDUCATOR BY PROGRAM
  // ---------------------------------------------------------

  async getEducatorsByProgram(programId: string) {
    const program = await this.repo.findOne({
      where: { id: programId },
      relations: [
        'educatorPrograms',
        'educatorPrograms.educator',
        'educatorPrograms.educator.user',
      ],
    });

    if (!program) {
      throw new NotFoundException('Programa no encontrado.');
    }

    const educators = program.educatorPrograms.map((ep) => ({
      id: ep.educator.id,
      first_name: ep.educator.user.firstName,
      last_name: ep.educator.user.lastName,
      email: ep.educator.user.email,
      specialization: ep.educator.specialization,
      description: ep.educator.description,
      status: ep.educator.status,
    }));

    return {
      program_id: program.id,
      educators,
    };
  }

  // ---------------------------------------------------------
  //  DELETE EDUCATOR FROM ONE PROGRAM
  // ---------------------------------------------------------

  async removeEducatorFromProgram(
    programId: string,
    educatorId: string,
    adminId?: string,
    ipAddress?: string,
  ) {
    const program = await this.repo.findOne({ where: { id: programId } });
    if (!program) throw new NotFoundException('Programa no encontrado.');

    const existing = await this.repo.manager.findOne(EducatorProgram, {
      where: { program_id: programId, educator_id: educatorId },
    });
    if (!existing) {
      throw new NotFoundException(
        'Este profesor no está asignado a este programa.',
      );
    }

    await this.repo.manager.remove(existing);

    // Audit log
    if (adminId && ipAddress) {
      await this.auditService.logAction({
        userId: adminId,
        action: 'REMOVE_EDUCATOR_FROM_PROGRAM',
        entity: 'EducatorProgram',
        ipAddress,
        result: `Educador ${educatorId} removido del programa ${programId}`,
      });
    }

    return {
      message: 'Profesor removido del programa correctamente.',
      program_id: programId,
      educator_id: educatorId,
    };
  }

  // ---------------------------------------------------------
  //  UPDATE
  // ---------------------------------------------------------
  async update(
    id: string,
    dto: UpdateProgramDto,
    adminId: string,
    ipAddress: string,
  ) {
    const existing = await this.findOne(id);

    if (dto.name && dto.name !== existing.name) {
      await this.ensureNameUnique(dto.name, id);
    }

    const start: string | undefined =
      dto.start_date ?? (existing.startDate as unknown as string);

    const end: string | undefined =
      dto.end_date ?? (existing.endDate as unknown as string);

    this.validateDates(start, end);

    await this.repo.update(id, dto as QueryDeepPartialEntity<Program>);
    const updated = await this.findOne(id);

    await this.auditService.logAction({
      userId: adminId,
      action: 'UPDATE_PROGRAM',
      entity: 'Program',
      ipAddress,
      result: `Programa ${updated.id} actualizado correctamente`,
    });

    return updated;
  }

  // ---------------------------------------------------------
  //  DELETE
  // ---------------------------------------------------------
  async remove(id: string, adminId: string, ipAddress: string) {
    await this.findOne(id);
    await this.repo.delete(id);

    await this.auditService.logAction({
      userId: adminId,
      action: 'DELETE_PROGRAM',
      entity: 'Program',
      ipAddress,
      result: `Programa ${id} eliminado correctamente`,
    });
  }

  async getEnrollmentCount(programId: string) {
    const program = await this.repo.findOne({ where: { id: programId } });
    if (!program) throw new NotFoundException('Programa no encontrado');

    const active = await this.enrollmentRepo.count({
      where: { program: { id: programId }, status: EnrollmentStatus.ACTIVE },
    });

    const completed = await this.enrollmentRepo.count({
      where: { program: { id: programId }, status: EnrollmentStatus.COMPLETED },
    });

    const cancelled = await this.enrollmentRepo.count({
      where: { program: { id: programId }, status: EnrollmentStatus.CANCELLED },
    });

    return {
      programId,
      totalEnrollments: active + completed + cancelled,
      activeEnrollments: active,
      completedEnrollments: completed,
      cancelledEnrollments: cancelled,
    };
  }
}
