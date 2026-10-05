const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { protect } = require('../middlewares/auth');
const AppError = require('../utils/AppError');

// @desc    Upload file to Local Server Storage
// @route   POST /api/upload
// @access  Private (Admin)
router.post('/', protect, upload.single('image'), (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image file', 400));
  }

  // Construct local URL accessible via /uploads/<filename>
  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    message: 'Image uploaded successfully to local storage',
    url: fileUrl,
    filename: req.file.filename
  });
});

module.exports = router;
