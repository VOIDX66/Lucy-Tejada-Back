import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { JwtPayloadDto } from './dto/jwtPayload.dto';
import { AuditLogsService } from 'src/audit_logs/audit_logs.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private auditService: AuditLogsService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    // bcrypt.compare devuelve Promise<boolean>, tipado seguro
    const isMatch: boolean = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return null;

    return user;
  }

  async register(createUserDto: CreateUserDto, ipAddress: string) {
    const user = await this.usersService.create(createUserDto);
    // registrar en audit_logs
    await this.auditService.logAction({
      userId: user.id,
      action: 'REGISTER_USER',
      entity: 'Auth',
      ipAddress,
      result: 'Usuario Registrado',
    });
    return user;
  }

  async login(user: User, ipAddress: string) {
    const payload: JwtPayloadDto = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload);
    await this.usersService.updateLastLogin(user);

    await this.auditService.logAction({
      userId: user.id,
      action: 'LOGIN',
      entity: 'Auth',
      ipAddress,
      result: 'Inicio de sesion exitoso',
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role,
      },
    };
  }
}
