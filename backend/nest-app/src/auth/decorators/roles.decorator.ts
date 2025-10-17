import { SetMetadata } from "@nestjs/common";
import { RolUsuario } from "src/usuario/entity/usuario.entity";

export const Roles = (...roles: RolUsuario[]) => SetMetadata('roles', roles);
