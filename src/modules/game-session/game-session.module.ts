import { Module } from '@nestjs/common';
import { GameSessionService } from './service/game-session.service';
import { GameSessionController } from './game-session.controller';
import { GameSessionRedisService } from './service/game-session.redis.service';
import { MongooseModule } from '@nestjs/mongoose';
import { GameSession, GameSessionSchema } from './entities/game-session.entity';
import { GameSessionGateway } from './game-session.gateway';
import { PlayerRecordModule } from '../player-record/player-record.module';
import { QuizModule } from '../quiz/quiz.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: GameSession.name,
        schema: GameSessionSchema
      }
    ]),
    PlayerRecordModule,
    QuizModule
  ],
  controllers: [GameSessionController],
  providers: [GameSessionService, GameSessionRedisService, GameSessionGateway],
})
export class GameSessionModule {}
