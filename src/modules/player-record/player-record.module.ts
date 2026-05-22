import { Module } from '@nestjs/common';
import { PlayerRecordService } from './services/player-record.service';
import { PlayerRecordController } from './player-record.controller';
import { PlayerRecordRedisService } from './services/player-record.redis.service';
import { GameSessionModule } from '../game-session/game-session.module';

@Module({
  controllers: [PlayerRecordController],
  providers: [PlayerRecordService, PlayerRecordRedisService],
  exports: [PlayerRecordRedisService],
})
export class PlayerRecordModule {}
