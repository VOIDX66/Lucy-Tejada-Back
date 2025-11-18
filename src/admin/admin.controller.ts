import { Controller, Post, Req, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateEducatorDto } from './dto/createEducator.dto';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { JwtPayloadDto } from '../auth/dto/jwtPayload.dto';
import { ForbiddenException } from '@nestjs/common';
import type { Request } from 'express';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ===========================================
  // CREATE EDUCATOR
  // ===========================================

  @Post('educators')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear un nuevo profesor',
    description:
      'Crea un usuario con rol EDUCATOR y su perfil correspondiente. Solo ADMIN puede hacerlo.',
  })
  @ApiResponse({
    status: 201,
    description: 'Profesor creado correctamente.',
  })
  async createEducator(
    @Req() req: Request,
    @Body() dto: CreateEducatorDto,
    @CurrentUser() user: JwtPayloadDto, // usuario autenticado
  ) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('No tienes permisos para crear profesores');
    }
    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor || req.ip || 'unknown';

    return this.adminService.createEducator(dto, user.sub, ipAddress); // pasamos el adminId para auditoría
  }
}
