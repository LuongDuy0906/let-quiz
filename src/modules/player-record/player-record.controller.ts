import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlayerRecordService } from './player-record.service';
import { CreatePlayerRecordDto } from './dto/create-player-record.dto';
import { UpdatePlayerRecordDto } from './dto/update-player-record.dto';

@Controller('player-record')
export class PlayerRecordController {
  constructor(private readonly playerRecordService: PlayerRecordService) {}

  @Post()
  create(@Body() createPlayerRecordDto: CreatePlayerRecordDto) {
    return this.playerRecordService.create(createPlayerRecordDto);
  }

  @Get()
  findAll() {
    return this.playerRecordService.findAll();
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
