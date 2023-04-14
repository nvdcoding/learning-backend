import {
  Injectable,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { firstValueFrom, isObservable } from 'rxjs';
import { AdminService } from 'src/modules/admin/admin.service';
import { Role } from 'src/shares/enum/admin.enum';
import { httpErrors } from 'src/shares/exceptions';

@Injectable()
export class IsLoginAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { headers } = request;
    if (!headers?.authorization) {
      throw new HttpException(httpErrors.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
    const token = headers.authorization.split(' ');
    if (token.length < 2 || token[0] != 'Bearer') {
      throw new HttpException(httpErrors.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
    const result = super.canActivate(context);
    if (isObservable(result)) {
      return firstValueFrom(result);
    } else {
      return result;
    }
  }
}