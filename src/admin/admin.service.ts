import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { EducatorsService } from 'src/educators/educators.service';
import { CreateEducatorDto } from './dto/createEducator.dto';
import { AuditLogsService } from 'src/audit_logs/audit_logs.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly educatorsService: EducatorsService,
    private readonly auditService: AuditLogsService,
  ) {}

  async createEducator(
    dto: CreateEducatorDto,
    adminId: string,
    ipAddress: string,
  ) {
    // Validar email único
    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) {
      throw new BadRequestException('El correo ya está registrado.');
    }

    // 1. Crear usuario base (rol EDUCATOR)
    const user = await this.usersService.create({
      ...dto,
      role: 'EDUCATOR',
    });

    // 2. Crear perfil de educator
    const educator = await this.educatorsService.create(
      user.id,
      dto.specialization,
      dto.description,
    );

    // 3. Registrar auditoría
    await this.auditService.logAction({
      userId: adminId, // quien creó al profesor
      action: 'CREATE_EDUCATOR',
      entity: 'Users/Educator',
      ipAddress,
      result: `Profesor ${user.id} creado correctamente`,
    });

    return { user, educator };
  }
}
