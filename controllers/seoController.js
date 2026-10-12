const SeoMetadata = require('../models/SeoMetadata');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/AppError');

// Default initial SEO metadata for Conch Gas pages
const DEFAULT_SEO_PAGES = [
  {
    pageId: 'home',
    pageName: 'Homepage',
    path: '/',
    title: 'Conch Gas Uganda | Fast & Safe LPG Cooking Gas Delivery Kampala',
    description: "Uganda's leading provider of safe, express LPG cooking gas cylinders, fast refills, universal exchange, and industrial gases. Order online or call for doorstep delivery.",
    keywords: 'LPG gas Uganda, cooking gas Kampala, gas refill Kampala, Conch Gas, 6kg gas, 13kg gas, 45kg gas cylinder, industrial gas Uganda, gas delivery',
    canonicalUrl: 'https://conchgas.com/',
    ogTitle: 'Conch Gas Uganda | Fast & Safe LPG Cooking Gas Delivery',
    ogDescription: "Safe & Express LPG cooking gas delivery to your doorstep across Kampala and Wakiso. Refill 6kg, 13kg, 45kg cylinders with universal empty exchange.",
    ogImage: 'https://conchgas.com/hero.jpg',
    ogType: 'website',
    isIndexable: true
  },
  {
    pageId: 'about',
    pageName: 'About Us',
    path: '/about.htm',
    title: 'About Conch Gas | Leading LPG Gas Supplier & Safety Standards in Uganda',
    description: 'Learn about Conch Gas Uganda, our corporate vision, safety standards, cylinder manufacturing quality, and dedicated customer delivery network.',
    keywords: 'about Conch Gas, LPG supplier Uganda, cooking gas company Kampala, gas safety standards, Conch Gas director',
    canonicalUrl: 'https://conchgas.com/about.htm',
    ogTitle: 'About Conch Gas | Leading LPG Gas Supplier in Uganda',
    ogDescription: 'Committed to affordable, reliable, and 100% safe cooking gas distribution throughout Uganda.',
    ogImage: 'https://conchgas.com/hero.jpg',
    ogType: 'website',
    isIndexable: true
  },
  {
    pageId: 'products',
    pageName: 'Products Catalog',
    path: '/products',
    title: 'LPG Cylinders, Accessories & Industrial Gas Products | Conch Gas',
    description: 'Explore the full Conch Gas product range: 6kg, 13kg, 45kg LPG cylinders, gas regulators, double burner stoves, EP-2 lubricants, and industrial gases.',
    keywords: 'LPG cylinders, gas stoves Kampala, gas regulators, cooking gas accessories, EP2 grease, industrial gases, argon gas, medical oxygen',
    canonicalUrl: 'https://conchgas.com/products',
    ogTitle: 'Products Catalog | Conch Gas Cylinders & Accessories',
    ogDescription: 'Genuine, certified LPG cylinders, stoves, pressure regulators, and industrial gases with doorstep delivery.',
    ogImage: 'https://conchgas.com/hero.jpg',
    ogType: 'website',
    isIndexable: true
  },
  {
    pageId: 'gas-refills',
    pageName: 'Gas Refills',
    path: '/gas-refills',
    title: 'Express Cooking Gas Refills | 6kg, 13kg, 45kg Cylinders | Conch Gas',
    description: 'Running low on gas? Order genuine factory-sealed gas refills with universal empty cylinder exchange and express doorstep delivery in Kampala.',
    keywords: 'gas refill, cooking gas refill Kampala, LPG cylinder exchange, gas cylinder swap, fast gas delivery',
    canonicalUrl: 'https://conchgas.com/gas-refills',
    ogTitle: 'Express Gas Refills | Conch Gas Uganda',
    ogDescription: 'Instant doorstep cooking gas refill delivery. Universal cylinder exchange accepted across all major brands.',
    ogImage: 'https://conchgas.com/hero.jpg',
    ogType: 'website',
    isIndexable: true
  },
  {
    pageId: 'contact',
    pageName: 'Contact Us',
    path: '/contact.htm',
    title: 'Contact Conch Gas Uganda | Gas Orders, Hotline & Support',
    description: 'Get in touch with Conch Gas customer care. Call our toll-free lines, WhatsApp for instant cylinder delivery, or visit our main hub on Kira Road, Kampala.',
    keywords: 'contact Conch Gas, gas helpline Kampala, Conch Gas phone number, Kira road gas depot, order gas WhatsApp',
    canonicalUrl: 'https://conchgas.com/contact.htm',
    ogTitle: 'Contact Conch Gas Uganda | Customer Support & Hotlines',
    ogDescription: 'Call or WhatsApp us for instant gas delivery, billing inquiries, or dealer partnerships in Uganda.',
    ogImage: 'https://conchgas.com/hero.jpg',
    ogType: 'website',
    isIndexable: true
  },
  {
    pageId: 'calculator',
    pageName: 'Price Calculator',
    path: '/calculator.htm',
    title: 'Check Gas Prices & Calculate Delivery Cost | Conch Gas Uganda',
    description: 'Calculate live LPG gas prices, refill charges, new connection costs, and delivery timeline across Kampala, Entebbe, and Wakiso.',
    keywords: 'gas price calculator, LPG cost Kampala, refill price check, cylinder rate Uganda, Conch Gas calculator',
    canonicalUrl: 'https://conchgas.com/calculator.htm',
    ogTitle: 'Gas Price Calculator | Conch Gas Uganda',
    ogDescription: 'Instant quote and price estimate for cooking gas refills and new cylinder connections.',
    ogImage: 'https://conchgas.com/hero.jpg',
    ogType: 'website',
    isIndexable: true
  }
];

