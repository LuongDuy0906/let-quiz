import { Injectable } from "@nestjs/common";
import { CreatePlayerRecordDto } from "../dto/create-player-record.dto";
import Redis from "ioredis";
import { InjectRedis } from "@nestjs-modules/ioredis";
import { PlayerAnswerDto } from "../dto/save-player-answer.dto";

@Injectable()
export class PlayerRecordRedisService {
    constructor(
        @InjectRedis()
        private readonly redis: Redis
    ) {}

    async addNewPlayer(playerInfo: CreatePlayerRecordDto, clientId: string, hostId: string) {
        const key = `game:room:${playerInfo.roomPin}:players`;
        const isHost = (playerInfo.userId && playerInfo.userId === hostId) ? true : false;

        const newPlayer = {
            _id: clientId,
            name: playerInfo.name,
            avatar: playerInfo.avatar,
            isHost: isHost
        };

        await this.redis.hset(key, clientId, JSON.stringify(newPlayer));
        await this.redis.expire(key, 86400);
        return isHost;
    }

    async leaveRoom(clientId: string, roomPin: string) {
        const key = `game:room:${roomPin}:players`;
        const leaderboardKey = `game:room:${roomPin}:leaderboard`;

        await this.redis.hdel(key, clientId);
        await this.redis.zrem(leaderboardKey, clientId); 
    }

    async playerList(pin: string) {
        const key = `game:room:${pin}:players`;
        const rawPlayersList = await this.redis.hvals(key);
        
        return rawPlayersList.map(player => JSON.parse(player));
    }

    async addLeaderboard(pin: string, clientId: string, score: number) {
        const key = `game:room:${pin}:leaderboard`;
        await this.redis.zincrby(key, score, clientId);
        await this.redis.expire(key, 86400);
    }

    async getLeaderboard(pin: string, topN: number) {
        const leaderboardKey = `game:room:${pin}:leaderboard`;
        const playersKey = `game:room:${pin}:players`;
        const leaderboard = await this.redis.zrevrange(leaderboardKey, 0, topN - 1, 'WITHSCORES');

        let leaderboardData: any[] = [];
        for (let i = 0; i < leaderboard.length; i += 2) {
            const clientId = leaderboard[i];
            const score = parseInt(leaderboard[i + 1], 10);
            const playerData = await this.redis.hget(playersKey, clientId);
            if (playerData) {
                const { name, avatar, isHost } = JSON.parse(playerData);
                if (isHost) continue;
                
                leaderboardData.push({
                    clientId,
                    name,
                    avatar,
                    score
                });
            }
        }
        return leaderboardData;
    }

    async playerAnswer(playerAnswerInfo: PlayerAnswerDto & { score: number, isCorrect: boolean }, roomPin: string, clientId: string) {
        const key = `game:room:${roomPin}:answer:${playerAnswerInfo.questionId}`;

        const answerPayload = {
            answerId: playerAnswerInfo.answerId,
            score: playerAnswerInfo.score,
            isCorrect: playerAnswerInfo.isCorrect,
        };

        await this.redis.hset(key, clientId, JSON.stringify(answerPayload));
        await this.redis.expire(key, 86400);

        if (playerAnswerInfo.score > 0) {
            await this.addLeaderboard(roomPin, clientId, playerAnswerInfo.score);
        }
    }

    async getCurrentAnswerCount(roomPin: string, questionId: string) {
        const key = `game:room:${roomPin}:answer:${questionId}`;
        return this.redis.hlen(key);
    }

    async getAllPlayersAnswer(roomPin: string, clientId: string){
        const playerAnswersKey = `game:room:${roomPin}:answer:${clientId}`;

        return await this.redis.hgetall(playerAnswersKey);
    }
}