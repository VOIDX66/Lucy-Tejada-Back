import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { EducatorsService } from 'src/educators/educators.service';
import { CreateEducatorDto } from './dto/createEducator.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly educatorsService: EducatorsService,
  ) {}

  async createEducator(dto: CreateEducatorDto) {
    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) {
      throw new BadRequestException('El correo ya está registrado.');
    }

    // 1. Crear usuario base (role EDUCATOR)
    const user = await this.usersService.create({
      ...dto,
      role: 'EDUCATOR',
    });

    // 2. Crear perfil de educador
    const educator = await this.educatorsService.create(
      user.id,
      dto.specialization,
      dto.description,
    );

    return {
      message: 'Profesor creado exitosamente',
      user,
      educator,
    };
  }
}
