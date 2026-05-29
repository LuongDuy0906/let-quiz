import { ROLE_KEY } from './../../../decorators/roles.decorator';
import { InjectRedis } from "@nestjs-modules/ioredis";
import { Injectable, NotFoundException } from "@nestjs/common";
import Redis from "ioredis";
import { Types } from "mongoose";
import { CreateGameSessionDto } from "../dto/create-game-session.dto";
import { GameSessionStatus, GameState } from "src/enum/gameSesstionStatus";

@Injectable()
export class GameSessionRedisService{
    constructor(
       @InjectRedis()
       private readonly redis: Redis
    ) {}

    async getGameSession(pin: string){
        const key: string = `game:room:${pin}:info`;
        const gameSessionData = await this.redis.get(key);

        if(!gameSessionData){
            throw new NotFoundException("Game session not found");
        }

        return gameSessionData;
    }

    async getPin(sessionId: string){
        const key = `game:session_id:${sessionId}`;
        const pin = await this.redis.get(key);

        return pin;
    }

    async initGameSession(hostId: string, quizId: string){
        const sessionId = new Types.ObjectId().toString();
        const pin = await this.generatePinned();

        const key = `game:room:${pin}:info`;
        const aliasKey = `game:session_id:${sessionId}`;

        const newGameSession = {
            _id: sessionId,
            pin: pin,
            hostId: new Types.ObjectId(hostId),
            status: GameSessionStatus.LOBBY,
            quizId: quizId,
            questionIndex: -1,
        }

        await this.redis.set(key, JSON.stringify(newGameSession), 'EX', 86400);
        await this.redis.set(aliasKey, pin, 'EX', 86400);

        return { pin, sessionId };
    }

    async updateGameSessionStatus(pin: string): Promise<GameSessionStatus>{
        const key: string = `game:room:${pin}:infor`;
        const sessionData = await this.redis.get(key);
        
        if(!sessionData){
            throw new NotFoundException("Game session not found");
        }

        const gameSessionData = JSON.parse(sessionData);
       
        const currentStatus: GameSessionStatus = (gameSessionData.status || GameSessionStatus.LOBBY) as GameSessionStatus;

        const currentStatusIndex = GameState.indexOf(currentStatus);

        if(currentStatusIndex === GameState.length - 1){
            return currentStatus;
        }

        const newStatus = GameState[currentStatusIndex + 1];

        gameSessionData.status = newStatus;
        await this.redis.set(key, JSON.stringify(gameSessionData), 'EX', 86400);

        return newStatus;
    }

    async saveQuestion(pin: string, questionInfo: any){
        const key = `game:room:${pin}:Question`;

        await this.redis.set(key, JSON.stringify(questionInfo.question), 'EX', 86400);
    }

    async getQuestion(pin: string){
        const key = `game:room:${pin}:Question`;
        return await this.redis.get(key);
    }

    async updateGameSessionQuestionIndex(pin: string){  
        const key: string = `game:room:${pin}:infor`;
        const sessionData = await this.redis.get(key);

        if(!sessionData){
            throw new NotFoundException("Game session not found");
        }

        const gameSessionData = JSON.parse(sessionData);
        const currentQuestionIndex: number = gameSessionData.questionIndex;
        const newIndex: number = currentQuestionIndex + 1;
        gameSessionData.questionIndex = newIndex;

        await this.redis.set(key, JSON.stringify(gameSessionData), 'EX', 86400);

        return newIndex;
    }

    async verifyPin(pin: string) {
      const key = `game:room:${pin}:infor`;

      const rawRoomData = await this.redis.get(key);

      if(!rawRoomData){
        throw new NotFoundException('Mã PIN không tồn tại');
      }

      const roomData = JSON.parse(rawRoomData);
      const roomSessionId = roomData.sessionId;

      return roomSessionId;
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