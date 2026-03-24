import { JwtService } from "@nestjs/jwt";
import { AuthJwtPayload } from "./types/jwt-payload";
import { User, UserDocument } from "../user/entities/user.entity";
import { Inject, Injectable } from "@nestjs/common";
import refreshTokenConfig from "src/config/refresh-token.config";
import type { ConfigType } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { RefreshPayload } from "./types/refresh-payload";

@Injectable()
export class TokenService{
    constructor(
        private readonly jwtService: JwtService,
        @Inject(refreshTokenConfig.KEY)
        private readonly refreshTokenService: ConfigType<typeof refreshTokenConfig>,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>
    ) {}

    async signToken(user: any){
        const accessPayload: AuthJwtPayload = {sub: String(user._id), username: user.profile?.username || user.username, role: user.role};
        const refreshPayload: RefreshPayload = {sub: String(user._id)};
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(accessPayload),
            this.jwtService.signAsync(refreshPayload, this.refreshTokenService)
        ])
        return {accessToken, refreshToken};
    }
}