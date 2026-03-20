import { Inject, Injectable } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthJwtPayload } from "../types/jwt-payload";
import jwtConfig from "src/config/jwt.config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>
    ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConfiguration.secret as string,
        });
    }
    
    validate(payload: AuthJwtPayload): unknown {
        return {userId: payload.sub, phone: payload.username, role: payload.role};
    }

}