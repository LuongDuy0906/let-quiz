import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { LoginDTO } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { ChangePasswordDTO } from '../user/dto/change-password.dto';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { DeleteAccountDTO } from '../user/dto/delete-account.dto';

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

  @Post('forgot-password')
  @UseGuards(JwtAuthGuard)
  forgotPassword(@Body() body: ForgotPasswordDTO){
    this.authService.forgotPassword(body.email);
  }

  @Patch('change-password')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  changePassword(@Req() req, @Body() body: ChangePasswordDTO){
    return this.authService.changePassword(req.user.userId, body);
  }

  @Post('delete-account')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  sendDeleteAccount(@Body() body: ForgotPasswordDTO){
    return this.authService.sendDeleteAccount(body.email);
  }

  @Post('delete-account/confirm')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  doDeleteAccount(@Req() req, @Body() body: DeleteAccountDTO){
    return this.authService.doDeleteAccount(req.user.userId, body);
  }

  @Get('/logout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  logout(@Req() req){
    const userId = req.user.userId;
    
    this.authService.logout(userId);
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
