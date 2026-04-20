import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { GameSessionService } from './service/game-session.service';
import { CreateGameSessionDto } from './dto/create-game-session.dto';
import { UpdateGameSessionDto } from './dto/update-game-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { GameSessionRedisService } from './service/game-session.redis.service';

@Controller('game-session')
export class GameSessionController {
  constructor(
    private readonly gameSessionService: GameSessionService,
    private readonly gameSessionRedisService: GameSessionRedisService
  ) {}

  @Post('init')
  @UseGuards(JwtAuthGuard)
  create(@Req() req, @Body('quizId') body: string) {
    return this.gameSessionRedisService.initGameSession(req.user.userId, body);
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
