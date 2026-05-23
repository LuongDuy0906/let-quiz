import { Injectable } from '@nestjs/common';
import { UpdatePlayerRecordDto } from '../dto/update-player-record.dto';
import { InsertPlayerRecordDto } from '../dto/insert-player-record.dto';
import { PlayerRecord } from '../entities/player-record.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PlayerRecordService {
  constructor(
    @InjectModel(PlayerRecord.name) private readonly playerRecordModel: Model<PlayerRecord>
  ) {}

  create(createPlayerRecordDto: InsertPlayerRecordDto[]) {
    return this.playerRecordModel.insertMany(createPlayerRecordDto);
  }

  findAll() {
    return this.playerRecordModel.find().exec();
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
