import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt'){
    //Este guard hereda o extiende el guard predeterminado de passport, configurado con la estrategia 'jwt'
    //Esto significa que protegerá las rutas verificando los tokens JWT válidos
}