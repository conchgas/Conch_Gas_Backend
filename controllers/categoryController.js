const Category = require('../models/Category');
const Product = require('../models/Product');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Get all active categories (with product count)
// @route   GET /api/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
  const isAdmin = req.query.all === 'true';
  const filter = isAdmin ? {} : { isActive: true };

  const categories = await Category.find(filter).sort({ order: 1, createdAt: 1 });
  
  // Attach product counts to each category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => {
      const productCount = await Product.countDocuments({
        categorySlug: cat.slug,
        isActive: true
      });
      return {
        ...cat.toObject(),
        productCount
      };
    })
  );

  res.status(200).json({
    success: true,
    count: categoriesWithCounts.length,
    data: categoriesWithCounts
  });
});

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
exports.getCategoryBySlug = asyncHandler(async (req, res, next) => {
  const category = await Category.findOne({ slug: req.params.slug.toLowerCase() });

  if (!category) {
    return next(new AppError(`Category with slug '${req.params.slug}' not found`, 404));
  }

  const productCount = await Product.countDocuments({ categorySlug: category.slug, isActive: true });

  res.status(200).json({
    success: true,
    data: {
      ...category.toObject(),
      productCount
    }
  });
});

// @desc    Create category (Admin only)
// @route   POST /api/categories
// @access  Private (Admin)
exports.createCategory = asyncHandler(async (req, res, next) => {
  const { name, slug, description, order, icon, isActive } = req.body;

  if (!name) {
    return next(new AppError('Category name is required', 400));
  }

  const generatedSlug = (slug || name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const existing = await Category.findOne({ slug: generatedSlug });
  if (existing) {
    return next(new AppError(`Category with slug '${generatedSlug}' already exists`, 400));
  }

  const category = await Category.create({
    name,
    slug: generatedSlug,
    description: description || '',
    order: Number(order) || 0,
    icon: icon || '',
    isActive: isActive !== undefined ? isActive : true
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category
  });
});

// @desc    Update category (Admin only)
// @route   PUT /api/categories/:id
// @access  Private (Admin)
exports.updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError(`Category not found with id ${req.params.id}`, 404));
  }

  const oldSlug = category.slug;
  const updateData = { ...req.body };

  if (updateData.name && !updateData.slug) {
    updateData.slug = updateData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  category = await Category.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  // If slug changed, update all products under this category
  if (updateData.slug && updateData.slug !== oldSlug) {
    await Product.updateMany(
      { categorySlug: oldSlug },
      { categorySlug: updateData.slug, categoryName: category.name }
    );
  }

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: category
  });
});

// @desc    Delete category (Admin only)
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError(`Category not found with id ${req.params.id}`, 404));
  }

  // Delete all products in this category or unassign them
  await Product.deleteMany({ categorySlug: category.slug });
  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Category and its associated products deleted successfully',
    data: {}
  });
});
