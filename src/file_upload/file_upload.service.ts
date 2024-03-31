import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  uploadImage(image: Express.Multer.File): string {
    const imageDirectory = 'uploads';
    if (!fs.existsSync(imageDirectory)) {
      fs.mkdirSync(imageDirectory);
    }

    const fileName = `${Date.now()}_${image.originalname}`;
    const imagePath = path.join(imageDirectory, fileName);

    fs.writeFileSync(imagePath, image.buffer);

    return imagePath;
  }
}
