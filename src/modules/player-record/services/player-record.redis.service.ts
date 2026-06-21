import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CreatePlayerRecordDto } from "../dto/create-player-record.dto";
import Redis from "ioredis";
import { InjectRedis } from "@nestjs-modules/ioredis";
import { PlayerAnswerDto } from "../dto/save-player-answer.dto";
import { Type } from "class-transformer";
import { Types } from "mongoose";

@Injectable()
export class PlayerRecordRedisService {
    constructor(
        @InjectRedis()
        private readonly redis: Redis
    ) {}

    async addNewPlayer(playerInfo: CreatePlayerRecordDto, clientId: string, hostId: string) {
        const key = `game:room:${playerInfo.roomPin}:players`;
        const isHost = (playerInfo.userId && playerInfo.userId === hostId) ? true : false;

        const playerId = playerInfo.userId ? new Types.ObjectId(playerInfo.userId) : new Types.ObjectId();

        const newPlayer = {
            _id: playerId,
            socketId: clientId,
            name: playerInfo.name,
            avatar: playerInfo.avatar,
            isHost: isHost
        };

        await this.redis.hset(key, String(playerId), JSON.stringify(newPlayer));
        await this.redis.expire(key, 86400);
        return {
            isHost: isHost,
            playerId: String(playerId)
        };
    }

    async leaveRoom(playerId: string, roomPin: string) {
        const key = `game:room:${roomPin}:players`;
        const leaderboardKey = `game:room:${roomPin}:leaderboard`;

        await this.redis.hdel(key, playerId);
        await this.redis.zrem(leaderboardKey, playerId); 
    }

    async playerList(pin: string) {
        const key = `game:room:${pin}:players`;
        const rawPlayersList = await this.redis.hvals(key);
        
        return rawPlayersList.map(player => JSON.parse(player));
    }

    async addLeaderboard(pin: string, playerId: string, score: number) {
        const key = `game:room:${pin}:leaderboard`;
        await this.redis.zincrby(key, score, playerId);
        await this.redis.expire(key, 86400);
    }

    async getLeaderboard(pin: string, topN: number) {
        const leaderboardKey = `game:room:${pin}:leaderboard`;
        const playersKey = `game:room:${pin}:players`;
        const leaderboard = await this.redis.zrevrange(leaderboardKey, 0, topN - 1, 'WITHSCORES');

        let leaderboardData: any[] = [];
        for (let i = 0; i < leaderboard.length; i += 2) {
            const playerId = leaderboard[i];
            const score = parseInt(leaderboard[i + 1], 10);
            const playerData = await this.redis.hget(playersKey, playerId);
            if (playerData) {
                const { name, avatar, isHost } = JSON.parse(playerData);
                if (isHost) continue;
                
                leaderboardData.push({
                    playerId,
                    name,
                    avatar,
                    score
                });
            }
        }
        return leaderboardData;
    }

    async addPlayerAnswer(playerAnswerInfo: PlayerAnswerDto & { score: number, isCorrect: boolean }, roomPin: string, playerId: string) {
        const key = `game:room:${roomPin}:answer:${playerAnswerInfo.questionId}`;

        const answerPayload = {
            answerId: playerAnswerInfo.answerId,
            score: playerAnswerInfo.score,
            isCorrect: playerAnswerInfo.isCorrect,
        };

        await this.redis.hset(key, playerId, JSON.stringify(answerPayload));
        await this.redis.expire(key, 86400);

        if (playerAnswerInfo.score > 0) {
            await this.addLeaderboard(roomPin, playerId, playerAnswerInfo.score);
        }
    }

    async getCurrentAnswerCount(roomPin: string, questionId: string) {
        const key = `game:room:${roomPin}:answer:${questionId}`;
        return this.redis.hlen(key);
    }

    async getAllPlayersAnswer(roomPin: string) {
        const pattern = `game:room:${roomPin}:answer:*`;
        const allQuestionKeys = await this.redis.keys(pattern);

        if (allQuestionKeys.length === 0) {
            return {};
        }

        const pipeline = this.redis.pipeline();
        for (const key of allQuestionKeys) {
            pipeline.hgetall(key);
        }

        const pipelineResults = await pipeline.exec();
        const allAnswersResult = {};

        if (!pipelineResults) return {};

        for (let i = 0; i < allQuestionKeys.length; i++) {
            const questionId = allQuestionKeys[i].split(':').pop();
            const [err, questionAnswers] = pipelineResults[i] as [Error | null, Record<string, string>];

            if (err || !questionAnswers) continue;

            for (const [playerId, answerStr] of Object.entries(questionAnswers)) {
                if (!allAnswersResult[playerId]) {
                    allAnswersResult[playerId] = {};
                }
                allAnswersResult[playerId][questionId] = JSON.parse(answerStr);
            }
        }

        return allAnswersResult;
    }

    async markPlayerDisconnect(playerId: string, roomPin: string, periodSecond: number){
        const disconnectKey = `disconnect:${roomPin}:${playerId}`;

        const disconnectData = {
            playerId,
            roomPin,
            disconnectTime: Date.now()
        }

        await this.redis.setex(disconnectKey, periodSecond, JSON.stringify(disconnectData));
    }

    async removeDisconnectPlayer(roomPin: string, playerId: string){
        const disconnectKey = `disconnect:${roomPin}:${playerId}`;

        await this.redis.del(disconnectKey);
    }

    async getDisconnectData(roomPin: string, playerId: string){
        const disconnectKey = `disconnect:${roomPin}:${playerId}`;
        return await this.redis.get(disconnectKey);
    }

    async updatePlayerClientId(playerId: string, roomPin: string, newClientId: string){
        const key = `game:room:${roomPin}:players`;

        const playerData = await this.redis.hget(key, playerId);
        
        if(playerData){
            const player = JSON.parse(playerData);
            player.socket = newClientId;
            await this.redis.hset(key, playerId, JSON.stringify(player));
            return true;
        }

        return false;
    }

    async playerExist(playerId: string, roomPin: string){
        const key = `game:room:${roomPin}:players`;

        return await this.redis.hexists(key, playerId);
    }
}