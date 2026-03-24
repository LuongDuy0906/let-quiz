import { Controller, Get, Body, Patch, Param, Delete, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from 'src/common/utils/file-upload.utils';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/library')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findLibrary(@Req() req){
    return this.userService.findById(req.user.userId)
  }

  @Patch('profile')
  @ApiOperation({
    summary: 'Thêm ảnh đại diện cho người dùng',
    description: 'Upload a profile image for the user',
  })
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/avatar',
      filename: editFileName,
    }),
    fileFilter: imageFileFilter,
  }))
  updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDTO, @UploadedFile() file: Express.Multer.File) {
    updateProfileDto.image = `/uploads/avatar/${file.filename}`;
    return this.userService.updateProfile(req.user.userId, updateProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
