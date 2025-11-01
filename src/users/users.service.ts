import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { AuditLogsService } from 'src/audit_logs/audit_logs.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly saltRounds = 0;
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly auditService: AuditLogsService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException(
        'El correo electrónico ya está registrado.',
      );
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10); // Asumo 10 saltRounds

    const newUser = this.usersRepository.create({
      // Mapeo de DTO (snake_case) a Entidad (camelCase)
      email: createUserDto.email,
      // Mapeo explícito
      firstName: createUserDto.first_name,
      lastName: createUserDto.last_name,
      passwordHash: passwordHash,
      documentType: createUserDto.document_type,
      documentNumber: createUserDto.document_number,
      phone: createUserDto.phone,
      address: createUserDto.address,
      role: UserRole.STUDENT, // Usando el ENUM importado
    });
    return this.usersRepository.save(newUser);
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
  ) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Si el usuario no es admin y trata de editar otro perfil
    if (userId !== currentUserId)
      throw new ForbiddenException('No autorizado para editar este perfil');
    console.log(userId, currentUserId);

    const updatedUser = this.usersRepository.merge(user, dto);
    await this.usersRepository.save(updatedUser);

    // Registro de auditoría
    await this.auditService.logAction({
      userId: currentUserId,
      action: 'UPDATE_USER',
      entity: 'Users',
      ipAddress,
      result: 'Datos del usuario actualizado',
    });

    return { message: 'Datos actualizados correctamente', user: updatedUser };
  }
}
