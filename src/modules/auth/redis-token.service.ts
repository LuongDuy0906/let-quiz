import { InjectRedis } from "@nestjs-modules/ioredis";
import { Injectable, OnModuleInit } from "@nestjs/common";
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
}