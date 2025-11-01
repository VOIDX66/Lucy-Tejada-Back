import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit.entity';

export interface LogActionParams {
  userId: string;
  action: string;
  entity: string;
  ipAddress?: string;
  result?: string;
}

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async logAction(params: LogActionParams): Promise<void> {
    const log = this.auditRepository.create(params);
    await this.auditRepository.save(log);
  }
}
