import { Module } from '@nestjs/common';
import { PlayerRecordService } from './services/player-record.service';
import { PlayerRecordController } from './player-record.controller';
import { PlayerRecordRedisService } from './services/player-record.redis.service';
import { PlayerRecord, PlayerRecordSchema } from './entities/player-record.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
          {
            name: PlayerRecord.name,
            schema: PlayerRecordSchema
          }
        ]),
  ],
  controllers: [PlayerRecordController],
  providers: [PlayerRecordService, PlayerRecordRedisService],
  exports: [PlayerRecordRedisService, PlayerRecordService],
})
export class PlayerRecordModule {}
