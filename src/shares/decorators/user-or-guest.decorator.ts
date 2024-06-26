import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import jwtDecode from 'jwt-decode';
import { IJwtPayload } from 'src/modules/auth/interfaces/payload.interface';
import { httpErrors } from 'src/shares/exceptions';

export const UserOrGuest = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    try {
      const token = request.headers.authorization;
      if (!token || (token && (jwtDecode(token) as any).role)) {
        return null;
      }
      const payload: IJwtPayload = jwtDecode(token);
      return payload.id;
    } catch (e) {
      console.log('111111111', { e });
      throw new HttpException(httpErrors.UNAUTHORIZED, HttpStatus.BAD_REQUEST);
    }
  },
);
