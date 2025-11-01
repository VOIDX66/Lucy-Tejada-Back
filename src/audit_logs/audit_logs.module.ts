import { Module } from '@nestjs/common';
import { AuditLogsController } from './audit_logs.controller';
import { AuditLogsService } from './audit_logs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditLogsController],
  providers: [AuditLogsService],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
