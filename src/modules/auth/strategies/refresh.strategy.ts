import { Inject, Injectable } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthJwtPayload } from "../types/jwt-payload";
import refreshTokenConfig from "src/config/refresh-token.config";

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'refresh-jwt'){
    constructor(
        @Inject(refreshTokenConfig.KEY)
        private readonly refreshJwtConfiguration: ConfigType<typeof refreshTokenConfig>
    ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: refreshJwtConfiguration.secret as string,
        });
    }
    validate(payload: AuthJwtPayload): unknown {
        return {userId: payload.sub, phone: payload.username, role: payload.role};
    }

}