import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolUsuario } from "src/usuario/entity/usuario.entity";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {} // leer metadata de las rutas

  canActivate(context: ExecutionContext): boolean {
    // obtenemos los roles requeridos de la ruta
    const requiredRoles = this.reflector.get<RolUsuario[]>('roles', context.getHandler());

    if (!requiredRoles) {
      return true; // si no hay roles definidos, permitir acceso
    }

    // obtenemos el usuario de la request
    const { user } = context.switchToHttp().getRequest();

    // verificamos si el rol del usuario está en los roles permitidos
    if (!requiredRoles.includes(user.rol)) {
      throw new ForbiddenException('No tienes permisos para acceder a esta ruta');
    }

    return true; // usuario tiene rol permitido
  }
}
