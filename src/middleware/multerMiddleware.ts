import multer from 'multer';
import path from 'path';
import moment from 'moment';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${moment().format('YYYYMMDDHHmmss')}${path.extname(
        file.originalname
      )}`
    );
  },
});

const checkfiletype = (file, cb) => {
  // regex express to test mimetype and extension type
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
};

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    checkfiletype(file, cb);
  },
  limits: {
    fieldSize: 1024 * 1024 * 5,
  },
});
