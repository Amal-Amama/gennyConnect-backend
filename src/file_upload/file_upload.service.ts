// import { Injectable } from '@nestjs/common';
// import * as fs from 'fs';
// import * as path from 'path';

// @Injectable()
// export class FileUploadService {
//   uploadImage(image: Express.Multer.File): string {
//     const imageDirectory = 'uploads';
//     if (!fs.existsSync(imageDirectory)) {
//       fs.mkdirSync(imageDirectory);
//     }

//     const fileName = `${Date.now()}_${image.originalname}`;
//     const imagePath = path.join(imageDirectory, fileName);

//     fs.writeFileSync(imagePath, image.buffer);

//     return imagePath;
//   }
// }
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  uploadImage(image: Express.Multer.File): string {
    const uploadDirectory = 'uploads';
    if (!fs.existsSync(uploadDirectory)) {
      fs.mkdirSync(uploadDirectory);
    }

    let fileTypeDirectory = '';

    // Vérifie le type de fichier et détermine le répertoire de destination
    if (image.mimetype.startsWith('image')) {
      fileTypeDirectory = 'images';
    } else if (image.mimetype === 'application/pdf') {
      fileTypeDirectory = 'pdf';
    } else {
      throw new Error('Type de fichier non pris en charge');
    }

    const destinationDirectory = path.join(uploadDirectory, fileTypeDirectory);

    // Vérifie si le répertoire de destination existe, sinon le crée
    if (!fs.existsSync(destinationDirectory)) {
      fs.mkdirSync(destinationDirectory, { recursive: true });
    }

    const fileName = `${Date.now()}_${image.originalname}`;
    const imagePath = path.join(destinationDirectory, fileName);

    fs.writeFileSync(imagePath, image.buffer);

    return imagePath;
  }
  deleteFile(filePath: string) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
