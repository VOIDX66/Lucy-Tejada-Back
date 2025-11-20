import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Group } from './entities/group.entity';
import { Program } from '../programs/entities/program.entity';
import {
  Enrollment,
  EnrollmentStatus,
} from '../enrollments/entities/enrollment.entity';
import { EducatorProgram } from '../educator_programs/entities/educatorProgram.entity';
import { Educator } from '../educators/entities/educator.entity';
import { AuditLog } from '../audit_logs/entities/audit.entity';
import { Student } from '../students/entities/student.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group) private groupRepo: Repository<Group>,
    @InjectRepository(Program) private programRepo: Repository<Program>,
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(EducatorProgram)
    private educatorProgramRepo: Repository<EducatorProgram>,
    @InjectRepository(Educator) private educatorRepo: Repository<Educator>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
  ) {}

  /**
   * Genera grupos para un programa en base a la cantidad de inscritos.
   * - groupCapacity: si se provee, se usa; si no, se usa default 25.
   * - namePrefix: prefijo para los nombres.
   */
  async createGroupsForProgram(
    programId: string,
    performedBy: string,
    ipAddress: string,
    options?: { groupCapacity?: number; namePrefix?: string },
  ) {
    // 1) validar programa
    const program = await this.programRepo.findOne({
      where: { id: programId },
    });
    if (!program) throw new NotFoundException('Programa no encontrado');

    // 2) obtener enrollments activos
    const enrollments = await this.enrollmentRepo.find({
      where: { program: { id: programId }, status: EnrollmentStatus.ACTIVE },
      relations: ['student'],
      order: { enrolledAt: 'ASC' },
    });

    const totalStudents = enrollments.length;
    if (totalStudents === 0) {
      throw new BadRequestException(
        'No hay estudiantes inscritos en este programa',
      );
    }

    // 3) capacidad por grupo
    const groupCapacity = options?.groupCapacity ?? 25;
    if (groupCapacity <= 0)
      throw new BadRequestException('Capacidad por grupo inválida');

    // 4) número de grupos
    const numGroups = Math.ceil(totalStudents / groupCapacity);

    // 5) educadores del programa
    const educatorPrograms = await this.educatorProgramRepo.find({
      where: { program: { id: programId } },
      relations: ['educator'],
    });

    const educators = educatorPrograms
      .map((ep) => ep.educator)
      .filter((e): e is Educator => Boolean(e));

    // 6) crear grupos
    const groups: Group[] = [];
    const namePrefix = options?.namePrefix ?? `${program.name} - Grupo`;

    for (let i = 0; i < numGroups; i++) {
      const assignedEducator =
        educators.length > 0 ? educators[i % educators.length] : null;

      const group = this.groupRepo.create({
        groupName: `${namePrefix} ${i + 1}`,
        programId: program.id,
        educatorId: assignedEducator?.id ?? null,
        educator: assignedEducator ?? null,
        capacity: groupCapacity,
      });

      groups.push(group);
    }

    const createdGroups = await this.groupRepo.save(groups);

    // 7) distribución equitativa (round robin)
    const groupAssignments: Record<string, string[]> = {};
    createdGroups.forEach((g) => (groupAssignments[g.id] = []));

    for (let i = 0; i < enrollments.length; i++) {
      const groupIndex = i % createdGroups.length;
      const group = createdGroups[groupIndex];
      groupAssignments[group.id].push(enrollments[i].id);
    }

    // 8) actualizar enrollments con el grupo asignado

    // Obtener IDs de los enrollments
    const enrollmentIds = enrollments.map((e) => e.id);

    // Buscar los enrollments completos para actualizar group
    const toUpdateEnrollments = await this.enrollmentRepo.find({
      where: { id: In(enrollmentIds) },
      relations: ['student', 'program'],
    });

    // Map rápido: enrollmentId -> objeto
    const enrollmentMap = new Map<string, Enrollment>(
      toUpdateEnrollments.map((e) => [e.id, e]),
    );

    for (const [groupId, enrollmentList] of Object.entries(groupAssignments)) {
      const groupEntity = createdGroups.find((g) => g.id === groupId);

      for (const enrollmentId of enrollmentList) {
        const ent = enrollmentMap.get(enrollmentId);
        if (ent) ent.group = groupEntity!;
      }
    }

    await this.enrollmentRepo.save([...enrollmentMap.values()]);

    // 9) audit log
    await this.auditRepo.save(
      this.auditRepo.create({
        userId: performedBy,
        action: 'GENERATE_GROUPS',
        entity: 'Group',
        ipAddress,
        result: `Generados ${createdGroups.length} grupos para programa ${programId} y asignados ${totalStudents} estudiantes`,
        createdAt: new Date(),
      }),
    );

    // 10) respuesta resumida
    const summary = createdGroups.map((g) => ({
      groupId: g.id,
      groupName: g.groupName,
      educatorId: g.educator?.id ?? null,
      capacity: g.capacity,
      assignedStudents: groupAssignments[g.id]?.length ?? 0,
    }));

    return {
      message: 'Grupos generados correctamente',
      programId,
      totalStudents,
      groupCapacity,
      groups: summary,
    };
  }
}
