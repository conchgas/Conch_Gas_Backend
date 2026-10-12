const express = require('express');
const router = express.Router();
const {
  getAllSeo,
  getSeoByPage,
  updateSeoByPage,
  resetDefaults
} = require('../controllers/seoController');
const { protect } = require('../middlewares/auth');

// Public routes for frontend SEO fetching
router.get('/', getAllSeo);
router.get('/page/:pageId', getSeoByPage);
router.get('/:pageId', getSeoByPage);

// Protected routes (Admin only)
router.put('/:pageId', protect, updateSeoByPage);
router.post('/reset-defaults', protect, resetDefaults);

module.exports = router;
