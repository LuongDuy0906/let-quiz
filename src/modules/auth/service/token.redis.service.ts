import { InjectRedis } from "@nestjs-modules/ioredis";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import Redis from "ioredis";
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RedisTokenService{
    constructor(
        @InjectRedis()
        private readonly redis: Redis
    ) {}

    async saveRedisToken(userId: string, token: string, days: number){
        const key = `refresh_token:${userId}`;

        const ttlInSecond = days * 24 * 60 * 60;

        await this.redis.set(key, token, 'EX', ttlInSecond);
    }

    async getRefreshToken(userId: string){
        const key = `refresh_token:${userId}`;

        return await this.redis.get(key);
    }

    async deleteToken(key: string){;
        await this.redis.del(key);
    }

    async creteResetPasswordToken(email: string): Promise<string>{
        const resetToken = crypto.randomBytes(32).toString('hex');

        const hashToken = bcrypt.hashSync(resetToken, 10);

        const key = `reset_token:${email}`;

        await this.redis.set(key, hashToken, 'EX', 900);

        return resetToken;
    }

    async validateToken(email: string, token: string){
        const key = `reset_token:${email}`;

        const hashToken = await this.redis.get(key);

        if(!hashToken){
            return false;
        }

        const isMatch = await bcrypt.compare(token, hashToken);

        return isMatch
    }
}