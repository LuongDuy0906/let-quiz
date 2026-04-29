import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateGameSessionDto } from '../dto/update-game-session.dto';
import { Model, Types } from 'mongoose';
import { GameSessionRedisService } from './game-session.redis.service';
import { GameSession, GameSessionDocument } from '../entities/game-session.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class GameSessionService {
  constructor(
    private readonly gameRedisService: GameSessionRedisService,

    @InjectModel(GameSession.name)
    private readonly gameSessionModel: Model<GameSessionDocument>
  ) {}
  
  async create(pin: string) {
    const gameSession = await this.gameRedisService.getGameSession(pin);
    if(!gameSession){
      throw new NotFoundException("Game session not found");
    }

    const gameSessionData = JSON.parse(gameSession);

    return await this.gameSessionModel.create({
      _id: gameSessionData._id,
      pin: pin,
      quizId: gameSessionData.quizId, 
      hostId: gameSessionData.hostId,
      status: "COMPLETED",
      metrics: {
        totalPlayer: 3,
        averageScore: 3
      },
      gameSettings: gameSessionData.gameSettings
    });
  }

  findAll() {
    return `This action returns all gameSession`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gameSession`;
  }

  update(id: number, updateGameSessionDto: UpdateGameSessionDto) {
    return `This action updates a #${id} gameSession`;
  }

  remove(id: number) {
    return `This action removes a #${id} gameSession`;
  }

  
}
