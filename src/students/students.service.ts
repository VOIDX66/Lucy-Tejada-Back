// src/students/students.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { User } from '../users/entities/user.entity';
import { Program } from '../programs/entities/program.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { AuditLog } from '../audit_logs/entities/audit.entity';
import { CreateStudentProfileDto } from './dto/createStudentProfile.dto';
import { UpdateStudentDto } from './dto/updateStudent.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Program) private programRepo: Repository<Program>,
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
  ) {}

  async createStudentProfile(
    userId: string,
    dto: CreateStudentProfileDto,
    performedBy: string,
    ipAddress: string,
  ) {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user || user.role !== 'STUDENT') {
      throw new NotFoundException('Usuario estudiante no encontrado');
    }

    const existing = await this.studentRepo.findOne({ where: { id: userId } });
    if (existing) {
      throw new BadRequestException('El perfil de estudiante ya existe');
    }

    const student = this.studentRepo.create({
      id: userId,
      birthDate: dto.birthDate,
      cityOfOrigin: dto.cityOfOrigin,
      gender: dto.gender,
    });

    await this.studentRepo.save(student);

    // Audit
    await this.auditRepo.save(
      this.auditRepo.create({
        userId: performedBy,
        action: 'CREATE_STUDENT_PROFILE',
        entity: 'Student',
        ipAddress,
        result: `Perfil creado para estudiante ${userId}`,
        createdAt: new Date(),
      }),
    );

    return { message: 'Perfil creado exitosamente', student };
  }
  async updateStudentProfile(
    userId: string,
    dto: UpdateStudentDto,
    performedBy: string,
    ipAddress: string,
  ) {
    // Buscar el perfil del estudiante
    const student = await this.studentRepo.findOne({ where: { id: userId } });
    if (!student) {
      throw new NotFoundException('Perfil del estudiante no encontrado');
    }

    // Verificar que el usuario que hace la acción sea el mismo estudiante o un ADMIN
    const user = await this.userRepo.findOne({ where: { id: performedBy } });
    if (!user) {
      throw new NotFoundException(
        'Usuario que realiza la acción no encontrado',
      );
    }
    if (user.role !== 'ADMIN' && user.id !== userId) {
      throw new ForbiddenException(
        'No tienes permisos para actualizar este perfil',
      );
    }

    // Actualizar los campos permitidos
    Object.assign(student, dto);

    await this.studentRepo.save(student);

    // Registrar audit log
    const log = this.auditRepo.create({
      userId: performedBy,
      action: 'UPDATE_STUDENT_PROFILE',
      entity: 'Student',
      ipAddress: ipAddress,
      result: `Perfil del estudiante ${userId} actualizado`,
      createdAt: new Date(),
    });
    await this.auditRepo.save(log);

    return {
      message: 'Perfil actualizado correctamente',
      studentId: student.id,
      updatedFields: Object.keys(dto),
    };
  }
}
