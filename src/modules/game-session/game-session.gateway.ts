import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { CreatePlayerRecordDto } from "../player-record/dto/create-player-record.dto";
import { PlayerRecordRedisService } from "../player-record/services/player-record.redis.service";
import { GameSessionRedisService } from "./service/game-session.redis.service";
import {Server, Socket} from "socket.io";
import { GameSessionService } from "./service/game-session.service";

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class GameSessionGateway implements OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

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

        const session = await this.gameSessionService.create(roomPin);
        

        this.server.to(data.roomPin).emit('gameStarted', 
            {   
                gameSession: session._id,
                message: 'Trò chơi đã bắt đầu' 
            });
    }

    @SubscribeMessage('nextQuestion')
    async handleNextQuestion(@ConnectedSocket() client: Socket, @MessageBody() data: { roomPin: string }) {}
}