import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { AuditLogsModule } from '../audit_logs/audit_logs.module';

@Module({
  imports: [
    UsersModule,
    AuditLogsModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'supersecretmondongorecipe',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
