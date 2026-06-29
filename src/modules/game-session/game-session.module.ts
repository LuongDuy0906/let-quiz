import { Module } from '@nestjs/common';
import { GameSessionService } from './services/game-session.service';
import { GameSessionController } from './game-session.controller';
import { GameSessionRedisService } from './services/game-session.redis.service';
import { MongooseModule } from '@nestjs/mongoose';
import { GameSession, GameSessionSchema } from './entities/game-session.entity';
import { GameSessionGateway } from './game-session.gateway';
import { PlayerRecordModule } from '../player-record/player-record.module';
import { QuizModule } from '../quiz/quiz.module';
import { PlayerRecord, PlayerRecordSchema } from '../player-record/entities/player-record.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: GameSession.name,
        schema: GameSessionSchema
      }
    ]),
    MongooseModule.forFeature([
      {
        name: PlayerRecord.name,
        schema: PlayerRecordSchema
      }
    ]),
    PlayerRecordModule,
    QuizModule,
    AuthModule
  ],
  controllers: [GameSessionController],
  providers: [GameSessionService, GameSessionRedisService, GameSessionGateway],
})
export class GameSessionModule {}
