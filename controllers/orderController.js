const Order = require('../models/Order');
const QuoteRequest = require('../models/QuoteRequest');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/asyncHandler');

// Helper to sanitize payment method
function normalizePaymentMethod(method) {
  if (!method) return 'cash_on_delivery';
  const pm = String(method).toLowerCase().replace(/[\s-]+/g, '_');
  if (['cash_on_delivery', 'mtn_momo', 'airtel_money', 'bank_transfer', 'card'].includes(pm)) {
    return pm;
  }
  if (pm.includes('cash') || pm.includes('cod')) return 'cash_on_delivery';
  if (pm.includes('mtn') || pm.includes('momo')) return 'mtn_momo';
  if (pm.includes('airtel')) return 'airtel_money';
  if (pm.includes('card')) return 'card';
  if (pm.includes('bank')) return 'bank_transfer';
  return 'cash_on_delivery';
}

// @desc    Create a new order (Admin only)
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  const {
    bookingRef,
    customer,
    quoteRequest,
    customerName,
    firstName,
    lastName,
    billingCountry,
    streetAddress1,
    streetAddress2,
    city,
    state,
    postcode,
    orderNotes,
    customerEmail,
    customerPhone,
    phone,
    email,
    customerAddress,
    originCity,
    originAddress,
    destinationCountry,
    destinationCountryCode,
    destinationAddress,
    destinationCity,
    productTitle,
    categoryName,
    quantity,
    productId,
    gasType,
    cylinderSize,
    orderType,
    cylinderExchange,
    emptyCylinderBrand,
    deliveryArea,
    deliverySlot,
    paymentMethod,
    medicineType,
    medicineList,
    hasPrescription,
    weight,
    basePrice,
    finalPrice,
    paymentStatus,
    status,
    currentLocation,
    courierPartner,
    courierTrackingId,
    estimatedDelivery,
    estimatedDeliveryTime,
    notes
  } = req.body;

  const resolvedFirstName = firstName || (customerName ? customerName.split(' ')[0] : '');
  const resolvedLastName = lastName || (customerName ? customerName.split(' ').slice(1).join(' ') : '');
  const resolvedCustomerName = customerName || `${resolvedFirstName} ${resolvedLastName}`.trim() || 'Valued Customer';
  const resolvedPhone = customerPhone || phone;
  const resolvedEmail = customerEmail || email || '';
  const resolvedCountry = billingCountry || destinationCountry || 'Uganda';
  const resolvedCity = city || destinationCity || deliveryArea || 'Kampala';
  const formattedAddress = [streetAddress1, streetAddress2, resolvedCity, state, postcode, resolvedCountry].filter(Boolean).join(', ');
  const resolvedAddress = destinationAddress || customerAddress || formattedAddress || 'Kampala, Uganda';

  if (!resolvedCustomerName || !resolvedPhone || !resolvedAddress) {
    return next(new AppError('Please provide billing name, phone number, and address', 400));
  }

  // Generate bookingRef if not provided
  let finalBookingRef = bookingRef;
  if (!finalBookingRef) {
    let isUnique = false;
    while (!isUnique) {
      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      finalBookingRef = `CG-${randomDigits}`;
      const existing = await Order.findOne({ bookingRef: finalBookingRef });
      if (!existing) {
        isUnique = true;
      }
    }
  } else {
    // Check if duplicate
    const existing = await Order.findOne({ bookingRef: finalBookingRef });
    if (existing) {
      return next(new AppError(`Order with booking reference '${finalBookingRef}' already exists`, 400));
    }
  }

  // Create order
  const order = await Order.create({
    bookingRef: finalBookingRef,
    customer: customer || null,
    quoteRequest: quoteRequest || null,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    originCity: originCity || 'Kampala Depot (Kira Road)',
    originAddress,
    destinationCountry: destinationCountry || 'Uganda',
    destinationCountryCode: destinationCountryCode || 'UG',
    destinationAddress,
    destinationCity: destinationCity || 'Kampala',
    productTitle: productTitle || gasType || 'LPG Domestic Gas',
    categoryName: categoryName || '',
    quantity: Number(quantity) || 1,
    productId: productId || null,
    gasType: gasType || productTitle || 'LPG Domestic Gas',
    cylinderSize: cylinderSize || '13 KG',
    orderType: orderType || 'refill',
    cylinderExchange: cylinderExchange !== undefined ? cylinderExchange : true,
    emptyCylinderBrand: emptyCylinderBrand || '',
    deliveryArea: deliveryArea || 'Kampala Central',
    deliverySlot: deliverySlot || 'Today (Express Delivery)',
    paymentMethod: normalizePaymentMethod(paymentMethod),
    medicineType: medicineType || '',
    medicineList: medicineList || [],
    hasPrescription: hasPrescription === undefined ? false : hasPrescription,
    weight: weight || 0,
    basePrice: basePrice || 0,
    finalPrice: finalPrice || basePrice || 0,
    paymentStatus: paymentStatus || 'pending',
    status: status || 'booking_confirmed',
    currentLocation: currentLocation || originCity || 'Kampala Depot (Kira Road)',
    courierTrackingId: courierTrackingId || '',
    estimatedDelivery: estimatedDelivery || null,
    assignedTo: req.user.id,
    notes: notes || '',
    trackingHistory: [
      {
        status: status || 'booking_confirmed',
        location: currentLocation || originCity || 'Kampala Depot (Kira Road)',
        description: 'Gas cylinder order has been confirmed.',
        updatedBy: req.user.id
      }
    ]
  });

  // If order was created from a quote request, update the quote status
  if (quoteRequest) {
    await QuoteRequest.findByIdAndUpdate(quoteRequest, { status: 'confirmed' });
  }

  res.status(201).json({
    success: true,
    data: order
  });
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private
exports.getOrders = asyncHandler(async (req, res, next) => {
  const filter = { isDeleted: false };

  // Filters
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.destinationCountryCode) {
    filter.destinationCountryCode = req.query.destinationCountryCode.toUpperCase();
  }
  if (req.query.paymentStatus) {
    filter.paymentStatus = req.query.paymentStatus;
  }

  // Search by bookingRef, customerName, customerPhone, customerEmail
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { bookingRef: searchRegex },
      { customerName: searchRegex },
      { customerPhone: searchRegex },
      { customerEmail: searchRegex }
    ];
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const total = await Order.countDocuments(filter);
  const data = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('assignedTo', 'name email')
    .populate('quoteRequest');

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

