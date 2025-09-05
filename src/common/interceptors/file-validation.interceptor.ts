import { BadRequestException } from '@nestjs/common';

export const fileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file.mimetype.match(/^image\/jpeg$/)) {
    return callback(
      new BadRequestException('Only JPEG files are allowed'),
      false,
    );
  }
  return callback(null, true);
};

export const multerConfig = {
  fileFilter,
  limits: {
    fileSize: 5242880,
  },
};
