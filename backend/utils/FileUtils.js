import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function ensureDirectoryExists(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
}

export async function saveFile(file, savePath) {
  return new Promise((resolve, reject) => {
    file.mv(savePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Define storage settings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '..', 'UsersUploads', 'ProfilePic');
    ensureDirectoryExists(uploadsDir);  // Ensure directory exists
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

// Define file filter to accept only specific file types (e.g., JPEG, PNG)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, and PNG images are allowed'));
  }
};

// Define upload limits (e.g., file size)
const limits = {
  fileSize: 5 * 1024 * 1024 // 5 MB
};

// Initialize Multer with the defined settings
const upload = multer({
  storage: storage,
  // fileFilter: fileFilter,
  limits: limits
});

export {upload};