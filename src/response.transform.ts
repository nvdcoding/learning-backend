import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';

class BaseResponse<T> {
  statusCode: number;
  returnValue: T;
  meta: any;
}

@Injectable()
export class ResponseTransform<T>
  implements NestInterceptor<T, BaseResponse<T>>
{
  intercept(context: ExecutionContext, next: CallHandler<T>) {
    return next.handle().pipe(
      map((data) => {
        const baseResponse = new BaseResponse<any>();
        baseResponse.statusCode = 200;
        baseResponse.returnValue = data;
        return baseResponse;
      }),
    );
  }
}
