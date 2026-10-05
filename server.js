require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

// Route files
const authRoutes = require('./routes/authRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const contactRoutes = require('./routes/contactRoutes');
const orderRoutes = require('./routes/orderRoutes');
const countryRoutes = require('./routes/countryRoutes');
const locationRoutes = require('./routes/locationRoutes');
const blogRoutes = require('./routes/blogRoutes');
const faqRoutes = require('./routes/faqRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const homepageRoutes = require('./routes/homepageRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const providerRoutes = require('./routes/providerRoutes');
const refundPolicyRoutes = require('./routes/refundPolicyRoutes');
const privacyPolicyRoutes = require('./routes/privacyPolicyRoutes');

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Enable CORS
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:5173'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith('.vercel.app') || 
                      origin.endsWith('.run.app') || 
                      origin.includes('conchgas.com') || 
                      origin.startsWith('http://localhost:') || 
                      origin.startsWith('http://127.0.0.1:') || 
                      origin.startsWith('http://192.168.');
                      
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Set security headers
app.use(helmet({
  crossOriginResourcePolicy: false // Allow static files like uploads to be loaded across origins
}));

// Serve static uploads folder for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/refund-policy', refundPolicyRoutes);
app.use('/api/privacy-policy', privacyPolicyRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Courier Medicines REST API. Reference API documentation for endpoints.'
  });
});

// Serve robots.txt & sitemap.xml for SEO crawlers
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\n\nSitemap: https://couriermedicines.com/sitemap.xml`);
});

app.get('/sitemap.xml', (req, res) => {
  const sitemapPath = path.join(__dirname, '../courier-medicine/public/sitemap.xml');
  const fs = require('fs');
  if (fs.existsSync(sitemapPath)) {
    res.type('application/xml');
    res.sendFile(sitemapPath);
  } else {
    res.status(404).send('Sitemap not found');
  }
});

app.get('/googlef5645ebef820ac0a.html', (req, res) => {
  res.type('text/html');
  res.send('google-site-verification: googlef5645ebef820ac0a.html');
});

// Catch-all route (404)
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  connectDB();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Error: ${err.message}`);
});
