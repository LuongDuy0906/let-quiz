import { InjectRedis } from "@nestjs-modules/ioredis";
import { Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { Types } from "mongoose";
import { RequestPayload } from "src/modules/auth/types/request-payload";

@Injectable()
export class GameSessionRedisService{
    constructor(
       @InjectRedis()
       private readonly redis: Redis
    ) {}

    async getGameSession(pin: string){
        const key: string = `game:room:${pin}:infor`;

        return await this.redis.get(key);
    }

    async initGameSession(hostId: string, quizId: string){
        const sessionId = new Types.ObjectId().toString();
        const pin = await this.generatePinned();

        const key = `game:room:${pin}:infor`;

        const newGameSession = {
            _id: sessionId,
            pin: pin,
            hostId: new Types.ObjectId(hostId),
            status: "LOBBY"
        }

        await this.redis.set(key, JSON.stringify(newGameSession), 'EX', 86400);

        return { pin, sessionId };
    }

    async generatePinned(): Promise<string> {
        let pin: string = "";
        let isPinUsed = true;

        while(isPinUsed){
        pin = Math.floor(100000 + Math.random() * 900000).toString();
        const isExist = await this.checkRoomPin(pin);
        if(!isExist){
            isPinUsed = false;
        }
        }

        return pin;
    }

    async checkRoomPin(pin: string): Promise<boolean>{
        const key: string = `game:room:${pin}:infor`;
        const result: number = await this.redis.exists(key); 

        return result == 1;
    }
}