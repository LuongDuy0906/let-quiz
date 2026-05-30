import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { GameSessionService } from './service/game-session.service';
import { CreateGameSessionDto } from './dto/create-game-session.dto';
import { UpdateGameSessionDto } from './dto/update-game-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { GameSessionRedisService } from './service/game-session.redis.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('game-session')
export class GameSessionController {
  constructor(
    private readonly gameSessionService: GameSessionService,
    private readonly gameSessionRedisService: GameSessionRedisService
  ) {}

  @Post('init')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Req() req, @Body() data: {quizId: string}) {
    return this.gameSessionRedisService.initGameSession(req.user.userId, data.quizId);
  }

  @Post('verify-pin')
  verifyPin(@Body() data: {roomPin: string}){
    return this.gameSessionRedisService.verifyPin(data.roomPin);
  }

  @Get('get-room-pin/:sessionId')
  getRoomPin(@Param('sessionId') sessionId: string){
    return this.gameSessionRedisService.getPin(sessionId);
  } 

  @Post(':pin/finish')
  saveGameSession(@Param('pin') pin: string){
    return this.gameSessionService.create(pin);
  }

  @Get()
  findAll() {
    return this.gameSessionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gameSessionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGameSessionDto: UpdateGameSessionDto) {
    return this.gameSessionService.update(+id, updateGameSessionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gameSessionService.remove(+id);
  }
}
