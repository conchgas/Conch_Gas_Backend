const Country = require('../models/Country');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Get all active countries (Public)
// @route   GET /api/countries
// @access  Public
exports.getCountries = asyncHandler(async (req, res, next) => {
  const filter = { isDeleted: false };
  
  // Public gets only active, admin can see all
  if (!req.query.all || req.query.all !== 'true') {
    filter.isActive = true;
  }

  const countries = await Country.find(filter).sort({ sortOrder: 1, name: 1 });

  res.status(200).json({
    success: true,
    count: countries.length,
    data: countries
  });
});

// @desc    Get single country by slug (Public)
// @route   GET /api/countries/:slug
// @access  Public
exports.getCountryBySlug = asyncHandler(async (req, res, next) => {
  const country = await Country.findOne({ slug: req.params.slug.toLowerCase(), isDeleted: false });

  if (!country) {
    return res.status(200).json({
      success: true,
      data: null
    });
  }

  res.status(200).json({
    success: true,
    data: country
  });
});

// @desc    Create a country (Admin only)
// @route   POST /api/countries
// @access  Private
exports.createCountry = asyncHandler(async (req, res, next) => {
  const { code, name, slug, basePrice } = req.body;

  if (!code || !name || !slug || basePrice === undefined) {
    return next(new AppError('Please provide code, name, slug, and basePrice', 400));
  }

  const codeUpper = code.toUpperCase();
  const slugLower = slug.toLowerCase();

  // Check if exists
  const exists = await Country.findOne({
    $or: [{ code: codeUpper }, { slug: slugLower }],
    isDeleted: false
  });
  if (exists) {
    return next(new AppError('Country with this code or slug already exists', 400));
  }

  // Handle uploaded images if any
  if (req.files) {
    if (req.files.processImage1) req.body.processImage1 = `/uploads/${req.files.processImage1[0].filename}`;
    if (req.files.processImage2) req.body.processImage2 = `/uploads/${req.files.processImage2[0].filename}`;
    if (req.files.processImage3) req.body.processImage3 = `/uploads/${req.files.processImage3[0].filename}`;
    if (req.files.processImage4) req.body.processImage4 = `/uploads/${req.files.processImage4[0].filename}`;
    if (req.files.processImage5) req.body.processImage5 = `/uploads/${req.files.processImage5[0].filename}`;
    if (req.files.documentImage) req.body.documentImage = `/uploads/${req.files.documentImage[0].filename}`;
  }

  // Parse pricingMatrix if it's sent as a stringified JSON
  if (req.body.pricingMatrix && typeof req.body.pricingMatrix === 'string') {
    try {
      req.body.pricingMatrix = JSON.parse(req.body.pricingMatrix);
    } catch (error) {}
  }

  const updatableFields = [
    'code', 'name', 'slug', 'basePrice', 'advice', 'isActive', 'sortOrder',
    'heroTitle', 'introHeading', 'docHeading', 'doc1Title', 'doc1Content', 'doc2Title', 'doc2Content', 'doc3Title', 'doc3Content', 'serviceHeading', 'service1Title', 'service1Content', 'service2Title', 'service2Content', 'service3Title', 'service3Content', 'service4Title', 'service4Content', 'metaViewTitle', 'metaKeywords', 'metaDescription',
    'processImage1', 'processImage2', 'processImage3', 'processImage4', 'processImage5', 'documentImage',
    'pricingMatrix', 'medicineCourierServices', 'documentsNeeded', 'servicesWeOffer', 'process1', 'process2', 'faq', 'faqHeading', 'faq1Q', 'faq1A', 'faq2Q', 'faq2A', 'faq3Q', 'faq3A', 'faq4Q', 'faq4A', 'faq5Q', 'faq5A', 'faq6Q', 'faq6A', 'faq7Q', 'faq7A', 'faq8Q', 'faq8A', 'faq9Q', 'faq9A', 'faq10Q', 'faq10A'
  ];

  const countryData = {};
  updatableFields.forEach(field => {
    if (req.body[field] !== undefined) {
      if (field === 'slug') {
        countryData[field] = req.body[field].toLowerCase().trim();
      } else if (field === 'code') {
        countryData[field] = req.body[field].toUpperCase().trim();
      } else {
        countryData[field] = req.body[field];
      }
    }
  });

  const country = await Country.create(countryData);

  res.status(201).json({
    success: true,
    data: country
  });
});

