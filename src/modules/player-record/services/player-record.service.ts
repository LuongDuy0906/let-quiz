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

  create(playerList: any[], gameSessionId: string) {
    const playerRecordPayload: InsertPlayerRecordDto[] = playerList.map(player => ({
      sessionId: gameSessionId,
      playerId: player._id,
      playerName: player.name,
      totalScore: 0,
      finalRank: 0,
      correctCount: 0,
      wrongCount: 0
    }));
    
    return this.playerRecordModel.insertMany(playerRecordPayload);
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
