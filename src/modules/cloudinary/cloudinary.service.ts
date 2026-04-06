import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse} from 'cloudinary';
import * as streamifier from 'streamifier'

@Injectable()
export class CloudinaryService {
    uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {folder: 'quiz_images'},
                (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                    if(error) return reject(error);
                    if(result) return resolve(result);
                    reject(new BadRequestException("Loi khong xac dinh"))
                }
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }

    uploadAvatar(file: Express.Multer.File): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {folder: 'user_avatars'},
                (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                    if(error) return reject(error);
                    if(result) return resolve(result);
                    reject(new BadRequestException("Loi khong xac dinh"))
                }
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }
}
