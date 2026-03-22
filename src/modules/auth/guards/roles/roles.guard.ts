import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLE_KEY } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enum/userRole';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }
    
    let user = context.switchToHttp().getRequest().user;

    if(!user || !user.role){
      throw new ForbiddenException("Bạn không có quyền thực hiện hành động này");
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
        throw new ForbiddenException(`Chỉ có ${requiredRoles.join(', ')} mới được phép thực hiện hành động này`);
    }

    return true;
  }
}
