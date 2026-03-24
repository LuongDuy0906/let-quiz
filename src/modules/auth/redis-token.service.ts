import { InjectRedis } from "@nestjs-modules/ioredis";
import { Injectable } from "@nestjs/common";
import Redis from "ioredis";

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
}