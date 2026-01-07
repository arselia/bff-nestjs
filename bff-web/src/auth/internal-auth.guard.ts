
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class InternalAuthGuard implements CanActivate {
  constructor() {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const secretFromHeader = request.headers['x-internal-secret'];
    const secretFromEnv = process.env.INTERNAL_SECRET_KEY;

    // Fail safely: The secret must exist in the env AND match the header.
    if (!secretFromEnv || secretFromHeader !== secretFromEnv) {
      throw new UnauthorizedException('Invalid internal secret');
    }

    return true;
  }
}
