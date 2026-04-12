import { Module } from '@nestjs/common';
import { PlayerRecordService } from './player-record.service';
import { PlayerRecordController } from './player-record.controller';

@Module({
  controllers: [PlayerRecordController],
  providers: [PlayerRecordService],
})
export class PlayerRecordModule {}
