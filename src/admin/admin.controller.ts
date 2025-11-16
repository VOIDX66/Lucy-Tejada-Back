import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateEducatorDto } from './dto/createEducator.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('educators')
  @ApiOperation({
    summary: 'Crear un nuevo profesor',
    description:
      'Crea un usuario con rol EDUCATOR y su perfil correspondiente.',
  })
  @ApiResponse({
    status: 201,
    description: 'Profesor creado correctamente.',
  })
  async createEducator(@Body() dto: CreateEducatorDto) {
    return this.adminService.createEducator(dto);
  }
}
