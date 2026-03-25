import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { LoginDTO } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { ChangePasswordDTO } from '../user/dto/change-password.dto';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: LoginDTO) {
    return this.authService.login(body);
  }

  @Post('register')
  register(@Body() body: CreateUserDto){
    return this.authService.register(body);
  }

  @Post('refresh-token')
  @ApiBearerAuth()
  @UseGuards(RefreshAuthGuard)
  refreshToken(@Req() req){
    return this.authService.refreshToken(req.user);
  }

  @Patch(':id/change-password')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  changePassword(@Param('id') id: string, @Body() body: ChangePasswordDTO){
    return this.authService.changePassword(id, body);
  }

  @Get('/logout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  logout(@Req() req){
    const userId = req.user.userId;
    
    return this.authService.logout(userId);;
  }

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  googleLogin(){}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleCallback(@Req() req, @Res() res){
    const response = this.authService.login(req.user);
    res.redirect("http://localhost:5173")
  }
}
