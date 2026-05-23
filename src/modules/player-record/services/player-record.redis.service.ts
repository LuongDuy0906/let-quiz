import { Injectable } from "@nestjs/common";
import { CreatePlayerRecordDto } from "../dto/create-player-record.dto";
import Redis from "ioredis";
import { InjectRedis } from "@nestjs-modules/ioredis";

@Injectable()
export class PlayerRecordRedisService{
    constructor(
        @InjectRedis()
        private readonly redis: Redis
    ) {}

    async addNewPlayer(playerInfo: CreatePlayerRecordDto, clientId: string){
        const key = `game:room:${playerInfo.roomPin}:players`;

        const newPlayer = {
            _id: clientId,
            name: playerInfo.name,
            avatar: playerInfo.avatar
        }

        await this.redis.hset(key, clientId, JSON.stringify(newPlayer));
        await this.redis.expire(key, 86400);
        return;
    }

    async leaveRoom(clientId: string, roomPin: string){
        const key = `game:room:${roomPin}:players`;

        await this.redis.hdel(key, clientId);
    }

    async playerList(pin: string){
        const key = `game:room:${pin}:players`;

        const rawPlayersList = await this.redis.hvals(key);
        
        return rawPlayersList.map(player => JSON.parse(player));
    }

    async addLeaderboard(pin: string, playerName: string, score: number){
        const key = `game:room:${pin}:leaderboard`;
        await this.redis.zincrby(key, score, playerName);
    }

    async getLeaderboard(pin: string, topN: number){
        const leaderboardKey = `game:room:${pin}:leaderboard`;
        const playersKey = `game:room:${pin}:players`;
        const leaderboard = await this.redis.zrevrange(leaderboardKey, 0, topN - 1, 'WITHSCORES');

        let leaderboardData: any[] = [];
        for (let i = 0; i < leaderboard.length; i += 2) {
            let playerName = leaderboard[i];
            const score = parseInt(leaderboard[i + 1], 10);
            const playerData = await this.redis.hget(playersKey, playerName);
            if(playerData) {
                const { name, avatar } = JSON.parse(playerData);
                leaderboardData.push({
                    name,
                    avatar,
                    score
                });
            }
        }
        return leaderboardData;
    }

}