// @desc    Update a country (Admin only)
// @route   PUT /api/countries/:id
// @access  Private
exports.updateCountry = asyncHandler(async (req, res, next) => {
  let country = await Country.findOne({ _id: req.params.id, isDeleted: false });

  if (!country) {
    return next(new AppError(`Country not found with id of ${req.params.id}`, 404));
  }

  // Handle uploaded images if any
  if (req.files) {
    if (req.files.processImage1) req.body.processImage1 = `/uploads/${req.files.processImage1[0].filename}`;
    if (req.files.processImage2) req.body.processImage2 = `/uploads/${req.files.processImage2[0].filename}`;
    if (req.files.processImage3) req.body.processImage3 = `/uploads/${req.files.processImage3[0].filename}`;
    if (req.files.processImage4) req.body.processImage4 = `/uploads/${req.files.processImage4[0].filename}`;
    if (req.files.processImage5) req.body.processImage5 = `/uploads/${req.files.processImage5[0].filename}`;
    if (req.files.documentImage) req.body.documentImage = `/uploads/${req.files.documentImage[0].filename}`;
  }

  // Parse pricingMatrix if it's sent as a stringified JSON
  if (req.body.pricingMatrix && typeof req.body.pricingMatrix === 'string') {
    try {
      req.body.pricingMatrix = JSON.parse(req.body.pricingMatrix);
    } catch (error) {}
  }

  const updatableFields = [
    'code', 'name', 'slug', 'basePrice', 'advice', 'isActive', 'sortOrder',
    'heroTitle', 'introHeading', 'docHeading', 'doc1Title', 'doc1Content', 'doc2Title', 'doc2Content', 'doc3Title', 'doc3Content', 'serviceHeading', 'service1Title', 'service1Content', 'service2Title', 'service2Content', 'service3Title', 'service3Content', 'service4Title', 'service4Content', 'metaViewTitle', 'metaKeywords', 'metaDescription',
    'processImage1', 'processImage2', 'processImage3', 'processImage4', 'processImage5', 'documentImage',
    'pricingMatrix', 'medicineCourierServices', 'documentsNeeded', 'servicesWeOffer', 'process1', 'process2', 'faq', 'faqHeading', 'faq1Q', 'faq1A', 'faq2Q', 'faq2A', 'faq3Q', 'faq3A', 'faq4Q', 'faq4A', 'faq5Q', 'faq5A', 'faq6Q', 'faq6A', 'faq7Q', 'faq7A', 'faq8Q', 'faq8A', 'faq9Q', 'faq9A', 'faq10Q', 'faq10A',
    'popularServicesTitle', 'popularService1Text', 'popularService2Text',
    'bannerTitle', 'bannerBullet1', 'bannerBullet2', 'bannerBullet3', 'bannerBullet4',
    'docNote', 'customDutyHeading', 'customDutyDisclaimer'
  ];

  updatableFields.forEach(field => {
    if (req.body[field] !== undefined) {
      if (field === 'slug') {
        country[field] = req.body[field].toLowerCase().trim();
      } else if (field === 'code') {
        country[field] = req.body[field].toUpperCase().trim();
      } else {
        country[field] = req.body[field];
      }
    }
  });

  await country.save();

  res.status(200).json({
    success: true,
    data: country
  });
});

// @desc    Soft delete a country (Admin only)
// @route   DELETE /api/countries/:id
// @access  Private
exports.deleteCountry = asyncHandler(async (req, res, next) => {
  const country = await Country.findOne({ _id: req.params.id, isDeleted: false });

  if (!country) {
    return next(new AppError(`Country not found with id of ${req.params.id}`, 404));
  }

  country.isDeleted = true;
  country.deletedAt = Date.now();
  await country.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});
