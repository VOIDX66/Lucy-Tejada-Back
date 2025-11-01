import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsUUID, IsNotEmpty } from 'class-validator';

export class JwtPayloadDto {
  @ApiProperty({ description: 'ID de usuario (subject)' })
  @IsUUID() // o @IsNumberString() o @IsNumber()
  @IsNotEmpty()
  sub: string; // o number

  /**
   * El email del usuario, usado para identificación.
   */
  @ApiProperty({
    description: 'Email del usuario',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Rol del usuario', example: 'admin' })
  @IsString()
  @IsNotEmpty()
  role: string;
}
