import multer from 'multer';

// Storage configuration (memory storage is ideal for streaming to Cloudinary)
const storage = multer.memoryStorage();

// File filter (allow images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed (jpg, jpeg, png, webp, etc.)'), false);
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
