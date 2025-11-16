import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { UsersModule } from '../users/users.module';
import { AuditLogsModule } from '../audit_logs/audit_logs.module';

import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwtAuth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    UsersModule,
    AuditLogsModule,

    // Passport sin llamada insegura
    PassportModule,

    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'supersecretmondongorecipe',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard, JwtStrategy, JwtModule, PassportModule],
})
export class AuthModule {}
