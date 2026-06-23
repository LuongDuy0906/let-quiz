import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateGameSessionDto } from '../dto/update-game-session.dto';
import { Model, Types } from 'mongoose';
import { GameSessionRedisService } from './game-session.redis.service';
import { GameSession, GameSessionDocument } from '../entities/game-session.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PlayerRecordRedisService } from 'src/modules/player-record/services/player-record.redis.service';
import { QuizService } from 'src/modules/quiz/quiz.service';
import { PlayerRecordService } from 'src/modules/player-record/services/player-record.service';
import { GameSessionStatus } from 'src/common/enum/gameSesstionStatus';
import { PlayerRecord, PlayerRecordDocument } from 'src/modules/player-record/entities/player-record.entity';

@Injectable()
export class GameSessionService {
  constructor(
    private readonly gameRedisService: GameSessionRedisService,
    private readonly playerRecordRedisService: PlayerRecordRedisService,
    private readonly quizService: QuizService,
    private readonly playerRecordService: PlayerRecordService,

    @InjectModel(GameSession.name)
    private readonly gameSessionModel: Model<GameSessionDocument>,

    @InjectModel(PlayerRecord.name)
    private readonly playerRecordModel: Model<PlayerRecordDocument>
  ) {}
  
  async create(pin: string) {
    const gameSession = await this.gameRedisService.getGameSession(pin);

    if(!gameSession){
      throw new NotFoundException("Phòng chơi không tôn tại");
    }

    const gameSessionData = JSON.parse(gameSession);

    const gameSessionStatus: GameSessionStatus = await this.gameRedisService.updateGameSessionStatus(pin);
    console.log(gameSessionStatus)

    const quizData = await this.quizService.findOne(gameSessionData.quizId);

    if(!quizData){
      throw new NotFoundException("Không tìm thấy bộ đề");
    }

    await this.gameRedisService.saveQuestion(pin, quizData);

    const playerList = await this.playerRecordRedisService.playerList(pin);

    await this.gameSessionModel.create({
      _id: gameSessionData._id,
      pin: pin,
      quizId: gameSessionData.quizId, 
      hostId: gameSessionData.hostId,
      status: gameSessionStatus,
      metrics: {
        totalPlayer: playerList.length,
        averageScore: 0
      },
    });
    
    if(playerList.length > 0){
      await this.playerRecordService.create(playerList, gameSessionData._id);
    }
  
    return gameSessionData;
  }

  async findGameSession(roomPin: string){
    if(!roomPin){
      throw new ConflictException("Mã PIN không hợp lệ");
    }

    const rawGameSessionData = await this.gameRedisService.getGameSession(roomPin);

    if(!rawGameSessionData){
      throw new NotFoundException("Phiên chơi không tồn tại");
    }

    const gameSessionData = JSON.parse(rawGameSessionData);

    const quizInfo = await this.quizService.findOne(gameSessionData.quizId);

    return {
      quizInfo: quizInfo,
      roomPin: roomPin
    };
  }

  async verifyRoomPin(roomPin: string): Promise<boolean | null>{
    const isRoomPinExist = await this.gameRedisService.checkRoomPin(roomPin);

    return isRoomPinExist;
  }

  async saveSessionResultsToMongo(roomPin: string) {
        const rawRoomData = await this.gameRedisService.getGameSession(roomPin);

        if (!rawRoomData){
          throw new NotFoundException('Không tìm thấy thông tin phiên chơi');
        }

        const roomInfo = JSON.parse(rawRoomData);
        const sessionId = new Types.ObjectId(roomInfo._id); 

        await this.gameSessionModel.findByIdAndUpdate(sessionId, { status: GameSessionStatus.ENDED});

        const finalLeaderboard = await this.playerRecordRedisService.getLeaderboard(roomPin, 100);

        const bulkUpdateOperations: any[] = [];
        let rankCounter = 1;

        for (const player of finalLeaderboard) {
            const { playerId, score } = player;
            const playerAnswersKey = `game:room:${roomPin}:answer:${playerId}`;
            const allAnswersRaw = await this.playerRecordRedisService['redis'].hgetall(playerAnswersKey);

            const responseHistory: any[] = [];
            let correctCount = 0;
            let wrongCount = 0;

            for (const [questionId, answerString] of Object.entries(allAnswersRaw)) {
                const savedAnswer = JSON.parse(answerString);
                
                responseHistory.push({
                    questionId: questionId,
                    answerId: savedAnswer.answerId,
                    isCorrect: savedAnswer.isCorrect
                });

                if (savedAnswer.isCorrect) correctCount++;
                else wrongCount++;
            }

            bulkUpdateOperations.push({
                updateOne: {
                    filter: { sessionId: sessionId, playerId: playerId },
                    update: {
                        $set: {
                            totalScore: score,
                            finalRank: rankCounter++,
                            correctCount: correctCount,
                            wrongCount: wrongCount,
                            responseHistory: responseHistory
                        }
                    }
                }
            });
        }

        if (bulkUpdateOperations.length > 0) {
            await this.playerRecordModel.bulkWrite(bulkUpdateOperations);
            console.log(`[Database] Đã cập nhật kết quả thành công cho ${bulkUpdateOperations.length} học sinh.`);
        }

        await this.gameRedisService.cleanUpFullRoom(roomPin);
    }
}
