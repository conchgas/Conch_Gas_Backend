const ContactSubmission = require('../models/ContactSubmission');
const ContactHeader = require('../models/ContactHeader');
const ContactSection = require('../models/ContactSection');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Submit contact form
// @route   POST /api/contacts
// @access  Public
exports.submitContact = asyncHandler(async (req, res, next) => {
  const { fullName, email, phone, subject, message } = req.body;

  if (!fullName || !email || !phone || !subject || !message) {
    return next(new AppError('Please fill all the contact fields', 400));
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

// @desc    Get Contact page header configuration (Public)
// @route   GET /api/contacts/header
// @access  Public
exports.getContactHeader = asyncHandler(async (req, res, next) => {
  let header = await ContactHeader.findOne();

  // Create default header if not exists
  if (!header) {
    header = await ContactHeader.create({
      title: "Contact Us",
      subtitle: "Have questions about shipping prescription drugs internationally? Get in touch with our team.",
      bgImage: "https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&w=1600&q=80"
    });
  }

  res.status(200).json({
    success: true,
    data: header
  });
});

// @desc    Update Contact page header configuration (Admin only)
// @route   PUT /api/contacts/header
// @access  Private (Admin)
exports.updateContactHeader = asyncHandler(async (req, res, next) => {
  const { title, subtitle, bgImage } = req.body;

  let header = await ContactHeader.findOne();

  if (!header) {
    header = new ContactHeader();
  }

  if (title !== undefined) header.title = title;
  if (subtitle !== undefined) header.subtitle = subtitle;
  if (bgImage !== undefined) header.bgImage = bgImage;

  await header.save();

  res.status(200).json({
    success: true,
    data: header
  });
});

// @desc    Get all active Contact page sections (Public)
// @route   GET /api/contacts/sections
// @access  Public
exports.getContactSections = asyncHandler(async (req, res, next) => {
  let sections = await ContactSection.find({ isActive: true }).sort({ sortOrder: 1 });

  // Self-seed on first load if empty
  if (sections.length === 0) {
    const defaultSections = [
      {
        key: "contact-hero",
        name: "Contact Page Hero Banner",
        title: "Contact Us",
        subtitle: "Home » Contact",
        sortOrder: 1,
        isActive: true,
        content: {
          bgImage: "https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&w=1600&q=80"
        }
      },
      {
        key: "contact-intro",
        name: "Contact Intro & Details",
        title: "Get in Touch With Us",
        subtitle: "Contact Conch Gas for its services via the phone number and email provided below, or you can reach our physical location using the address provided below.",
        sortOrder: 2,
        isActive: true,
        content: {
          officeTitle: "Physical Location",
          address: "Plot 155, Kira Road near Kira Road Police Station P.O.Box 26105 Kampala- Uganda",
          emailTitle: "Direct Email Inquiry",
          email: "sales@conchgas.com",
          emails: ["sales@conchgas.com", "info@conchgas.com"],
          phoneTitle: "Direct Phone Lines",
          phone: "+256 200 900 010",
          phones: ["+256 200 900 010", "+256 776 500 786", "+256 703 978 198"],
          hoursTitle: "Schedule",
          hours: "Mon - Sun: 8:00 am - 18:00 pm",
          schedule: [
            { day: "Monday", hours: "8:00 am - 18:00 pm" },
            { day: "Tuesday", hours: "8:00 am - 18:00 pm" },
            { day: "Wednesday", hours: "8:00 am - 18:00 pm" },
            { day: "Thursday", hours: "8:00 am - 18:00 pm" },
            { day: "Friday", hours: "8:00 am - 18:00 pm" },
            { day: "Saturday", hours: "8:00 am - 18:00 pm" },
            { day: "Sunday", hours: "8:00 am - 18:00 pm" }
          ]
        }
      },
      {
        key: "contact-map",
        name: "Office Location Map",
        title: "Visit Our Physical Location",
        subtitle: "Conveniently located at Plot 155, Kira Road near Kira Road Police Station, Kampala - Uganda.",
        sortOrder: 3,
        isActive: true,
        content: {
          mapEmbedUrl: "https://maps.google.com/maps?q=Plot%20155%2C%20Kira%20Road%20near%20Kira%20Road%20Police%20Station%20Kampala%2C%20Uganda&t=&z=15&ie=UTF8&iwloc=&output=embed"
        }
      }
    ];
    await ContactSection.insertMany(defaultSections);
    sections = await ContactSection.find({ isActive: true }).sort({ sortOrder: 1 });
  }

  res.status(200).json({
    success: true,
    count: sections.length,
    data: sections
  });
});

// @desc    Get all Contact sections for admin builder (Admin only)
// @route   GET /api/contacts/sections/admin
// @access  Private (Admin)
exports.getContactSectionsAdmin = asyncHandler(async (req, res, next) => {
  let sections = await ContactSection.find().sort({ sortOrder: 1 });

  // Self-seed if empty
  if (sections.length === 0) {
    const defaultSections = [
      {
        key: "contact-hero",
        name: "Contact Page Hero Banner",
        title: "Contact Us",
        subtitle: "Home » Contact",
        sortOrder: 1,
        isActive: true,
        content: {
          bgImage: "https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&w=1600&q=80"
        }
      },
      {
        key: "contact-intro",
        name: "Contact Intro & Details",
        title: "Get in Touch With Us",
        subtitle: "Contact Conch Gas for its services via the phone number and email provided below, or you can reach our physical location using the address provided below.",
        sortOrder: 2,
        isActive: true,
        content: {
          officeTitle: "Physical Location",
          address: "Plot 155, Kira Road near Kira Road Police Station P.O.Box 26105 Kampala- Uganda",
          emailTitle: "Direct Email Inquiry",
          email: "sales@conchgas.com",
          emails: ["sales@conchgas.com", "info@conchgas.com"],
          phoneTitle: "Direct Phone Lines",
          phone: "+256 200 900 010",
          phones: ["+256 200 900 010", "+256 776 500 786", "+256 703 978 198"],
          hoursTitle: "Schedule",
          hours: "Mon - Sun: 8:00 am - 18:00 pm",
          schedule: [
            { day: "Monday", hours: "8:00 am - 18:00 pm" },
            { day: "Tuesday", hours: "8:00 am - 18:00 pm" },
            { day: "Wednesday", hours: "8:00 am - 18:00 pm" },
            { day: "Thursday", hours: "8:00 am - 18:00 pm" },
            { day: "Friday", hours: "8:00 am - 18:00 pm" },
            { day: "Saturday", hours: "8:00 am - 18:00 pm" },
            { day: "Sunday", hours: "8:00 am - 18:00 pm" }
          ]
        }
      },
      {
        key: "contact-map",
        name: "Office Location Map",
        title: "Visit Our Physical Location",
        subtitle: "Conveniently located at Plot 155, Kira Road near Kira Road Police Station, Kampala - Uganda.",
        sortOrder: 3,
        isActive: true,
        content: {
          mapEmbedUrl: "https://maps.google.com/maps?q=Plot%20155%2C%20Kira%20Road%20near%20Kira%20Road%20Police%20Station%20Kampala%2C%20Uganda&t=&z=15&ie=UTF8&iwloc=&output=embed"
        }
      }
    ];
    await ContactSection.insertMany(defaultSections);
    sections = await ContactSection.find().sort({ sortOrder: 1 });
  }

  res.status(200).json({
    success: true,
    count: sections.length,
    data: sections
  });
});

// @desc    Update a contact section (Admin only)
// @route   PUT /api/contacts/sections/:key
// @access  Private (Admin)
exports.updateContactSection = asyncHandler(async (req, res, next) => {
  const { key } = req.params;
  const { title, subtitle, content, sortOrder, isActive, metaViewTitle, metaKeywords, metaDescription } = req.body;

  let section = await ContactSection.findOne({ key: key.toLowerCase().trim() });

  if (!section) {
    return next(new AppError(`Contact section not found with key of ${key}`, 404));
  }

  if (title !== undefined) section.title = title;
  if (subtitle !== undefined) section.subtitle = subtitle;
  if (content !== undefined) section.content = content;
  if (sortOrder !== undefined) section.sortOrder = sortOrder;
  if (isActive !== undefined) section.isActive = isActive;
  if (metaViewTitle !== undefined) section.metaViewTitle = metaViewTitle;
  if (metaKeywords !== undefined) section.metaKeywords = metaKeywords;
  if (metaDescription !== undefined) section.metaDescription = metaDescription;

  await section.save();

  res.status(200).json({
    success: true,
    data: section
  });
});
