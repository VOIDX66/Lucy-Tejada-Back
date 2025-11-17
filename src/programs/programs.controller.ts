import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  ForbiddenException,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from './dto/createProgram.dto';
import { UpdateProgramDto } from './dto/updateProgram.dto';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { JwtPayloadDto } from '../auth/dto/jwtPayload.dto';
import type { Request } from 'express';

@ApiTags('Programs')
@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

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
  findOne(@Param('id') id: string) {
    return this.programsService.findOne(id);
  }

  // ===========================================
  // UPDATE
  // ===========================================
  @Put(':id')
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
}
