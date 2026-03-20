import { JwtService } from "@nestjs/jwt";
import { AuthJwtPayload } from "./types/jwt-payload";
import { User } from "../user/entities/user.entity";
import { Inject, Injectable } from "@nestjs/common";
import refreshTokenConfig from "src/config/refresh-token.config";
import type { ConfigType } from "@nestjs/config";

@Injectable()
export class TokenService{
    constructor(
        private readonly jwtService: JwtService,
        @Inject(refreshTokenConfig.KEY)
        private readonly refreshTokenService: ConfigType<typeof refreshTokenConfig>
    ) {}

    async signToken(user: User){
        const payload: AuthJwtPayload = {sub: String(user._id), username: user.username, role: user.role};
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(payload, this.refreshTokenService)
        ])
        return {accessToken, refreshToken};
    }

    async refreshToken(payload: AuthJwtPayload){
        return await this.jwtService.signAsync(payload);
    }
}