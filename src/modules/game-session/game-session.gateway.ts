import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { CreatePlayerRecordDto } from "../player-record/dto/create-player-record.dto";
import { PlayerRecordRedisService } from "../player-record/services/player-record.redis.service";
import { GameSessionRedisService } from "./service/game-session.redis.service";
import {Server, Socket} from "socket.io";
import { GameSessionService } from "./service/game-session.service";
import { NotFoundException } from "@nestjs/common";

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class GameSessionGateway implements OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    constructor(
        private readonly playerRecordRedisService: PlayerRecordRedisService,
        private readonly gameSessionRedisService: GameSessionRedisService,
        private readonly gameSessionService: GameSessionService
    ) {}
    
    @SubscribeMessage('joinRoom')
    async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: CreatePlayerRecordDto) {

        const isRoomExist = await this.gameSessionRedisService.checkRoomPin(data.roomPin);
        if(!isRoomExist) {
            client.emit('error', { message: 'Phòng chơi không tồn tại' });
            return;
        }

        client.join(data.roomPin);

        client.data.roomPin = data.roomPin;
        
        await this.playerRecordRedisService.addNewPlayer(data, client.id);

        const playersList = await this.playerRecordRedisService.playerList(data.roomPin);
        this.server.to(data.roomPin).emit('playerListUpdate', playersList);
    }

    @SubscribeMessage('leaveRoom')
    async handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: CreatePlayerRecordDto) {
        const clientId = client.id;
        console.log(`Client ${clientId} is leaving room ${data.roomPin}`);

        await this.playerRecordRedisService.leaveRoom(clientId, data.roomPin);
        
        const playersList = await this.playerRecordRedisService.playerList(data.roomPin);
        this.server.to(data.roomPin).emit('playerListUpdate', playersList);
        client.leave(data.roomPin);
    }   

    async handleDisconnect(client: any) {
        const roomPin = client.data.roomPin;
        if(roomPin){
            await this.playerRecordRedisService.leaveRoom(client.id, roomPin);
            const playersList = await this.playerRecordRedisService.playerList(roomPin);
            this.server.to(roomPin).emit('playerDisconnected', { message: 'Một người chơi đã rời khỏi trò chơi' });
            this.server.to(roomPin).emit('playerListUpdate', playersList);
        }
    }

    @SubscribeMessage('startGame')
    async handleStartGame(@ConnectedSocket() client: Socket, @MessageBody() data: { roomPin: string }) {
        const {roomPin} = data

        try{
            const session = await this.gameSessionService.create(roomPin);
        
            this.server.to(data.roomPin).emit('gameStarted', 
                {   
                    gameSession: session._id,
                    message: 'Trò chơi đã bắt đầu' 
                });

            setTimeout(async () => {
                await this.handleNextQuestion(client, {roomPin});
            }, 3000)

        } catch (e) {
            console.log('Lỗi khi bắt đầu trò chơi', e);
            client.emit('error', { message: 'Không thể bắt đầu trò chơi. Vui lòng thử lại!' });
        }
    }

    @SubscribeMessage('nextQuestion')
    async handleNextQuestion(@ConnectedSocket() client: Socket, @MessageBody() data: { roomPin: string }) {
        const {roomPin} = data;

        try {
            const currentIndex = await this.gameSessionRedisService.updateGameSessionQuestionIndex(roomPin);

            const rawQuestion = await this.gameSessionRedisService.getQuestion(roomPin);

            if(!rawQuestion){
                throw new NotFoundException("Cau hoi khong ton tai")
            }

            const questions = JSON.parse(rawQuestion);

            if(currentIndex >= questions.length){
                this.server.to(roomPin).emit('gameEnded', {message: "Tro choi da ket thuc"});
            }

            const currentQuestion = questions[currentIndex];

            setTimeout(() => {
                let countdown = 3;

                const countdownTimer = setInterval(() => {
                    if(countdown > 0) {
                        this.server.to(roomPin).emit('countdown', {second: countdown});
                        countdown--;
                    } 
                    else {
                        clearInterval(countdownTimer)
                    }

                    const safeQuestionForPlayer = {
                        questionId: questions._id,
                        title: currentQuestion.title,
                        options: currentQuestion.options.map(opt => ({ id: opt.id, text: opt.text })), 
                        duration: currentQuestion.duration,
                        currentQuestionIndex: currentIndex + 1,
                        totalQuestions: questions.length
                    }

                    this.server.to(roomPin).emit('questionRecived', safeQuestionForPlayer);

                    this.startQuestionTimer(roomPin, questions.duration);
                })
            })
        } catch (error) {
            
        }
    }

    private startQuestionTimer(roomPin: string, duration: number){
        let timerLeft = duration;

        const questionTimer = setInterval( async () => {
            if(timerLeft > 0){
                timerLeft--;
            } else {
                clearInterval(questionTimer);

                this.server.to(roomPin).emit('timeout', {message: "Da het thoi gian tra loi"});

                const leaderBoard = await this.playerRecordRedisService.getLeaderboard(roomPin, 5);
                this.server.to(roomPin).emit('liveLeaderboard', leaderBoard);
            }
        })
    }   
}