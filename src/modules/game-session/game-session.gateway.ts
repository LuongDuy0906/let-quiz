import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { CreatePlayerRecordDto } from "../player-record/dto/create-player-record.dto";
import { PlayerRecordRedisService } from "../player-record/services/player-record.redis.service";
import { GameSessionRedisService } from "./service/game-session.redis.service";
import { Server, Socket } from "socket.io";
import { GameSessionService } from "./service/game-session.service";
import { NotFoundException } from "@nestjs/common";
import { StartGameDTO } from "./dto/start-game-info.dto";
import { PlayerAnswerDto } from "../player-record/dto/save-player-answer.dto";

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class GameSessionGateway implements OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    private activeTimers = new Map<string, NodeJS.Timeout>();

    constructor(
        private readonly playerRecordRedisService: PlayerRecordRedisService,
        private readonly gameSessionRedisService: GameSessionRedisService,
        private readonly gameSessionService: GameSessionService
    ) {}
    
    @SubscribeMessage('joinRoom')
    async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: CreatePlayerRecordDto) {
        try {
            const rawRoomData = await this.gameSessionRedisService.getGameSession(data.roomPin);

            if (!rawRoomData) {
                throw new NotFoundException("Mã PIN không hợp lệ");
            }

            const roomInfo = JSON.parse(rawRoomData);

            if (roomInfo.status !== 'LOBBY') {
                client.emit('error', { message: 'Rất tiếc! Trò chơi đã bắt đầu hoặc đã kết thúc.' });
                return;
            }

            const isClientHost = await this.playerRecordRedisService.addNewPlayer(data, client.id, roomInfo.hostId);
            client.join(data.roomPin);
            client.data.roomPin = data.roomPin;
            client.data.isHost = isClientHost;

            const playerList = await this.playerRecordRedisService.playerList(data.roomPin);
            this.server.to(data.roomPin).emit('playerListUpdate', playerList);
        } catch (e) {
            console.error('Lỗi khi học sinh join phòng:', e);
            client.emit('error', { message: 'Đã xảy ra lỗi hệ thống, không thể vào phòng.' });
        }
    }

    @SubscribeMessage('leaveRoom')
    async handleLeaveRoom(@ConnectedSocket() client: Socket) {
        const clientId = client.id;
        const isHost = client.data.isHost;
        const roomPin = client.data.roomPin;

        if (isHost) {
            this.server.to(roomPin).emit('roomClosed', { message: 'Giáo viên đã đóng phòng chờ này!' });
            await this.gameSessionRedisService.cleanUpFullRoom(roomPin);
            this.server.in(roomPin).socketsLeave(roomPin);
            this.activeTimers.delete(roomPin);
            return;
        }

        console.log(`Client ${clientId} is leaving room ${roomPin}`);
        await this.playerRecordRedisService.leaveRoom(clientId, roomPin);
        
        const playersList = await this.playerRecordRedisService.playerList(roomPin);
        this.server.to(roomPin).emit('playerListUpdate', playersList);
        client.leave(roomPin);
    }   

    async handleDisconnect(client: Socket) {
        const roomPin = client.data.roomPin;
        const isHost = client.data.isHost;
        if (roomPin) {
            if (isHost) {
                this.server.to(roomPin).emit('roomClosed', { message: 'Giáo viên đã đóng phòng chờ này!' });
                await this.gameSessionRedisService.cleanUpFullRoom(roomPin);
                this.server.in(roomPin).socketsLeave(roomPin);
                this.activeTimers.delete(roomPin);
                return;
            }

            await this.playerRecordRedisService.leaveRoom(client.id, roomPin);
            const playersList = await this.playerRecordRedisService.playerList(roomPin);
            this.server.to(roomPin).emit('playerDisconnected', { message: 'Một người chơi đã rời khỏi trò chơi' });
            this.server.to(roomPin).emit('playerListUpdate', playersList);
        }
    }

    async triggerStartGame(data: StartGameDTO) {
        try {
            const gameSessionData = await this.gameSessionService.create(data.roomPin);
            
            if (!gameSessionData) {
                throw new NotFoundException("Phiên chơi không tồn tại");
            }

            const settings = gameSessionData.gameSettings;

            if (settings?.shuffleQuestions) {
                const rawQuestions = await this.gameSessionRedisService.getQuestion(data.roomPin);

                if (rawQuestions) {
                    const questionsArray = JSON.parse(rawQuestions);

                    for (let i: number = questionsArray.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [questionsArray[i], questionsArray[j]] = [questionsArray[j], questionsArray[i]];
                    }

                    await this.gameSessionRedisService.saveQuestion(data.roomPin, questionsArray);
                }
            }

            this.server.to(data.roomPin).emit('gameStarted', {   
                gameSession: data.sessionId,
                message: 'Trò chơi đã bắt đầu' 
            });

            setTimeout(async () => {
                await this.internalNextQuestion(data.roomPin);
            }, 3000);

        } catch (e) {
            console.error('Lỗi nghiêm trọng khi kích hoạt luồng phát tín hiệu Start Game:', e);
        }
    }

    private async internalNextQuestion(roomPin: string) {
        if (!roomPin) return;

        try {
            const currentIndex = await this.gameSessionRedisService.updateGameSessionQuestionIndex(roomPin);
            
            const rawRoomData = await this.gameSessionRedisService.getGameSession(roomPin);
            const rawQuestion = await this.gameSessionRedisService.getQuestion(roomPin);

            if (!rawRoomData || !rawQuestion) {
                throw new NotFoundException("Thông tin phòng hoặc câu hỏi đã bị thất lạc trên Redis");
            }

            const roomInfo = JSON.parse(rawRoomData);
            const questions = JSON.parse(rawQuestion);
            const settings = roomInfo.gameSettings;

            if (currentIndex >= questions.length) {
                this.server.to(roomPin).emit('gameEnded', { message: "Trò chơi đã kết thúc" });
                return;
            }

            const currentQuestion = questions[currentIndex];

            let countdown = 3;
            const countdownTimer = setInterval(async () => {
                if (countdown > 0) {
                    this.server.to(roomPin).emit('countdown', { second: countdown });
                    countdown--;
                } else {
                    clearInterval(countdownTimer);

                    let optionsData = currentQuestion.options.map((opt: any) => ({ id: opt.id, text: opt.text }));

                    if (settings?.shuffleOptions) {
                        optionsData = optionsData.sort(() => Math.random() - 0.5);
                    }

                    const safeQuestionForPlayer = {
                        questionId: currentQuestion._id,
                        title: currentQuestion.title,
                        options: optionsData, 
                        duration: currentQuestion.duration,
                        currentQuestionIndex: currentIndex + 1,
                        totalQuestions: questions.length
                    };

                    this.server.to(roomPin).emit('questionRecived', safeQuestionForPlayer);

                    this.startQuestionTimer(roomPin, currentQuestion.duration, settings);
                }
            }, 1000);

        } catch (error) {
            console.error('Lỗi sập luồng xử lý câu hỏi:', error);
        }
    }

    private startQuestionTimer(roomPin: string, duration: number, settings: any) {
        let timerLeft = duration;

        if (this.activeTimers.has(roomPin)) {
            clearInterval(this.activeTimers.get(roomPin)!);
        }

        const questionTimer = setInterval(async () => {
            if (timerLeft > 0) {
                timerLeft--;
                this.server.to(roomPin).emit('timerTick', { remaining: timerLeft });
            } else {
                clearInterval(questionTimer);
                this.activeTimers.delete(roomPin); 

                await this.handleQuestionEnd(roomPin, settings);
            }
        }, 1000);

        this.activeTimers.set(roomPin, questionTimer);
    }

    @SubscribeMessage('submitAnswer')
    async handleSubmitAnswer(
        @ConnectedSocket() client: Socket, 
        @MessageBody() data: PlayerAnswerDto & { score: number }
    ) {
        const roomPin = client.data.roomPin;
        if (!roomPin) return;

        try {
            let clientScore = data.score || 0;
            if (clientScore > 1000) clientScore = 1000;
            if (clientScore < 0) clientScore = 0;

            const rawQuestion = await this.gameSessionRedisService.getQuestion(roomPin);
            const rawRoomData = await this.gameSessionRedisService.getGameSession(roomPin);
            
            let finalScore = 0;
            let isCorrect: boolean = false;

            if (rawQuestion && rawRoomData) {
                const questions = JSON.parse(rawQuestion);
                const roomInfo = JSON.parse(rawRoomData);
                const currentQuestion = questions[roomInfo.questionIndex];

                isCorrect = currentQuestion.options.find((opt: any) => opt.id === data.answerId)?.isCorrect;

                if (isCorrect) {
                    finalScore = clientScore;
                } else {
                    finalScore = 0;
                }
            }

            await this.playerRecordRedisService.playerAnswer({
                ...data,
                isCorrect,
                score: finalScore 
            } as any, roomPin, client.id);

            const currentAnsweredCount = await this.playerRecordRedisService.getCurrentAnswerCount(roomPin, data.questionId);

            const playerList = await this.playerRecordRedisService.playerList(roomPin);
            const totalPlayers = playerList.filter((p: any) => !p.isHost).length;

            this.server.to(roomPin).emit('playerAnsweredUpdate', { 
                answeredCount: currentAnsweredCount, 
                totalPlayers: totalPlayers 
            });

            if (currentAnsweredCount >= totalPlayers && totalPlayers > 0) {
                console.log(`[Auto-Advance] Toàn bộ ${totalPlayers} người chơi phòng ${roomPin} đã xong bài sớm. Kích hoạt chuyển câu!`);

                if (this.activeTimers.has(roomPin)) {
                    clearInterval(this.activeTimers.get(roomPin)!);
                    this.activeTimers.delete(roomPin);
                }

                if (rawRoomData) {
                    const roomInfo = JSON.parse(rawRoomData);
                    await this.handleQuestionEnd(roomPin, roomInfo.gameSettings);
                }
            }

        } catch (error) {
            console.error('Lỗi khi xử lý luồng nộp bài của học sinh:', error);
        }
    }

    private async handleQuestionEnd(roomPin: string, settings: any) {
        this.server.to(roomPin).emit('timeout', { message: "Câu hỏi đã kết thúc" });

        if (settings?.showLeaderboard) {
            const leaderBoard = await this.playerRecordRedisService.getLeaderboard(roomPin, 5);
            this.server.to(roomPin).emit('liveLeaderboard', leaderBoard);
        } else {
            this.server.to(roomPin).emit('questionFinishedWithoutLeaderboard');
        }

        setTimeout(async () => {
            await this.internalNextQuestion(roomPin);
        }, 5000);
    }
}