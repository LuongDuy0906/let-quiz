import { plainToClass } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, validate } from "class-validator";
import { StringLiteral } from "typescript";

class EnvironmentVariables {
    @IsNotEmpty({message: 'MONGODB_URI không được để trống'})
    @IsString()
    MONGODB_URI: string;

    @IsNotEmpty({message: 'REDIS_URI không được để trống'})
    @IsString()
    REDIS_URI: string;

    @IsNotEmpty({message: 'SECRET_KEY không được để trống'})
    @IsString()
    SECRET_KEY: string;

    @IsNotEmpty({message: 'EXPIRED_IN không được để trống'})
    @IsString()
    EXPIRED_IN: string;

    @IsNotEmpty({message: 'REFRESH_JWT_SECRET không được để trống'})
    @IsString()
    REFRESH_JWT_SECRET: string;

    @IsNotEmpty({message: 'REFRESH_EXPIRED_IN không được để trống'})
    @IsString()
    REFRESH_EXPIRED_IN: string;

    @IsOptional()
    @IsString()
    GOOGLE_CLIENT_ID: string;

    @IsOptional()
    @IsString()
    GOOGLE_SECRET: string

    @IsOptional()
    @IsString()
    GOOGLE_CALLBACK_URL: string;

    @IsNotEmpty({message: 'MAIL_USER không được để trống'})
    @IsString()
    MAIL_USER: string;

    @IsNotEmpty({message: 'MAIL_PASSWORD không được để trống'})
    @IsString()
    MAIL_PASSWORD: string;

    @IsNotEmpty({message: 'CLOUDINARY_CLOUD_NAME không được để trống'})
    @IsString()
    CLOUDINARY_CLOUD_NAME: string;

    @IsNotEmpty({message: 'CLOUDINARY_API_KEY không được để trống'})
    @IsString()
    CLOUDINARY_API_KEY: string;

    @IsNotEmpty({message: 'CLOUDINARY_API_SECRET không được để trống'})
    @IsString()
    CLOUDINARY_API_SECRET: string;

    @IsOptional()
    @IsString()
    PORT: string;
}

export async function validateEnv(config: Record<string, any>): Promise<EnvironmentVariables> {
    const validateConfig = plainToClass(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });

    const errors = await validate(validateConfig, {
        skipMissingProperties: true
    });

    if(errors.length > 0){
        const errorsMessage = errors.map((error) => {
            return `${error.property}: ${Object.values(error.constraints || {}).join(', ')}`;
        })

        throw new Error(`lỗi khi xác thực cài đặt: \n${errorsMessage}`);
    }

    return validateConfig;
}