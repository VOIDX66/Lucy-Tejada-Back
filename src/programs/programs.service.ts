import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from './entities/program.entity';
import { CreateProgramDto } from './dto/createProgram.dto';
import { UpdateProgramDto } from './dto/updateProgram.dto';
import { AuditLogsService } from 'src/audit_logs/audit_logs.service';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private readonly repo: Repository<Program>,
    private readonly auditService: AuditLogsService,
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
}
