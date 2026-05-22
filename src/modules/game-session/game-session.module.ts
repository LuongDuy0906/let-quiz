import { Module } from '@nestjs/common';
import { GameSessionService } from './service/game-session.service';
import { GameSessionController } from './game-session.controller';
import { GameSessionRedisService } from './service/game-session.redis.service';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz } from '../quiz/entities/quiz.entity';
import { GameSession, GameSessionSchema } from './entities/game-session.entity';
import { GameSessionGateway } from './game-session.gateway';
import { PlayerRecordModule } from '../player-record/player-record.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: GameSession.name,
        schema: GameSessionSchema
      }
    ]),
    PlayerRecordModule
  ],
  controllers: [GameSessionController],
  providers: [GameSessionService, GameSessionRedisService, GameSessionGateway],
})
export class GameSessionModule {}
