import { InjectRedis } from "@nestjs-modules/ioredis";
import { Injectable } from "@nestjs/common";
import Redis from "ioredis";
import * as crypto from 'crypto'

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

    async deleteToken(userId: string){
        const key = `refresh_token:${userId}`;

        await this.redis.del(key);
    }

    async creteResetPasswordToken(email: string): Promise<string>{
        const resetToken = crypto.randomBytes(32).toString('hex');

        const hashToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        const key = `reset_token:${email}`;

        await this.redis.set(key, resetToken, 'EX', 900);

        return resetToken;
    }
}