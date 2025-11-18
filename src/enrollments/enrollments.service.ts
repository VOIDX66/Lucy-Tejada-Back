// src/enrollments/enrollment.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Program } from '../programs/entities/program.entity';
import { Enrollment, EnrollmentStatus } from './entities/enrollment.entity';
import { AuditLog } from '../audit_logs/entities/audit.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(Program) private programRepo: Repository<Program>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
  ) {}

  /**
   * Inscribe a un estudiante en un programa.
   * @param studentId ID del estudiante
   * @param programId ID del programa
   * @param performedBy Usuario que realiza la inscripción
   * @param ipAddress IP desde donde se realiza la acción
   */
  async enrollInProgram(
    studentId: string,
    programId: string,
    performedBy: string,
    ipAddress: string,
  ) {
    // Validar que el usuario exista y sea STUDENT
    const user = await this.userRepo.findOne({ where: { id: studentId } });
    if (!user || user.role !== 'STUDENT') {
      throw new NotFoundException('Usuario estudiante no encontrado');
    }

    // Validar que el programa exista
    const program = await this.programRepo.findOne({
      where: { id: programId },
    });
    if (!program) {
      throw new NotFoundException('Programa no encontrado');
    }

    // Validar que el estudiante tenga perfil
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
    });
    if (!student) {
      throw new BadRequestException(
        'El estudiante debe crear su perfil antes de inscribirse en un programa',
      );
    }

    // Verificar inscripción previa
    const existingEnrollment = await this.enrollmentRepo.findOne({
      where: { student: { id: studentId }, program: { id: programId } },
    });
    if (existingEnrollment) {
      throw new BadRequestException(
        'El estudiante ya está inscrito en este programa',
      );
    }

    // Validar capacidad del programa
    const currentEnrollments = await this.enrollmentRepo.count({
      where: { program: { id: programId } },
    });
    if (currentEnrollments >= program.capacity) {
      throw new BadRequestException('No hay cupos disponibles en el programa');
    }

    // Crear inscripción
    const enrollment = this.enrollmentRepo.create({
      student,
      program,
      group: null,
      status: EnrollmentStatus.ACTIVE,
    });

    await this.enrollmentRepo.save(enrollment);

    // Registrar audit log
    const log = this.auditRepo.create({
      userId: performedBy,
      action: 'ENROLL_STUDENT',
      entity: 'Enrollment',
      ipAddress,
      result: `Estudiante ${studentId} inscrito en programa ${programId}`,
      createdAt: new Date(),
    });

    await this.auditRepo.save(log);

    // Retornar todas las inscripciones del estudiante
    const allEnrollments = await this.enrollmentRepo.find({
      where: { student: { id: studentId } },
      relations: ['program', 'group'],
    });

    return {
      message: 'Inscripción exitosa',
      enrollmentId: enrollment.id,
      currentEnrollments: allEnrollments.map((e) => ({
        enrollmentId: e.id,
        programId: e.program.id,
        programName: e.program.name,
        groupId: e.group?.id || null,
        status: e.status,
      })),
    };
  }

  /**
   * Obtener todas las inscripciones de un estudiante
   * @param studentId ID del estudiante
   */
  async getStudentEnrollments(studentId: string) {
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const enrollments = await this.enrollmentRepo.find({
      where: { student: { id: studentId } },
      relations: ['program', 'group'],
    });

    return enrollments.map((e) => ({
      enrollmentId: e.id,
      programId: e.program.id,
      programName: e.program.name,
      groupId: e.group?.id || null,
      status: e.status,
    }));
  }

  /**
   * Cancelar una inscripción
   * @param enrollmentId ID de la inscripción
   * @param performedBy Usuario que realiza la acción
   * @param ipAddress IP de la acción
   */
  async cancelEnrollment(
    enrollmentId: string,
    performedBy: string,
    ipAddress: string,
  ) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { id: enrollmentId },
    });
    if (!enrollment) {
      throw new NotFoundException('Inscripción no encontrada');
    }

    enrollment.status = EnrollmentStatus.CANCELLED;
    await this.enrollmentRepo.save(enrollment);

    // Audit log
    const log = this.auditRepo.create({
      userId: performedBy,
      action: 'CANCEL_ENROLLMENT',
      entity: 'Enrollment',
      ipAddress,
      result: `Inscripción ${enrollmentId} cancelada`,
      createdAt: new Date(),
    });

    await this.auditRepo.save(log);

    return { message: 'Inscripción cancelada', enrollmentId };
  }
}
