const QuoteRequest = require('../models/QuoteRequest');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Create a quote request (Public calculator)
// @route   POST /api/quotes
// @access  Public
exports.createQuote = asyncHandler(async (req, res, next) => {
  const { country, countryName, location, locationName, medicineType, gasType, gasLabel, mobile, phone, hasPrescription, notes } = req.body;

  const resolvedMobile = (mobile || phone || '').trim();
  if (!resolvedMobile) {
    return next(new AppError('Please provide mobile number for your gas quote', 400));
  }

  const resolvedCountry = (country || 'UG').toUpperCase();
  const resolvedLocation = location || locationName || 'Kampala';
  const resolvedGasType = gasType || gasLabel || medicineType || 'LPG Cooking Gas';

  let basePrice = 48000;

  let estimatedPrice = Math.round(req.body.estimatedPrice || req.body.price || basePrice);

  // Generate Conch Gas booking reference (CG-XXXXXX)
  let bookingRef;
  let isUnique = false;
  while (!isUnique) {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    bookingRef = `CG-${randomDigits}`;
    const existing = await QuoteRequest.findOne({ bookingRef });
    if (!existing) {
      isUnique = true;
    }
  }

  const estimatedTimeline = req.body.estimatedTimeline || 'Express Delivery';

  // Save to database
  const quote = await QuoteRequest.create({
    country: resolvedCountry,
    countryName: countryName || 'Uganda',
    location: resolvedLocation,
    locationName: locationName || resolvedLocation,
    gasType: resolvedGasType,
    medicineType: resolvedGasType,
    mobile: resolvedMobile,
    email: req.body.email ? String(req.body.email).trim().toLowerCase() : '',
    hasPrescription: hasPrescription || 'YES',
    estimatedPrice,
    estimatedTimeline,
    bookingRef,
    status: 'new',
    source: 'website',
    notes: notes || `Gas Quote: ${resolvedGasType}`
  });

  res.status(201).json({
    success: true,
    data: quote
  });
});

// @desc    Get all quotes (Admin only)
// @route   GET /api/quotes
// @access  Private
exports.getQuotes = asyncHandler(async (req, res, next) => {
  const filter = { isDeleted: false };

  // Filtering by status
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Search by mobile or bookingRef
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { mobile: searchRegex },
      { bookingRef: searchRegex },
      { countryName: searchRegex },
      { locationName: searchRegex }
    ];
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const total = await QuoteRequest.countDocuments(filter);
  const data = await QuoteRequest.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('assignedTo', 'name email');

  res.status(200).json({
    success: true,
    count: data.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data
  });
});

// @desc    Get a single quote
// @route   GET /api/quotes/:id
// @access  Private
exports.getQuote = asyncHandler(async (req, res, next) => {
  const quote = await QuoteRequest.findOne({ _id: req.params.id, isDeleted: false })
    .populate('assignedTo', 'name email');

  if (!quote) {
    return next(new AppError(`Quote not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: quote
  });
});

// @desc    Update quote status/notes
// @route   PUT /api/quotes/:id
// @access  Private
exports.updateQuote = asyncHandler(async (req, res, next) => {
  let quote = await QuoteRequest.findOne({ _id: req.params.id, isDeleted: false });

  if (!quote) {
    return next(new AppError(`Quote not found with id of ${req.params.id}`, 404));
  }

  // Fields to update
  const { status, notes, assignedTo } = req.body;

  if (status) quote.status = status;
  if (notes !== undefined) quote.notes = notes;
  if (assignedTo) quote.assignedTo = assignedTo;

  await quote.save();

  res.status(200).json({
    success: true,
    data: quote
  });
});

// @desc    Delete quote (soft delete)
// @route   DELETE /api/quotes/:id
// @access  Private
exports.deleteQuote = asyncHandler(async (req, res, next) => {
  const quote = await QuoteRequest.findOne({ _id: req.params.id, isDeleted: false });

  if (!quote) {
    return next(new AppError(`Quote not found with id of ${req.params.id}`, 404));
  }

  quote.isDeleted = true;
  quote.deletedAt = Date.now();
  await quote.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});
