import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateGameSessionDto } from '../dto/update-game-session.dto';
import { Model } from 'mongoose';
import { GameSessionRedisService } from './game-session.redis.service';
import { GameSession, GameSessionDocument } from '../entities/game-session.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PlayerRecordRedisService } from 'src/modules/player-record/services/player-record.redis.service';
import { QuizService } from 'src/modules/quiz/quiz.service';
import { PlayerRecordService } from 'src/modules/player-record/services/player-record.service';
import { InsertPlayerRecordDto } from 'src/modules/player-record/dto/insert-player-record.dto';

@Injectable()
export class GameSessionService {
  constructor(
    private readonly gameRedisService: GameSessionRedisService,
    private readonly playerRecordRedisService: PlayerRecordRedisService,
    private readonly quizService: QuizService,
    private readonly playerRecordService: PlayerRecordService,

    @InjectModel(GameSession.name)
    private readonly gameSessionModel: Model<GameSessionDocument>
  ) {}
  
  async create(pin: string) {
    const gameSession = await this.gameRedisService.getGameSession(pin);

    if(!gameSession){
      throw new NotFoundException("Game session not found");
    }

    const gameSessionData = JSON.parse(gameSession);

     const quizInfo = await this.quizService.findOne(gameSessionData.quizId);

     if(!quizInfo){
      throw new NotFoundException("Quiz not found");
     }

     const playerList = await this.playerRecordRedisService.playerList(pin);

    const newGameSessionData = await this.gameSessionModel.create({
      _id: gameSessionData._id,
      pin: pin,
      quizId: gameSessionData.quizId, 
      hostId: gameSessionData.hostId,
      status: "STARTING",
      metrics: {
        totalPlayer: playerList.length,
        averageScore: 0
      },
      gameSettings: gameSessionData.gameSettings
    });

    if(playerList.length > 0){
      const playerRecordPayload: InsertPlayerRecordDto[] = playerList.map(player => ({
        sessionId: gameSessionData._id,
        playerId: player._id,
        playerName: player.name,
        totalScore: 0,
        finalRank: 0,
        correctCount: 0,
        wrongCount: 0
      }));
      
      await this.playerRecordService.create(playerRecordPayload);
    }

    return newGameSessionData;
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
