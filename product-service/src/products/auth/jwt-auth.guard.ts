import { Injectable, ExecutionContext, ForbiddenException, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // super.canActivate() will trigger the JWT validation
    // If the token is invalid, it throws an UnauthorizedException
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    // This method is called after the token has been successfully validated
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, authentication is sufficient
    if (!requiredRoles) {
      return user;
    }

    // Check if the user has the required role
    if (!user || !requiredRoles.some((role) => user.role?.toLowerCase() === role.toLowerCase())) {
      throw new ForbiddenException('Akses ditolak, role tidak sesuai');
    }

    return user;
  }
}
