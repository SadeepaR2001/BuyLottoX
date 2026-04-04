// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
// import { Reflector } from '@nestjs/core'
// import { ROLES_KEY } from '../decorators/roles.decorator'

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}

//   canActivate(ctx: ExecutionContext): boolean {
//     const roles = this.reflector.getAllAndOverride<Array<'USER' | 'ADMIN'>>(ROLES_KEY, [
//       ctx.getHandler(),
//       ctx.getClass(),
//     ])
//     if (!roles || roles.length === 0) return true
//     const req = ctx.switchToHttp().getRequest()
//     const user = req.user as { role?: 'USER' | 'ADMIN' } | undefined
//     return !!user?.role && roles.includes(user.role)
//   }
// }
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user) {
      throw new ForbiddenException('User not found in request')
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Access denied')
    }

    return true
  }
}