import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { httpErrors } from 'src/shares/exceptions';
import { Role } from '../enum/admin.enum';

@Injectable()
export class OnlyMod implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const role = context.switchToHttp().getRequest()?.user?.role;
    if (role == Role.MOD) return true;
    else
      throw new HttpException(httpErrors.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
  }
}

@Injectable()
export class OnlyAdmin implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const role = context.switchToHttp().getRequest()?.user?.role;
    if (role == Role.ADMIN) return true;
    else throw new HttpException(httpErrors.UNAUTHORIZED, HttpStatus.FORBIDDEN);
  }
}

@Injectable()
export class AdminAndMod implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const role = context.switchToHttp().getRequest()?.user?.role;
    console.log(context.switchToHttp().getRequest());
    if (role == Role.ADMIN || role == Role.MOD) return true;
    else throw new HttpException(httpErrors.UNAUTHORIZED, HttpStatus.FORBIDDEN);
  }
}
