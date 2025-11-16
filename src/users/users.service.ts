import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { AuditLogsService } from 'src/audit_logs/audit_logs.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

interface PostgresError extends Error {
  code?: string;
  detail?: string;
}

@Injectable()
export class UsersService {
  private readonly saltRounds = 0;
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly auditService: AuditLogsService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Validación manual del email (puedes mantenerla si quieres mensajes más personalizados)
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException(
        'El correo electrónico ya está registrado.',
      );
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const newUser = this.usersRepository.create({
      email: createUserDto.email,
      firstName: createUserDto.first_name,
      lastName: createUserDto.last_name,
      passwordHash,
      documentType: createUserDto.document_type,
      documentNumber: createUserDto.document_number,
      phone: createUserDto.phone,
      address: createUserDto.address,
      role: UserRole.STUDENT,
    });

    try {
      return await this.usersRepository.save(newUser);
    } catch (err) {
      // CASO: Violaciones UNIQUE (error 23505)
      const error = err as PostgresError;
      if (error.code === '23505') {
        if (error.detail?.includes('document_number')) {
          throw new BadRequestException(
            'El número de documento ya está registrado.',
          );
        }
        if (error.detail?.includes('email')) {
          throw new BadRequestException(
            'El correo electrónico ya está registrado.',
          );
        }
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user ?? null;
  }

  async updateLastLogin(User: User): Promise<void> {
    await this.usersRepository.update(User.id, { lastLogin: new Date() });
  }

  async updateProfile(
    userId: string,
    currentUserId: string,
    dto: UpdateUserDto,
    ipAddress: string,
    currentUserRole: string,
  ) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Validación de permisos
    const isSameUser = userId === currentUserId;
    const isAdmin = currentUserRole === 'ADMIN';

    if (!isSameUser && !isAdmin) {
      throw new ForbiddenException(
        'No tienes permisos para modificar este usuario',
      );
    }

    // Aplicar cambios
    const updatedUser = this.usersRepository.merge(user, dto);

    try {
      const savedUser = await this.usersRepository.save(updatedUser);

      // Registro de auditoría
      await this.auditService.logAction({
        userId: currentUserId,
        action: 'UPDATE_USER',
        entity: 'Users',
        ipAddress,
        result: 'Datos del usuario actualizados',
      });

      return {
        message: 'Datos actualizados correctamente',
        user: savedUser,
      };
    } catch (err) {
      // Manejo de errores de Postgres por UNIQUE
      const error = err as PostgresError;
      if (error.code === '23505') {
        if (error.detail?.includes('document_number')) {
          throw new BadRequestException(
            'El número de documento ya está registrado.',
          );
        }
        if (error.detail?.includes('email')) {
          throw new BadRequestException(
            'El correo electrónico ya está registrado.',
          );
        }
      }
      throw error;
    }
  }
}
