import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(config: ConfigService) {
        super({
            secretOrKey: config.getOrThrow('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false, // validar expiracao do token
        });
    }

    async validate(payload: any) { // payload eh o token extraido da requisicao validado com a chave e garantido que nao esta expirado
        return { userId: payload.sub, email: payload.email }; // metodo para validacao adicional se tiver regra de negocio 
    }
}