import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { EducatorsModule } from 'src/educators/educators.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuditLogsModule } from 'src/audit_logs/audit_logs.module';
import { EducatorProgramsModule } from 'src/educator_programs/educator_programs.module';

@Module({
  imports: [
    UsersModule,
    EducatorsModule,
    AuditLogsModule,
    EducatorProgramsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
