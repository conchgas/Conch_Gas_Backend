const SiteSettings = require('../models/SiteSettings');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public
exports.getSettings = asyncHandler(async (req, res, next) => {
  let settings = await SiteSettings.findOne();

  // Create default settings if not exists
  if (!settings) {
    settings = await SiteSettings.create({
      phone: '+91-8882691919',
      whatsapp: '+91-8882691919',
      email: 'couriermedicines@gmail.com',
      workingHours: 'Mon - Sat 09:00 - 19:00',
      address: 'Shop No. 7, 1st Floor, Market, Block C, Nizamuddin West, New Delhi, Delhi-110013',
      socialLinks: {
        instagram: '',
        youtube: ''
      },
      aboutText: 'Courier Medicines Offers Free Pick Up Service All Across India with providing Medicine Procurement Facilities also...',
      copyright: '2024 © All Rights Reserved, Courier Services'
    });
  }

  res.status(200).json({
    success: true,
    data: settings
  });
});

// @desc    Update site settings (Admin only)
// @route   PUT /api/settings
// @access  Private
exports.updateSettings = asyncHandler(async (req, res, next) => {
  let settings = await SiteSettings.findOne();

  if (!settings) {
    settings = new SiteSettings();
  }

  const { phone, whatsapp, email, workingHours, address, socialLinks, aboutText, copyright, countryHeroImage, documentImage } = req.body;

  if (phone !== undefined) settings.phone = phone;
  if (whatsapp !== undefined) settings.whatsapp = whatsapp;
  if (email !== undefined) settings.email = email;
  if (workingHours !== undefined) settings.workingHours = workingHours;
  if (address !== undefined) settings.address = address;
  if (aboutText !== undefined) settings.aboutText = aboutText;
  if (copyright !== undefined) settings.copyright = copyright;
  if (countryHeroImage !== undefined) settings.countryHeroImage = countryHeroImage;
  if (documentImage !== undefined) settings.documentImage = documentImage;

  if (req.files) {
    if (req.files.processImage1) settings.processImage1 = `/uploads/${req.files.processImage1[0].filename}`;
    if (req.files.processImage2) settings.processImage2 = `/uploads/${req.files.processImage2[0].filename}`;
    if (req.files.processImage3) settings.processImage3 = `/uploads/${req.files.processImage3[0].filename}`;
    if (req.files.processImage4) settings.processImage4 = `/uploads/${req.files.processImage4[0].filename}`;
    if (req.files.processImage5) settings.processImage5 = `/uploads/${req.files.processImage5[0].filename}`;
    if (req.files.documentImage) settings.documentImage = `/uploads/${req.files.documentImage[0].filename}`;
    if (req.files.countryHeroImage) settings.countryHeroImage = `/uploads/${req.files.countryHeroImage[0].filename}`;
  }

  if (socialLinks) {
    const existingLinks = settings.socialLinks || {};
    settings.socialLinks = {
      instagram: socialLinks.instagram !== undefined ? socialLinks.instagram : existingLinks.instagram,
      youtube: socialLinks.youtube !== undefined ? socialLinks.youtube : existingLinks.youtube
    };
  }

  await settings.save();

  res.status(200).json({
    success: true,
    data: settings
  });
});
