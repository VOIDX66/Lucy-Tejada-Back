import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  ForbiddenException,
  HttpCode,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from './dto/createProgram.dto';
import { UpdateProgramDto } from './dto/updateProgram.dto';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { JwtPayloadDto } from '../auth/dto/jwtPayload.dto';
import { GenerateGroupsDto } from './dto/generateGroups.dto';
import { GroupsService } from '../groups/groups.service';
import { SchedulingService } from 'src/scheduling/scheduling.service';
import type { Request } from 'express';

export interface RequestWithUser extends Request {
  user: JwtPayloadDto;
}

@ApiTags('Programs')
@Controller('programs')
export class ProgramsController {
  constructor(
    private readonly programsService: ProgramsService,
    private readonly groupsService: GroupsService,
    private readonly schedulingService: SchedulingService,
  ) {}

  // ===========================================
  // CREATE
  // ===========================================
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear un programa',
    description: 'Solo un ADMIN puede crear programas.',
  })
  @ApiBody({ type: CreateProgramDto })
  async create(
    @Req() req: Request,
    @Body() dto: CreateProgramDto,
    @CurrentUser() user: JwtPayloadDto,
  ) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('No tienes permisos para crear programas');
    }

    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor || req.ip || 'unknown';

    return this.programsService.create(dto, user.sub, ipAddress);
  }

  // ===========================================
  // FIND ALL
  // ===========================================
  @Get()
  @ApiOperation({ summary: 'Listar programas' })
  findAll() {
    return this.programsService.findAll();
  }

  // ===========================================
  // FIND ONE
  // ===========================================
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un programa por ID' })
  @ApiParam({ name: 'id', description: 'UUID del programa' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.programsService.findOne(id);
  }

  // ---------------------------------------------------------
  //  ASSIGN EDUCATOR TO PROGRAM
  // ---------------------------------------------------------
  @UseGuards(JwtAuthGuard)
  @Post(':programId/educators/:educatorId')
  async assignEducatorToProgram(
    @Param('programId', new ParseUUIDPipe()) programId: string,
    @Param('educatorId', new ParseUUIDPipe()) educatorId: string,
    @Req() req: Request,
    @CurrentUser() user: JwtPayloadDto,
  ) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'No tienes permisos para asignar educadores a programas',
      );
    }
    const ipAddress = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    return this.programsService.assignEducatorToProgram(
      programId,
      educatorId,
      user.sub,
      ipAddress as string,
    );
  }

  // ---------------------------------------------------------
  //  GET EDUCATOR BY PROGRAM
  // ---------------------------------------------------------

  @Get(':id/educators')
  @ApiOperation({ summary: 'Listar educadores asignados a un programa' })
  @ApiBearerAuth()
  getProgramEducators(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.programsService.getEducatorsByProgram(id);
  }

  // ---------------------------------------------------------
  //  DELETE EDUCATOR FROM ONE PROGRAM
  // ---------------------------------------------------------
  @UseGuards(JwtAuthGuard)
  @Delete(':programId/educators/:educatorId')
  async removeEducatorFromProgram(
    @Param('programId', new ParseUUIDPipe()) programId: string,
    @Param('educatorId', new ParseUUIDPipe()) educatorId: string,
    @Req() req: Request,
    @CurrentUser() user: JwtPayloadDto,
  ) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'No tienes permisos para eliminar educadores de programas',
      );
    }
    const ipAddress = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    return this.programsService.removeEducatorFromProgram(
      programId,
      educatorId,
      user.sub,
      ipAddress as string,
    );
  }

  // ===========================================
  // UPDATE
  // ===========================================
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar un programa',
    description: 'Solo un ADMIN puede actualizar programas.',
  })
  @ApiBody({ type: UpdateProgramDto })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateProgramDto,
    @CurrentUser() user: JwtPayloadDto,
  ) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'No tienes permisos para actualizar programas',
      );
    }

    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor || req.ip || 'unknown';

    return this.programsService.update(id, dto, user.sub, ipAddress);
  }

  // ===========================================
  // DELETE
  // ===========================================
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar un programa',
    description: 'Solo un ADMIN puede eliminar programas.',
  })
  @HttpCode(204)
  async remove(
    @Req() req: Request,
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadDto,
  ) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'No tienes permisos para eliminar programas',
      );
    }

    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor || req.ip || 'unknown';

    await this.programsService.remove(id, user.sub, ipAddress);
  }

  // ===========================================
  // Generate Groups
  // ===========================================

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':programId/generate_groups')
  @ApiOperation({ summary: 'Generar grupos automáticamente para un programa' })
  @ApiBody({ type: GenerateGroupsDto })
  @ApiResponse({ status: 200, description: 'Grupos generados correctamente' })
  @ApiResponse({ status: 400, description: 'Error en la generación' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  async generateGroups(
    @Param('programId', ParseUUIDPipe) programId: string,
    @Body() dto: GenerateGroupsDto,
    @CurrentUser() user: JwtPayloadDto,
    @Req() req: Request,
  ) {
    // solo ADMIN por ahora (o cambiar según roles)
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('No tienes permisos para generar grupos');
    }

    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor || req.ip || 'unknown';

    return this.groupsService.createGroupsForProgram(
      programId,
      user.sub,
      ipAddress,
      {
        groupCapacity: dto.groupCapacity,
        namePrefix: dto.namePrefix,
      },
    );
  }

  // ===========================================
  // get Enrollments Count
  // ===========================================

  @Get(':programId/enrollments/count')
  @ApiOperation({
    summary: 'Obtiene la cantidad de inscripciones de un programa',
    description:
      'Devuelve el número total de estudiantes inscritos en el programa, separado por estado (ACTIVE, COMPLETED, CANCELLED).',
  })
  @ApiParam({
    name: 'programId',
    description: 'UUID del programa',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Conteo de inscripciones del programa',
    schema: {
      example: {
        programId: 'd47c627f-d2dd-4e02-8ccf-387b2405a912',
        totalEnrollments: 41,
        activeEnrollments: 39,
        completedEnrollments: 2,
        cancelledEnrollments: 0,
      },
    },
  })
  async getEnrollmentCount(@Param('programId') programId: string) {
    return this.programsService.getEnrollmentCount(programId);
  }
}
