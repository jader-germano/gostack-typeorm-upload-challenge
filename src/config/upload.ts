import crypto from 'crypto';
import multer from 'multer';
import path from 'path';

const temFolder = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  directory: temFolder,
  storage: multer.diskStorage({
    destination: temFolder,
    filename(req, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('HEX');
      const fileName = `${fileHash}-${file.originalname}`;

      return callback(null, fileName);
    },
  }),
};
