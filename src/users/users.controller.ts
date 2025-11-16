import { Controller, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
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
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { JwtPayloadDto } from '../auth/dto/jwtPayload.dto';
import type { Request } from 'express';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar datos personales del usuario',
    description:
      'El propio usuario puede modificar sus datos. El administrador puede modificar a cualquiera.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del usuario que se desea modificar',
    example: '36d6f2c5-6e78-4d53-a51b-7d499738622a',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Datos a actualizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos actualizados correctamente',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuario sin permisos para realizar esta acción',
  })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: Request,
    @CurrentUser() user: JwtPayloadDto,
  ) {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';

    return this.userService.updateProfile(
      id, // usuario a editar
      user.sub, // usuario autenticado
      dto,
      ipAddress,
      user.role, // rol del usuario autenticado
    );
  }
}