// Helper to seed defaults if collection is empty
const seedDefaultsIfEmpty = async () => {
  const count = await SeoMetadata.countDocuments();
  if (count === 0) {
    await SeoMetadata.insertMany(DEFAULT_SEO_PAGES);
  }
};

// @desc    Get all pages SEO metadata
// @route   GET /api/seo
// @access  Public
exports.getAllSeo = asyncHandler(async (req, res) => {
  await seedDefaultsIfEmpty();
  const list = await SeoMetadata.find().sort({ createdAt: 1 });
  
  // Format as both array and map by pageId / path for easy consumption
  const map = {};
  list.forEach(item => {
    map[item.pageId] = item;
    map[item.path] = item;
  });

  res.status(200).json({
    success: true,
    count: list.length,
    data: list,
    map
  });
});

// @desc    Get SEO for a single page
// @route   GET /api/seo/:pageId
// @access  Public
exports.getSeoByPage = asyncHandler(async (req, res, next) => {
  await seedDefaultsIfEmpty();
  const { pageId } = req.params;
  const item = await SeoMetadata.findOne({ pageId: pageId.toLowerCase() });

  if (!item) {
    return next(new AppError(`SEO metadata for page '${pageId}' not found`, 404));
  }

  res.status(200).json({
    success: true,
    data: item
  });
});

// @desc    Create or update SEO metadata for a page (Admin only)
// @route   PUT /api/seo/:pageId
// @access  Private (Admin)
exports.updateSeoByPage = asyncHandler(async (req, res, next) => {
  const { pageId } = req.params;
  const updateData = req.body;

  let item = await SeoMetadata.findOne({ pageId: pageId.toLowerCase() });

  if (item) {
    item = await SeoMetadata.findOneAndUpdate(
      { pageId: pageId.toLowerCase() },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  } else {
    item = await SeoMetadata.create({
      pageId: pageId.toLowerCase(),
      ...updateData
    });
  }

  res.status(200).json({
    success: true,
    message: `SEO metadata for '${item.pageName || pageId}' updated successfully`,
    data: item
  });
});

// @desc    Reset all pages to default Conch Gas SEO
// @route   POST /api/seo/reset-defaults
// @access  Private (Admin)
exports.resetDefaults = asyncHandler(async (req, res) => {
  await SeoMetadata.deleteMany({});
  const seeded = await SeoMetadata.insertMany(DEFAULT_SEO_PAGES);

  res.status(200).json({
    success: true,
    message: 'SEO metadata successfully reset to Conch Gas defaults',
    count: seeded.length,
    data: seeded
  });
});
