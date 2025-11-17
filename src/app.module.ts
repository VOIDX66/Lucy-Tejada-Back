import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProgramsModule } from './programs/programs.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { EducatorsModule } from './educators/educators.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditLogsModule } from './audit_logs/audit_logs.module';
import { AdminModule } from './admin/admin.module';
import { StudentsModule } from './students/students.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { ClassroomsModule } from './classrooms/classrooms.module';
import { GroupsModule } from './groups/groups.module';

@Module({
  imports: [
    // ============================================
    // 🌍 CARGA GLOBAL DE VARIABLES DE ENTORNO
    // ============================================
    ConfigModule.forRoot({ isGlobal: true }),

    // ============================================
    // CONEXIÓN TYPEORM CON SUPABASE (PostgreSQL)
    // ============================================
    TypeOrmModule.forRoot({
      type: 'postgres',
      // Usa la URL completa si está disponible (.env)
      url: process.env.SUPABASE_DB_URL,
      host: process.env.DB_HOST, // solo si no usas URL
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,

      ssl: { rejectUnauthorized: false }, // Requerido por Supabase
      synchronize: false, // Nunca en producción
      migrationsRun: false, // Aplica migraciones automáticamente
      migrations: ['dist/migrations/*.js'], // Ruta de migraciones compiladas
    }),

    // ============================================
    // MÓDULOS DE LA APLICACIÓN
    // ============================================
    AuthModule,
    UsersModule,
    ProgramsModule,
    EnrollmentsModule,
    EducatorsModule,
    ReportsModule,
    NotificationsModule,
    AuditLogsModule,
    AdminModule,
    StudentsModule,
    SchedulingModule,
    ClassroomsModule,
    GroupsModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
