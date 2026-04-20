import { Module } from '@nestjs/common';
import { GameSessionService } from './service/game-session.service';
import { GameSessionController } from './game-session.controller';
import { GameSessionRedisService } from './service/game-session.redis.service';

@Module({
  controllers: [GameSessionController],
  providers: [GameSessionService, GameSessionRedisService],
})
export class GameSessionModule {}
