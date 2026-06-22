import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlayerRecordService } from './services/player-record.service';
import { CreatePlayerRecordDto } from './dto/create-player-record.dto';
import { UpdatePlayerRecordDto } from './dto/update-player-record.dto';
import { InsertPlayerRecordDto } from './dto/insert-player-record.dto';
import { PlayerRecordRedisService } from './services/player-record.redis.service';

@Controller('player-record')
export class PlayerRecordController {
  constructor(
    private readonly playerRecordService: PlayerRecordService,
    private readonly playerRecordRedisService: PlayerRecordRedisService
  ) {}

  @Get(':roomPin')
  findAll(@Param('roomPin') roomPin: string) {
    return this.playerRecordRedisService.getAllPlayersAnswer(roomPin);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playerRecordService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlayerRecordDto: UpdatePlayerRecordDto) {
    return this.playerRecordService.update(+id, updatePlayerRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.playerRecordService.remove(+id);
  }
}
