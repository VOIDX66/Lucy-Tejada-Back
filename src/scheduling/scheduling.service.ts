import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Group } from '../groups/entities/group.entity';
import { GroupSchedule } from './entities/groupSchedule.entity';
import { Educator } from '../educators/entities/educator.entity';
import {
  Classroom,
  ClassroomStatus,
  ClassroomType,
} from '../classrooms/entities/classroom.entity';
import { Program } from '../programs/entities/program.entity';

@Injectable()
export class SchedulingService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,

    @InjectRepository(GroupSchedule)
    private readonly scheduleRepo: Repository<GroupSchedule>,

    @InjectRepository(Educator)
    private readonly educatorRepo: Repository<Educator>,

    @InjectRepository(Classroom)
    private readonly classroomRepo: Repository<Classroom>,

    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,
  ) {}

  /**
   * 🔥 Mapea tipo de aula según nombre del programa
   */
  private getClassroomTypeForProgram(programName: string): ClassroomType {
    const n = programName.toLowerCase();

    if (n.includes('danza')) return ClassroomType.DANZA;
    if (n.includes('teatro')) return ClassroomType.TEATRO;
    if (n.includes('música') || n.includes('musica'))
      return ClassroomType.MUSICA;
    if (n.includes('arte') || n.includes('artes') || n.includes('visual'))
      return ClassroomType.ARTES_VISUALES;

    return ClassroomType.GENERAL;
  }

  /**
   * 🧠 Genera horarios siguiendo reglas:
   * - 1 clase semanal por grupo
   * - Duración: 2h
   * - Lunes a Viernes
   * - 14:00 a 20:00
   * - El educador NO puede tener dos clases en el mismo horario
   * - El aula NO puede estar ocupada en ese horario
   * - El aula debe ser del tipo correspondiente al programa
   */
  async generateSchedulesForProgram(programId: string) {
    const program = await this.programRepo.findOne({
      where: { id: programId },
    });

    if (!program) throw new NotFoundException('Programa no encontrado');

    // Determinar tipo de salón por nombre del programa
    const requiredClassroomType = this.getClassroomTypeForProgram(program.name);

    const groups = await this.groupRepo.find({
      where: { program: { id: programId } },
      relations: ['educator'],
    });

    if (groups.length === 0)
      throw new NotFoundException('No hay grupos para este programa');

    // Aulas activas del tipo correcto
    const classrooms = await this.classroomRepo.find({
      where: {
        type: requiredClassroomType,
        status: ClassroomStatus.ACTIVE,
      },
    });

    if (classrooms.length === 0)
      throw new NotFoundException(
        `No hay aulas activas del tipo requerido (${requiredClassroomType})`,
      );

    const TIME_BLOCKS = [
      { start: '14:00', end: '16:00' },
      { start: '16:00', end: '18:00' },
      { start: '18:00', end: '20:00' },
    ];

    const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

    const schedulesToSave: GroupSchedule[] = [];

    for (const group of groups) {
      if (!group.educator) {
        throw new NotFoundException(
          `El grupo ${group.groupName} no tiene educador asignado`,
        );
      }

      const educatorId = group.educator.id;
      let assigned = false;

      for (const day of DAYS) {
        for (const block of TIME_BLOCKS) {
          // 🔍 1. Verificar conflicto del educador
          const educatorConflict = await this.scheduleRepo.findOne({
            where: {
              dayOfWeek: day,
              startTime: block.start,
              group: {
                educator: { id: educatorId },
              },
            },
            relations: ['group', 'group.educator'],
          });

          if (educatorConflict) continue;

          // 🔍 2. Buscar aula libre
          let chosenClassroom: Classroom | null = null;

          for (const classroom of classrooms) {
            const roomConflict = await this.scheduleRepo.findOne({
              where: {
                dayOfWeek: day,
                startTime: block.start,
                classroom: { id: classroom.id },
              },
              relations: ['classroom'],
            });

            if (!roomConflict) {
              chosenClassroom = classroom;
              break;
            }
          }

          if (!chosenClassroom) continue;

          // 🎯 3. Crear horario
          const newSchedule = this.scheduleRepo.create({
            group,
            dayOfWeek: day,
            startTime: block.start,
            endTime: block.end,
            classroom: chosenClassroom,
          });

          schedulesToSave.push(newSchedule);
          assigned = true;
          break;
        }
        if (assigned) break;
      }

      if (!assigned) {
        throw new Error(
          `No hay horarios disponibles para el grupo ${group.groupName}`,
        );
      }
    }

    // Guardar todos los horarios
    await this.scheduleRepo.save(schedulesToSave);

    return {
      message: 'Horarios generados correctamente',
      programId,
      totalGroups: groups.length,
      schedulesCreated: schedulesToSave.length,

      schedules: schedulesToSave.map((s) => ({
        id: s.id,
        groupId: s.group.id,
        groupName: s.group.groupName,
        educator: s.group.educator?.id ?? 'SIN EDUCADOR',
        day: s.dayOfWeek,
        start: s.startTime,
        end: s.endTime,
        classroom: s.classroom?.name ?? 'SIN AULA',
        classroomType: s.classroom?.type ?? null,
      })),
    };
  }
}
