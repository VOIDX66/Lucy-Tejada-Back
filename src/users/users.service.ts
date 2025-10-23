import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly saltRounds = 0;
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { lastLogin: new Date() });
  }
}
