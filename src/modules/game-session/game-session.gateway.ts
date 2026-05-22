import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { CreatePlayerRecordDto } from "../player-record/dto/create-player-record.dto";
import { PlayerRecordRedisService } from "../player-record/services/player-record.redis.service";
import { GameSessionRedisService } from "./service/game-session.redis.service";
import {Server, Socket} from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class GameSessionGateway {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly playerRecordRedisService: PlayerRecordRedisService,
        private readonly gameSessionRedisService: GameSessionRedisService,
    ) {}
    
    @SubscribeMessage('joinRoom')
    async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: CreatePlayerRecordDto) {

        const isRoomExist = await this.gameSessionRedisService.checkRoomPin(data.roomPin);
        if(!isRoomExist) {
            client.emit('error', { message: 'Phòng chơi không tồn tại' });
            return;
        }

        client.join(data.roomPin);

        await this.playerRecordRedisService.addNewPlayer(data);

        const playersList = await this.playerRecordRedisService.playerList(data.roomPin);
        this.server.to(data.roomPin).emit('playerListUpdate', playersList);
    }

    @SubscribeMessage('leaveRoom')
    async handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: CreatePlayerRecordDto) {
        client.leave(data.roomPin);
        await this.playerRecordRedisService.leaveRoom(data.name, data.roomPin);
        
        const playersList = await this.playerRecordRedisService.playerList(data.roomPin);
        this.server.to(data.roomPin).emit('playerListUpdate', playersList);
    }   
}