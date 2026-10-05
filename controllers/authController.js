const User = require('../models/User');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Register a new customer account
// @route   POST /api/auth/customer/register
// @access  Public
exports.registerCustomer = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, customerType, address, city, companyName } = req.body;

  if (!name || !email || !password) {
    return next(new AppError('Please provide name, email, and password', 400));
  }

  // Check if user already exists with email
  const userExists = await User.findOne({ email: email.toLowerCase().trim() });
  if (userExists) {
    return next(new AppError('An account with this email already exists', 400));
  }

  // Create customer user
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    phone: phone ? phone.trim() : '',
    role: 'customer',
    customerType: customerType || 'domestic',
    companyName: companyName || '',
    address: address || '',
    city: city || 'Kampala',
    savedAddresses: address ? [{
      label: 'Home Delivery',
      street: address,
      area: city || 'Kampala',
      city: city || 'Kampala',
      isDefault: true
    }] : []
  });

  // Generate JWT token
  const token = user.getSignedJwtToken();

  res.status(201).json({
    success: true,
    message: 'Account registered successfully',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      customerType: user.customerType,
      companyName: user.companyName,
      address: user.address,
      city: user.city,
      savedAddresses: user.savedAddresses
    }
  });
});

// @desc    Register a new admin/staff user (SuperAdmin only)
// @route   POST /api/auth/register
// @access  Private/SuperAdmin
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, phone } = req.body;

  const userExists = await User.findOne({ email: email.toLowerCase().trim() });
  if (userExists) {
    return next(new AppError('User with this email already exists', 400));
  }

  const user = await User.create({
    name,
    email: email.toLowerCase().trim(),
    password,
    phone: phone || '',
    role: role || 'staff'
  });

  const token = user.getSignedJwtToken();

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// @desc    Unified Login (Customer & Admin) by Email or Phone
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, phone, loginIdentifier, password } = req.body;

  const identifier = (loginIdentifier || email || phone || '').trim();

  if (!identifier || !password) {
    return next(new AppError('Please provide email/phone and password', 400));
  }

  // Check user by email or phone
  const isEmail = identifier.includes('@');
  const query = isEmail
    ? { email: identifier.toLowerCase(), isDeleted: false }
    : { phone: identifier, isDeleted: false };

  const user = await User.findOne(query).select('+password');

  if (!user || !user.isActive) {
    return next(new AppError('Invalid email/phone or password', 401));
  }

  // Verify password hash
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new AppError('Invalid email/phone or password', 401));
  }

  // Update last login timestamp
  user.lastLogin = Date.now();
  await user.save();

  // Generate JWT token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      customerType: user.customerType,
      companyName: user.companyName,
      address: user.address,
      city: user.city,
      savedAddresses: user.savedAddresses || []
    }
  });
});

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user || user.isDeleted) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update customer profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, customerType, companyName, address, city, savedAddresses } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (name !== undefined) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (customerType !== undefined) user.customerType = customerType;
  if (companyName !== undefined) user.companyName = companyName.trim();
  if (address !== undefined) user.address = address.trim();
  if (city !== undefined) user.city = city.trim();
  if (savedAddresses !== undefined && Array.isArray(savedAddresses)) {
    user.savedAddresses = savedAddresses;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

// @desc    Get customer order history & cylinder bookings
// @route   GET /api/auth/customer/orders
// @access  Private
exports.getCustomerOrders = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Find orders placed by user ID, or matching customer email or phone
  const matchConditions = [
    { customerEmail: user.email.toLowerCase() }
  ];

  if (user.phone) {
    matchConditions.push({ customerPhone: new RegExp(user.phone.replace(/[^0-9]/g, ''), 'i') });
  }

  const orders = await Order.find({
    $or: matchConditions,
    isDeleted: false
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current and new password', 400));
  }

  const user = await User.findById(req.user.id).select('+password');

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return next(new AppError('Incorrect current password', 401));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});
