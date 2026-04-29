import { Module } from '@nestjs/common';
import { GameSessionService } from './service/game-session.service';
import { GameSessionController } from './game-session.controller';
import { GameSessionRedisService } from './service/game-session.redis.service';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz } from '../quiz/entities/quiz.entity';
import { GameSession, GameSessionSchema } from './entities/game-session.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: GameSession.name,
        schema: GameSessionSchema
      }
    ])
  ],
  controllers: [GameSessionController],
  providers: [GameSessionService, GameSessionRedisService],
})
export class GameSessionModule {}
