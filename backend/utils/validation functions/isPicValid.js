import path from 'path';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif'];

const isPicValid = (file) => {
  if (!file) {
    return { success: false, message: 'No file provided' };
  }

  const fileSize = file.size;
  const fileExtension = path.extname(file.name).toLowerCase();

  // Check file size
  if (fileSize > MAX_IMAGE_SIZE) {
    return { success: false, message: `File size exceeds ${MAX_IMAGE_SIZE / (1024 * 1024)} MB` };
  }

  // Check file extension
  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return { success: false, message: `Invalid file type. Allowed types are: ${ALLOWED_EXTENSIONS.join(', ')}` };
  }

  return { success: true };
};

export default isPicValid;
