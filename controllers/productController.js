const Product = require('../models/Product');
const Category = require('../models/Category');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Get all products (with category filter, search & pagination)
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res) => {
  const { category, search, all } = req.query;
  const filter = all === 'true' ? {} : { isActive: true };

  if (category) {
    filter.categorySlug = category.toLowerCase();
  }

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { title: searchRegex },
      { desc: searchRegex },
      { categoryName: searchRegex }
    ];
  }

  const products = await Product.find(filter).sort({ order: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

const mongoose = require('mongoose');

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
exports.getProductBySlug = asyncHandler(async (req, res, next) => {
  const param = req.params.slug;
  const isId = mongoose.isValidObjectId(param);
  const filter = isId 
    ? { $or: [{ slug: param.toLowerCase() }, { _id: param }] } 
    : { slug: param.toLowerCase() };

  const product = await Product.findOne(filter);

  if (!product) {
    return next(new AppError(`Product with slug '${req.params.slug}' not found`, 404));
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Create product (Admin only)
// @route   POST /api/products
// @access  Private (Admin)
exports.createProduct = asyncHandler(async (req, res, next) => {
  const {
    title,
    slug,
    categorySlug,
    categoryName,
    price,
    originalPrice,
    weight,
    desc,
    images,
    inStock,
    isBestSeller,
    weightGuarantee,
    unbsCertified,
    customBadges,
    customBadge,
    specifications,
    order,
    isActive
  } = req.body;

  if (!title || !categorySlug) {
    return next(new AppError('Please provide product title and category', 400));
  }

  const generatedSlug = (slug || title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const existing = await Product.findOne({ slug: generatedSlug });
  if (existing) {
    return next(new AppError(`Product with slug '${generatedSlug}' already exists`, 400));
  }

  // Look up category for ID & proper name
  const cat = await Category.findOne({ slug: categorySlug.toLowerCase() });

  // Sanitize images array (up to 5 images)
  const safeImages = Array.isArray(images)
    ? images.filter(Boolean).slice(0, 5)
    : (images ? [images] : ['/conch_logo.webp']);

  // Sanitize customBadges array
  const safeCustomBadges = Array.isArray(customBadges)
    ? customBadges.map(b => String(b).trim()).filter(Boolean)
    : (customBadge ? [String(customBadge).trim()] : []);

  const product = await Product.create({
    title,
    slug: generatedSlug,
    category: cat ? cat._id : null,
    categorySlug: categorySlug.toLowerCase(),
    categoryName: categoryName || (cat ? cat.name : categorySlug),
    price: Number(price) || 0,
    originalPrice: Number(originalPrice) || 0,
    weight: weight || '',
    desc: desc || '',
    images: safeImages.length > 0 ? safeImages : ['/conch_logo.webp'],
    inStock: inStock !== undefined ? Boolean(inStock) : true,
    isBestSeller: Boolean(isBestSeller),
    weightGuarantee: weightGuarantee !== undefined ? Boolean(weightGuarantee) : true,
    unbsCertified: unbsCertified !== undefined ? Boolean(unbsCertified) : true,
    customBadges: safeCustomBadges,
    customBadge: customBadge ? String(customBadge).trim() : (safeCustomBadges.length > 0 ? safeCustomBadges[0] : ''),
    specifications: specifications || [],
    order: Number(order) || 0,
    isActive: isActive !== undefined ? Boolean(isActive) : true
  });

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product
  });
});

// @desc    Update product (Admin only)
// @route   PUT /api/products/:id
// @access  Private (Admin)
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError(`Product not found with id ${req.params.id}`, 404));
  }

  const updateData = { ...req.body };

  if (updateData.title && !updateData.slug) {
    updateData.slug = updateData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  if (updateData.categorySlug) {
    updateData.categorySlug = updateData.categorySlug.toLowerCase();
    const cat = await Category.findOne({ slug: updateData.categorySlug });
    if (cat) {
      updateData.category = cat._id;
      if (!updateData.categoryName) updateData.categoryName = cat.name;
    }
  }

  if (updateData.images && Array.isArray(updateData.images)) {
    updateData.images = updateData.images.filter(Boolean).slice(0, 5);
  }

  if (updateData.customBadges && Array.isArray(updateData.customBadges)) {
    updateData.customBadges = updateData.customBadges.map(b => String(b).trim()).filter(Boolean);
    if (!updateData.customBadge && updateData.customBadges.length > 0) {
      updateData.customBadge = updateData.customBadges[0];
    }
  }

  if (updateData.weightGuarantee !== undefined) {
    updateData.weightGuarantee = Boolean(updateData.weightGuarantee);
  }

  if (updateData.unbsCertified !== undefined) {
    updateData.unbsCertified = Boolean(updateData.unbsCertified);
  }

  product = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: product
  });
});

// @desc    Delete product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private (Admin)
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError(`Product not found with id ${req.params.id}`, 404));
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
    data: {}
  });
});
