import {
  Controller,
  Patch,
  Param,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { JwtPayloadDto } from 'src/auth/dto/jwtPayload.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar datos personales del usuario',
    description:
      'Permite que un usuario autenticado actualice su propia información personal. Solo los administradores pueden editar a otros usuarios.',
  })
  @ApiBearerAuth() // indica que este endpoint requiere token JWT
  @ApiParam({
    name: 'id',
    description: 'UUID del usuario a modificar',
    example: '36d6f2c5-6e78-4d53-a51b-7d499738622a',
  })
  @ApiBody({
    description: 'Datos actualizables del usuario',
    type: UpdateUserDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Datos actualizados correctamente',
    schema: {
      example: {
        message: 'Datos actualizados correctamente',
        user: {
          id: '36d6f2c5-6e78-4d53-a51b-7d499738622a',
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          phone: '+57 3104567890',
          address: 'Cra 10 #15-20, Pereira',
          role: 'STUDENT',
          isActive: true,
          createdAt: '2025-10-23T15:00:00.000Z',
          lastLogin: '2025-11-01T20:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token no proporcionado o inválido',
  })
  @ApiResponse({
    status: 403,
    description: 'No autorizado para editar este perfil',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: Request,
  ) {
    // Leer token desde header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];
    let decoded: JwtPayloadDto;

    try {
      decoded = await this.jwtService.verifyAsync<JwtPayloadDto>(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const currentUserId = decoded.sub;
    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor || req.ip || 'unknown';

    return this.userService.updateProfile(id, currentUserId, dto, ipAddress);
  }
}
