import { Inject, Injectable } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import googleOauthConfig from "src/config/google-oauth.config";
import { AuthService } from "../auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy){
    constructor(
        @Inject(googleOauthConfig.KEY)
        private readonly googleConfig: ConfigType<typeof googleOauthConfig>,
        private readonly authService: AuthService
    ){
        super({
            clientID: googleConfig.clientId as any,
            clientSecret: googleConfig.clientSecret as any,
            callbackURL: googleConfig.callbackURL,
            scope: ["email", "profile"]
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
        console.log(profile);
        const user = await this.authService.validateGoogleUser({
            email: profile.emails[0].value,
            password: ""
        });
        done(null, user);
    }
}