// @desc    Get a single order details
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({ _id: req.params.id, isDeleted: false })
    .populate('assignedTo', 'name email')
    .populate('quoteRequest')
    .populate('trackingHistory.updatedBy', 'name email');

  if (!order) {
    return next(new AppError(`Order not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Update order general details
// @route   PUT /api/orders/:id
// @access  Private
exports.updateOrder = asyncHandler(async (req, res, next) => {
  let order = await Order.findOne({ _id: req.params.id, isDeleted: false });

  if (!order) {
    return next(new AppError(`Order not found with id of ${req.params.id}`, 404));
  }

  // Update fields except status/tracking (use status route for status changes)
  const allowedUpdates = [
    'customerName', 'customerEmail', 'customerPhone', 'customerAddress',
    'originCity', 'originAddress', 'destinationCountry', 'destinationCountryCode',
    'destinationAddress', 'destinationCity', 'medicineType', 'medicineList',
    'hasPrescription', 'weight', 'basePrice', 'finalPrice', 'paymentStatus',
    'courierPartner', 'courierTrackingId', 'estimatedDelivery', 'notes', 'assignedTo'
  ];

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      order[field] = req.body[field];
    }
  });

  await order.save();

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Update order status and append to tracking history
// @route   PUT /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, currentLocation, description } = req.body;

  if (!status) {
    return next(new AppError('Please provide status', 400));
  }

  const order = await Order.findOne({ _id: req.params.id, isDeleted: false });

  if (!order) {
    return next(new AppError(`Order not found with id of ${req.params.id}`, 404));
  }

  // Update status & location
  order.status = status;
  if (currentLocation) {
    order.currentLocation = currentLocation;
  }

  // Default description if not provided
  let trackingDescription = description;
  if (!trackingDescription) {
    const statusDescriptions = {
      booking_confirmed: 'Gas cylinder order confirmed.',
      pickup_scheduled: 'Empty cylinder exchange pickup scheduled.',
      picked_up: 'Cylinder collected from depot.',
      reached_warehouse: 'Cylinder arrived at local fulfillment station.',
      photo_verified: 'Cylinder seal & valve safety inspected.',
      documentation_prepared: 'Delivery invoice generated.',
      packing_done: 'Factory safety seal verified.',
      customs_clearance: 'Safety standards certified.',
      dispatched: 'Cylinder dispatched with delivery rider.',
      in_transit: 'On the way to your doorstep.',
      out_for_delivery: 'Driver arriving shortly at delivery address.',
      delivered: 'Cylinder delivered & installed safely.',
      cancelled: 'Order cancelled.',
      returned: 'Cylinder returned to depot.'
    };
    trackingDescription = statusDescriptions[status] || `Order status updated to ${status}.`;
  }

  // Push to history
  order.trackingHistory.push({
    status,
    location: currentLocation || order.currentLocation || 'N/A',
    description: trackingDescription,
    updatedBy: req.user.id
  });

  await order.save();

  res.status(200).json({
    success: true,
    data: order
  });
});



// @desc    Soft delete order
// @route   DELETE /api/orders/:id
// @access  Private
exports.deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({ _id: req.params.id, isDeleted: false });

  if (!order) {
    return next(new AppError(`Order not found with id of ${req.params.id}`, 404));
  }

  order.isDeleted = true;
  order.deletedAt = Date.now();
  await order.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Create a public checkout order (No auth required, but associates customer if logged in)
// @route   POST /api/orders/public
// @access  Public
exports.createPublicOrder = asyncHandler(async (req, res, next) => {
  const {
    customerName,
    firstName,
    lastName,
    billingCountry,
    streetAddress1,
    streetAddress2,
    city,
    state,
    postcode,
    orderNotes,
    customerEmail,
    customerPhone,
    phone,
    email,
    originAddress,
    originCity,
    destinationCountry,
    destinationCountryCode,
    destinationAddress,
    destinationCity,
    productTitle,
    categoryName,
    quantity,
    productId,
    gasType,
    cylinderSize,
    orderType,
    cylinderExchange,
    emptyCylinderBrand,
    deliveryArea,
    deliverySlot,
    paymentMethod,
    medicineType,
    hasPrescription,
    weight,
    basePrice,
    finalPrice,
    courierPartner,
    estimatedDeliveryTime,
    notes
  } = req.body;

  const resolvedFirstName = firstName || (customerName ? customerName.split(' ')[0] : '');
  const resolvedLastName = lastName || (customerName ? customerName.split(' ').slice(1).join(' ') : '');
  const resolvedCustomerName = customerName || `${resolvedFirstName} ${resolvedLastName}`.trim() || 'Valued Customer';
  const resolvedPhone = customerPhone || phone;
  const resolvedEmail = customerEmail || email || '';
  const resolvedCountry = billingCountry || destinationCountry || 'Uganda';
  const resolvedCity = city || destinationCity || deliveryArea || 'Kampala';
  const formattedAddress = [streetAddress1, streetAddress2, resolvedCity, state, postcode, resolvedCountry].filter(Boolean).join(', ');
  const resolvedAddress = destinationAddress || formattedAddress || 'Kampala, Uganda';

  if (!resolvedCustomerName || !resolvedPhone || !resolvedAddress) {
    return next(new AppError('Please provide billing name, phone number, and address', 400));
  }

  // Attempt to resolve logged-in customer from token if present
  let customerId = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded && decoded.id) {
        customerId = decoded.id;
      }
    } catch (e) {
      // Ignore invalid token and continue as guest
    }
  }

  // If customer not found via token, try looking up by email or phone
  if (!customerId && resolvedEmail) {
    const existingUser = await User.findOne({ email: resolvedEmail.toLowerCase().trim() });
    if (existingUser) {
      customerId = existingUser._id;
    }
  }

  // Generate unique booking reference
  let bookingRef;
  let isUnique = false;
  while (!isUnique) {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    bookingRef = `CG-${randomDigits}`;
    const existing = await Order.findOne({ bookingRef });
    if (!existing) {
      isUnique = true;
    }
  }

  const orderOriginCity = originCity || 'Kampala Depot (Kira Road)';
  const orderDestinationCountry = resolvedCountry;

  // Create public order
  const order = await Order.create({
    bookingRef,
    customer: customerId || null,
    customerName: resolvedCustomerName,
    firstName: resolvedFirstName,
    lastName: resolvedLastName,
    billingCountry: resolvedCountry,
    streetAddress1: streetAddress1 || '',
    streetAddress2: streetAddress2 || '',
    city: resolvedCity,
    state: state || '',
    postcode: postcode || '',
    orderNotes: orderNotes || '',
    customerEmail: resolvedEmail,
    customerPhone: resolvedPhone,
    originAddress: originAddress || 'Conch Gas Depot, Kira Road, Kampala',
    originCity: orderOriginCity,
    destinationCountry: orderDestinationCountry,
    destinationCountryCode: destinationCountryCode || 'UG',
    destinationAddress: resolvedAddress,
    destinationCity: resolvedCity,
    productTitle: productTitle || gasType || 'LPG Domestic Gas',
    categoryName: categoryName || '',
    quantity: Number(quantity) || 1,
    productId: productId || null,
    gasType: gasType || productTitle || 'LPG Domestic Gas',
    cylinderSize: cylinderSize || '13 KG',
    orderType: orderType || 'refill',
    cylinderExchange: cylinderExchange !== undefined ? cylinderExchange : true,
    emptyCylinderBrand: emptyCylinderBrand || '',
    deliveryArea: deliveryArea || resolvedCity || 'Kampala Central',
    deliverySlot: deliverySlot || 'Today (Express Delivery)',
    paymentMethod: normalizePaymentMethod(paymentMethod),
    medicineType: medicineType || '',
    hasPrescription: hasPrescription === undefined ? false : hasPrescription,
    weight: weight || 0,
    basePrice: basePrice || 0,
    finalPrice: finalPrice || basePrice || 0,
    paymentStatus: 'pending',
    status: 'booking_confirmed',
    currentLocation: orderOriginCity,
    notes: notes || orderNotes || '',
    trackingHistory: [
      {
        status: 'booking_confirmed',
        location: orderOriginCity,
        description: `Order confirmed for ${Number(quantity) > 1 ? `${quantity}x ` : ''}${productTitle || gasType || 'Conch Gas Product'}. Delivery dispatch assigned.`,
        timestamp: new Date()
      }
    ]
  });

  res.status(201).json({
    success: true,
    data: order
  });
});



