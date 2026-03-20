import { registerAs } from "@nestjs/config";
import { JwtModuleOptions } from "@nestjs/jwt";

export default registerAs('jwt', (): JwtModuleOptions => ({
    secret: process.env.SECRET_KEY,
    signOptions: {
        expiresIn:process.env.EXPIRED_IN as any
    }
}))