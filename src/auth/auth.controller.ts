import {
  Controller,
  Post,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { User } from 'src/users/entities/user.entity';
import { omitPassword } from 'src/common/utils/omitPassword';
import type { Request } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ======================================================
  // REGISTRO DE USUARIO
  // ======================================================
  @Post('register')
  @ApiOperation({
    summary: 'Registro de nuevo usuario',
    description:
      'Permite registrar un nuevo usuario en la plataforma y devuelve su información sin exponer la contraseña.',
  })
  @ApiCreatedResponse({
    description: 'Usuario registrado correctamente',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o usuario ya existente',
    schema: {
      example: {
        statusCode: 400,
        message: 'El correo electrónico ya está registrado',
        error: 'Bad Request',
      },
    },
  })
  async register(
    @Req() req: Request,
    @Body() createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor || req.ip || 'unknown';
    const user = await this.authService.register(createUserDto, ipAddress);
    return omitPassword(user);
  }

  // ======================================================
  // LOGIN DE USUARIO
  // ======================================================
  @Post('login')
  @ApiOperation({
    summary: 'Inicio de sesión de usuario',
    description:
      'Valida las credenciales y genera un token JWT con la información básica del usuario autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'a52f8cb9-70e7-4b61-b84b-3afc6a43b8a1',
          email: 'nuevo.usuario@example.com',
          firstName: 'Carlos',
          lastName: 'Mora',
          role: 'EDUCATOR',
          isActive: true,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciales incorrectas',
    schema: {
      example: {
        statusCode: 401,
        message: 'Credenciales inválidas',
        error: 'Unauthorized',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Datos incompletos o inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'El campo email no debe estar vacío',
          'El campo password no debe estar vacío',
        ],
        error: 'Bad Request',
      },
    },
  })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor || req.ip || 'unknown';
    const token = await this.authService.login(user, ipAddress);

    return {
      access_token: token.access_token,
      user: omitPassword(user),
    };
  }
}
