import { HttpCode, HttpStatus } from '@nestjs/common';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { GameSessionService } from './services/game-session.service';
import { CreateGameSessionDto } from './dto/create-game-session.dto';
import { UpdateGameSessionDto } from './dto/update-game-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { GameSessionRedisService } from './services/game-session.redis.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GameSettings } from './dto/game-settings/game-settings.dto';
import { StartGameDTO } from './dto/start-game-info.dto';
import { GameSessionGateway } from './game-session.gateway';

@Controller('game-session')
export class GameSessionController {
  constructor(
    private readonly gameSessionService: GameSessionService,
    private readonly gameSessionRedisService: GameSessionRedisService,
    private readonly gameSessionGatewway: GameSessionGateway
  ) {}

  @Post('init')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Req() req, @Body() data: {quizId: string}) {
    return this.gameSessionRedisService.initGameSession(req.user.userId, data.quizId);
  }

  @Get('verify-pin/:roomPin')
  verifyPin(@Param('roomPin') roomPin: string){
    return this.gameSessionService.verifyRoomPin(roomPin);
  }

  @Get('get-game-session-and-room-pin/:roomPin')
  getGameSession(@Param('roomPin') roomPin: string){
    return this.gameSessionService.findGameSession(roomPin);
  } 

  @Post(':pin/finish')
  saveGameSession(@Param('pin') pin: string){
    return this.gameSessionService.create(pin);
  }

  @Patch(':roomPin/settings')
  @UseGuards(JwtAuthGuard)
  updateSettingForGameSession(@Req() req, @Param('roomPin') roomPin: string, @Body() settings: GameSettings){
    return this.gameSessionRedisService.updateGameSessionSettings(req.user.userId, roomPin, settings);
  }

  @Post('start')
  @HttpCode(HttpStatus.OK)
  async startGameSession(@Body() data: StartGameDTO){
    await this.gameSessionGatewway.triggerStartGame(data);
  }
}
