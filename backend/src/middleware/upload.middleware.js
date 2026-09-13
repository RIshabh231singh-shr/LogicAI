const multer = require('multer');

// Configure in-memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

/**
 * Middleware wrapper for single file upload with error handling
 * @param {string} fieldName 
 */
const uploadSingle = (fieldName = 'file') => {
  const singleUpload = upload.single(fieldName);
  return (req, res, next) => {
    singleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File size exceeds the 10MB limit' });
        }
        return res.status(400).json({ error: `File upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ error: `File upload error: ${err.message}` });
      }
      next();
    });
  };
};

module.exports = {
  upload,
  uploadSingle,
};
