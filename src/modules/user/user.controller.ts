import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('search')
  findOne(@Query('email') email: string) {
    return this.userService.findOne(email);
  }

  @Get('/library')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findLibrary(@Req() req){
    return this.userService.findById(req.user.userId)
  }

  @Patch(':id/profile')
  updateProfile(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDTO) {
    return this.userService.updateProfile(id, updateProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
