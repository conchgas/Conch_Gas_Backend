const ContactSubmission = require('../models/ContactSubmission');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Submit contact form
// @route   POST /api/contacts
// @access  Public
exports.submitContact = asyncHandler(async (req, res, next) => {
  const { fullName, email, phone, message } = req.body;
  const subject = (req.body.subject || 'Inquiry from Website').trim();

  if (!fullName || !email || !phone || !message) {
    return next(new AppError('Please fill all the required contact fields', 400));
  }

  const submission = await ContactSubmission.create({
    fullName,
    email,
    phone,
    subject,
    message
  });

  res.status(201).json({
    success: true,
    data: submission
  });
});

// @desc    Get all contact submissions
// @route   GET /api/contacts
// @access  Private
exports.getContacts = asyncHandler(async (req, res, next) => {
  const filter = { isDeleted: false };

  // Filter by status
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Search by name, email or phone
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { fullName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { subject: searchRegex }
    ];
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const total = await ContactSubmission.countDocuments(filter);
  const data = await ContactSubmission.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('repliedBy', 'name email');

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

// @desc    Get a single contact submission
// @route   GET /api/contacts/:id
// @access  Private
exports.getContact = asyncHandler(async (req, res, next) => {
  const contact = await ContactSubmission.findOne({ _id: req.params.id, isDeleted: false })
    .populate('repliedBy', 'name email');

  if (!contact) {
    return next(new AppError(`Contact submission not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Update contact status/reply
// @route   PUT /api/contacts/:id
// @access  Private
exports.updateContact = asyncHandler(async (req, res, next) => {
  let contact = await ContactSubmission.findOne({ _id: req.params.id, isDeleted: false });

  if (!contact) {
    return next(new AppError(`Contact submission not found with id of ${req.params.id}`, 404));
  }

  const { status, adminReply } = req.body;

  if (status) contact.status = status;
  
  if (adminReply !== undefined) {
    contact.adminReply = adminReply;
    contact.repliedBy = req.user.id;
    contact.repliedAt = Date.now();
    
    // Automatically transition status to 'replied' if it was unread/read
    if (contact.status === 'unread' || contact.status === 'read') {
      contact.status = 'replied';
    }
  }

  await contact.save();

  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Soft delete contact submission
// @route   DELETE /api/contacts/:id
// @access  Private
exports.deleteContact = asyncHandler(async (req, res, next) => {
  const contact = await ContactSubmission.findOne({ _id: req.params.id, isDeleted: false });

  if (!contact) {
    return next(new AppError(`Contact submission not found with id of ${req.params.id}`, 404));
  }

  contact.isDeleted = true;
  contact.deletedAt = Date.now();
  await contact.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});
