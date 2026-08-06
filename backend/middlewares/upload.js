import multer from 'multer';

// Storage configuration (memory storage is ideal for streaming to Cloudinary)
const storage = multer.memoryStorage();

// File filter (strict image MIME types & extension check)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const allowedExtensions = /\.(jpg|jpeg|png|webp|gif)$/i;

  const isMimeValid = allowedMimeTypes.includes(file.mimetype);
  const isExtensionValid = allowedExtensions.test(file.originalname);

  if (isMimeValid && isExtensionValid) {
    cb(null, true);
  } else {
    cb(new Error('Security Error: Only valid image files (jpg, jpeg, png, webp, gif) are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB maximum
  }
});

export default upload;
