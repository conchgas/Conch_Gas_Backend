const Location = require('../models/Location');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Get all active locations (Public)
// @route   GET /api/locations
// @access  Public
exports.getLocations = asyncHandler(async (req, res, next) => {
  const filter = { isDeleted: false };

  // Public gets only active, admin can see all
  if (!req.query.all || req.query.all !== 'true') {
    filter.isActive = true;
  }

  // Filter by country if provided
  if (req.query.country) {
    filter.country = req.query.country;
  }

  // Check if pagination is specifically requested or limit is set
  if (req.query.page || (req.query.limit && req.query.limit !== '1000')) {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const skip = (page - 1) * limit;

    const total = await Location.countDocuments(filter);
    const locations = await Location.find(filter)
      .sort({ city: 1, name: 1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: locations.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      data: locations
    });
  }

  const locations = await Location.find(filter).sort({ city: 1, name: 1 });

  res.status(200).json({
    success: true,
    count: locations.length,
    total: locations.length,
    data: locations
  });
});

// @desc    Get single location by slug (Public)
// @route   GET /api/locations/:slug
// @access  Public
exports.getLocationBySlug = asyncHandler(async (req, res, next) => {
  const location = await Location.findOne({ slug: req.params.slug.toLowerCase(), isDeleted: false });

  if (!location) {
    return next(new AppError(`Location not found with slug of ${req.params.slug}`, 404));
  }

  res.status(200).json({
    success: true,
    data: location
  });
});

// @desc    Get all locations for a specific city (Public)
// @route   GET /api/locations/city/:city
// @access  Public
exports.getLocationsByCity = asyncHandler(async (req, res, next) => {
  const cityQuery = req.params.city.toLowerCase().trim();
  const filter = {
    city: { $regex: new RegExp(`^${cityQuery}$`, 'i') },
    isDeleted: false
  };

  if (!req.query.all || req.query.all !== 'true') {
    filter.isActive = true;
  }

  const locations = await Location.find(filter).sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: locations.length,
    data: locations
  });
});

// @desc    Create a location (Admin only)
// @route   POST /api/locations
// @access  Private
exports.createLocation = asyncHandler(async (req, res, next) => {
  const { locationId, city, country, name, slug } = req.body;

  if (!locationId || !city || !country || !name || !slug) {
    return next(new AppError('Please provide locationId, city, country, name, and slug', 400));
  }

  const slugLower = slug.toLowerCase().trim();

  // Check if exists
  const exists = await Location.findOne({
    $or: [{ locationId }, { slug: slugLower }],
    isDeleted: false
  });

  if (exists) {
    return next(new AppError('Location with this locationId or slug already exists', 400));
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
    'locationId', 'city', 'country', 'name', 'slug', 'isActive',
    'metaViewTitle', 'metaKeywords', 'metaDescription',
    'processImage1', 'processImage2', 'processImage3', 'processImage4', 'processImage5', 'documentImage',
    'pricingMatrix', 'introHeading', 'medicineCourierServices', 'docHeading', 'documentsNeeded', 'serviceHeading', 'servicesWeOffer', 'pickupServiceTitle', 'pickupServiceContent', 'procurementServiceTitle', 'procurementServiceContent', 'processHeading', 'process1Title', 'process1', 'process2Title', 'process2', 'faq', 'faqHeading', 'faq1Q', 'faq1A', 'faq2Q', 'faq2A', 'faq3Q', 'faq3A', 'faq4Q', 'faq4A', 'faq5Q', 'faq5A', 'faq6Q', 'faq6A', 'faq7Q', 'faq7A', 'faq8Q', 'faq8A', 'faq9Q', 'faq9A', 'faq10Q', 'faq10A'
  ];

  const locationData = {};
  updatableFields.forEach(field => {
    if (req.body[field] !== undefined) {
      if (field === 'slug') {
        locationData[field] = req.body[field].toLowerCase().trim();
      } else {
        locationData[field] = req.body[field];
      }
    }
  });
  
  if (locationData.isActive === undefined) {
    locationData.isActive = true;
  }

  const location = await Location.create(locationData);

  res.status(201).json({
    success: true,
    data: location
  });
});

// @desc    Update a location (Admin only)
// @route   PUT /api/locations/:id
// @access  Private
exports.updateLocation = asyncHandler(async (req, res, next) => {
  let location = await Location.findOne({ _id: req.params.id, isDeleted: false });

  if (!location) {
    return next(new AppError(`Location not found with id of ${req.params.id}`, 404));
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

  // Parse pricingMatrix if it's sent as a stringified JSON (common in FormData)
  if (req.body.pricingMatrix && typeof req.body.pricingMatrix === 'string') {
    try {
      req.body.pricingMatrix = JSON.parse(req.body.pricingMatrix);
    } catch (error) {
      // If parsing fails, just leave it as is or ignore it
    }
  }

  const updatableFields = [
    'locationId', 'city', 'country', 'name', 'slug', 'isActive',
    'metaViewTitle', 'metaKeywords', 'metaDescription',
    'processImage1', 'processImage2', 'processImage3', 'processImage4', 'processImage5', 'documentImage',
    'pricingMatrix', 'introHeading', 'medicineCourierServices', 'docHeading', 'documentsNeeded', 'serviceHeading', 'servicesWeOffer', 'pickupServiceTitle', 'pickupServiceContent', 'procurementServiceTitle', 'procurementServiceContent', 'processHeading', 'process1Title', 'process1', 'process2Title', 'process2', 'faq', 'faqHeading', 'faq1Q', 'faq1A', 'faq2Q', 'faq2A', 'faq3Q', 'faq3A', 'faq4Q', 'faq4A', 'faq5Q', 'faq5A', 'faq6Q', 'faq6A', 'faq7Q', 'faq7A', 'faq8Q', 'faq8A', 'faq9Q', 'faq9A', 'faq10Q', 'faq10A'
  ];

  updatableFields.forEach(field => {
    if (req.body[field] !== undefined) {
      if (field === 'slug') {
        location[field] = req.body[field].toLowerCase().trim();
      } else {
        location[field] = req.body[field];
      }
    }
  });

  await location.save();

  res.status(200).json({
    success: true,
    data: location
  });
});

// @desc    Soft delete a location (Admin only)
// @route   DELETE /api/locations/:id
// @access  Private
exports.deleteLocation = asyncHandler(async (req, res, next) => {
  const location = await Location.findOne({ _id: req.params.id, isDeleted: false });

  if (!location) {
    return next(new AppError(`Location not found with id of ${req.params.id}`, 404));
  }

  location.isDeleted = true;
  location.deletedAt = Date.now();
  await location.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});
