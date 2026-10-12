const express = require('express');
const router = express.Router();
const { upload, isCloudinaryConfigured } = require('../config/cloudinary');
const { protect } = require('../middlewares/auth');
const AppError = require('../utils/AppError');

// @desc    Upload file to Cloudinary / Server Storage
// @route   POST /api/upload
// @access  Private (Admin)
router.post('/', protect, upload.single('image'), (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image file', 400));
  }

  // Cloudinary returns req.file.path as the secure https URL
  const fileUrl = req.file.path || req.file.secure_url || `/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    message: isCloudinaryConfigured 
      ? 'Image uploaded successfully to Cloudinary' 
      : 'Image uploaded successfully to local storage',
    url: fileUrl,
    filename: req.file.filename || req.file.originalname,
    provider: isCloudinaryConfigured ? 'cloudinary' : 'local'
  });
});

module.exports = router;
