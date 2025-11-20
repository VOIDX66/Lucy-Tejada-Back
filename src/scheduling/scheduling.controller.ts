// src/scheduling/scheduling.controller.ts
import {
  Controller,
  Post,
  Param,
  Body,
  //Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { SchedulingService } from './scheduling.service';
import { GenerateSchedulesDto } from './dto/generatedSchedules.dto';
import type { Request } from 'express';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { JwtPayloadDto } from '../auth/dto/jwtPayload.dto';

@ApiTags('Scheduling')
@Controller('scheduling')
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Post('programs/:id/generate')
  @UseGuards(JwtAuthGuard) // O agregar guard que permita solo ADMIN si quieres
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generar horarios automáticos para un programa' })
  @ApiBody({ type: GenerateSchedulesDto })
  @ApiResponse({ status: 201, description: 'Horarios generados' })
  async generateForProgram(
    @Param('id', ParseUUIDPipe) programId: string,
    @CurrentUser() user: JwtPayloadDto,
    //@Body() dto: GenerateSchedulesDto,
    //@Req() req: Request,
  ) {
    // opcional: permitir solo ADMIN
    if (user.role !== 'ADMIN') {
      // si quieres restringir a admins: descomenta
      // throw new ForbiddenException('Solo ADMIN puede generar horarios');
    }

    //const forwardedFor = req.headers['x-forwarded-for'];
    //const ipAddress = Array.isArray(forwardedFor)
    //  ? forwardedFor[0]
    //  : forwardedFor || req.ip || 'unknown';

    return this.schedulingService.generateSchedulesForProgram(
      programId,
      //user.sub,
      //ipAddress,
      //dto,
    );
  }
}
