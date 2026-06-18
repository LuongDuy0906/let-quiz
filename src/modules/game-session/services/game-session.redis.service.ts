import { InjectRedis } from "@nestjs-modules/ioredis";
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import Redis from "ioredis";
import { Types } from "mongoose";
import { GameSessionStatus, GameState } from "src/enum/gameSesstionStatus";
import { GameSettings } from '../dto/game-settings/game-settings.dto';

@Injectable()
export class GameSessionRedisService{
    constructor(
       @InjectRedis()
       private readonly redis: Redis
    ) {}

    async getGameSession(pin: string){
        const key: string = `game:room:${pin}:info`;
        const gameSessionData = await this.redis.get(key);

        return gameSessionData;
    }

    async initGameSession(hostId: string, quizId: string){
        const sessionId = new Types.ObjectId().toString();
        const pin = await this.generatePinned();

        const key = `game:room:${pin}:info`;

        const newGameSession = {
            _id: sessionId,
            pin: pin,
            hostId: new Types.ObjectId(hostId),
            status: GameSessionStatus.LOBBY,
            quizId: quizId,
            questionIndex: -1,
            gameSettings: {
                showLeaderboard: true,
                shuffleQuestions: false,
                shuffleOptions: false
            }
        }

        await this.redis.set(key, JSON.stringify(newGameSession), 'EX', 86400);

        return { pin, sessionId };
    }

    async updateGameSessionStatus(pin: string): Promise<GameSessionStatus>{
        const key: string = `game:room:${pin}:info`;
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
        const key = `game:room:${pin}:question`;

        await this.redis.set(key, JSON.stringify(questionInfo.question), 'EX', 86400);
        return;
    }

    async getQuestion(pin: string){
        const key = `game:room:${pin}:question`;
        return await this.redis.get(key);
    }

    async updateGameSessionQuestionIndex(pin: string){  
        const key: string = `game:room:${pin}:info`;
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

    async cleanUpFullRoom(roomPin: string) {
        const roomKey = `game:room:${roomPin}:info`;
        const playerKey = `game:room:${roomPin}:players`;
        const questionKey = `game:room:${roomPin}:question`;
        const leaderboardKey = `game:room:${roomPin}:leaderboard`;
        
        await Promise.all([
            this.redis.del(roomKey),
            this.redis.del(playerKey),
            this.redis.del(questionKey),
            this.redis.del(leaderboardKey)
        ])

        return;
    }

    async updateGameSessionSettings(userId: string, roomPin: string, newSettings: GameSettings){
        const rawGameSessionData = await this.getGameSession(roomPin);

        if(!rawGameSessionData){
            throw new NotFoundException('Phòng chơi không tồn tại')
        }

        const gameSessionData = JSON.parse(rawGameSessionData);

        if(gameSessionData.hostId !== userId){
            throw new ForbiddenException('Chỉ host mới được thay đổi cài đặt');
        }

        gameSessionData.gameSettings = newSettings;

        const key = `game:room:${roomPin}:info`;

        await this.redis.set(key, JSON.stringify(gameSessionData), 'EX', 86400);

        return;
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
        const key: string = `game:room:${pin}:info`;
        const result: number = await this.redis.exists(key); 

        return result == 1;
    }
}