import { Injectable } from '@nestjs/common';
import { CreatePlayerRecordDto } from './dto/create-player-record.dto';
import { UpdatePlayerRecordDto } from './dto/update-player-record.dto';

@Injectable()
export class PlayerRecordService {
  create(createPlayerRecordDto: CreatePlayerRecordDto) {
    return 'This action adds a new playerRecord';
  }

  findAll() {
    return `This action returns all playerRecord`;
  }

  findOne(id: number) {
    return `This action returns a #${id} playerRecord`;
  }

  update(id: number, updatePlayerRecordDto: UpdatePlayerRecordDto) {
    return `This action updates a #${id} playerRecord`;
  }

  remove(id: number) {
    return `This action removes a #${id} playerRecord`;
  }
}
