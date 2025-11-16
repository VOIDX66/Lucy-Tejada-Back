import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayloadDto } from '../dto/jwtPayload.dto';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayloadDto | null => {
    const request = ctx.switchToHttp().getRequest<Request>();

    return request.user as JwtPayloadDto | null;
  },
);
