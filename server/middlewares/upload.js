import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); 
  },
  filename: (req, file, cb) => {
    // We use the ISBN from the body to name the file
    // Example: 978123456789.jpg
    const bookIdentifier = req.body.isbn || Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `${bookIdentifier}${extension}`);
  }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
});

export default upload;