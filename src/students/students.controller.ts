import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  ForbiddenException,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { JwtPayloadDto } from '../auth/dto/jwtPayload.dto';
import { CreateStudentProfileDto } from './dto/createStudentProfile.dto';
import { UpdateStudentDto } from './dto/updateStudent.dto';
import { StudentsService } from '../students/students.service';
import { EnrollmentsService } from 'src/enrollments/enrollments.service';
import { EnrollStudentDto } from '../enrollments/dto/enrollStudent.dto';
import type { Request } from 'express';

@ApiTags('Students')
@Controller('students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/enrollments')
  @ApiOperation({
    summary: 'Inscribir estudiante en un programa',
    description:
      'Solo el estudiante puede inscribirse a sí mismo o ADMIN puede inscribir a cualquier estudiante. Requiere que el perfil del estudiante esté creado.',
  })
  @ApiBody({ type: EnrollStudentDto })
  @ApiResponse({ status: 201, description: 'Inscripción exitosa' })
  @ApiResponse({
    status: 400,
    description: 'El estudiante ya está inscrito o no hay cupos disponibles',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para inscribir a este estudiante',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario estudiante o programa no encontrado',
  })
  async enrollInProgram(
    @Param('id', ParseUUIDPipe) userId: string,
    @CurrentUser() user: JwtPayloadDto,
    @Body() dto: EnrollStudentDto,
    @Req() req: Request,
  ) {
    // Control de permisos
    if (user.role !== 'ADMIN' && user.sub !== userId) {
      throw new ForbiddenException(
        'No tienes permisos para inscribir a este estudiante',
      );
    }

    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor || req.ip || 'unknown';

    return this.enrollmentsService.enrollInProgram(
      userId,
      dto.programId,
      user.sub,
      ipAddress,
    );
  }

  @Post(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear perfil del estudiante' })
  @ApiResponse({ status: 201, description: 'Perfil creado correctamente' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o ya existe un perfil',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para crear este perfil',
  })
  async createProfile(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: CreateStudentProfileDto,
    @CurrentUser() user: JwtPayloadDto,
    @Req() req: Request,
  ) {
    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor || req.ip || 'unknown';

    return this.studentsService.createStudentProfile(
      userId,
      dto,
      user.sub,
      ipAddress,
    );
  }

  // -------------------------------
  // Actualizar perfil
  // -------------------------------

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':userId/update')
  @ApiOperation({ summary: 'Actualizar perfil del estudiante' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado correctamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para actualizar este perfil',
  })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  async updateProfile(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateStudentDto,
    @CurrentUser() user: JwtPayloadDto,
    @Req() req: Request,
  ) {
    // Control de permisos: solo ADMIN o el mismo estudiante
    if (user.role !== 'ADMIN' && user.sub !== userId) {
      throw new ForbiddenException(
        'No tienes permisos para actualizar este perfil',
      );
    }

    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor || req.ip || 'unknown';

    return this.studentsService.updateStudentProfile(
      userId,
      dto,
      user.sub,
      ipAddress,
    );
  }
}
