import { Controller, Get, Body, Patch, Param, Delete, Req, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from 'src/common/utils/file-upload.utils';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Get('library')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findLibrary(@Req() req){
    return this.userService.findById(req.user.userId)
  }

  @Patch('profile')
  @ApiOperation({
    summary: 'Cập nhật hồ sơ người dùng',
  })
  async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDTO) {
    return this.userService.updateProfile(req.user.userId, updateProfileDto);
  }

  @Patch('profile/avatar')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Cập nhật ảnh đại diện người dùng'
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  async updateAvatar(@Req() req, @UploadedFile() file: Express.Multer.File){
    const result = await this.cloudinaryService.uploadAvatar(file);

    return await this.userService.updateAvatar(req.user.userId, result.secure_url);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Req() req) {
    return this.userService.remove(req.user.userId);
  }
}
