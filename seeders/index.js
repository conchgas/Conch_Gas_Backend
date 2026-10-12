require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Import active models
const Testimonial = require('../models/Testimonial');
const SiteSettings = require('../models/SiteSettings');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

const defaultTestimonials = [
  {
    name: 'AMITA MILGLORIA',
    title: 'GENUINE QUALITY',
    rating: 5,
    country: 'Uganda',
    avatar: 'AM',
    review: "I'm genuinely impressed with C-gas, they consistently deliver on time with prompt & dependable service backed by a friendly team. The gas they deliver meets high safety & purity standards. I highly recommend them.",
    designation: 'Verified Customer',
    date: 'Posted recently',
    isApproved: true,
    isFeatured: false,
    sortOrder: 1
  },
  {
    name: 'SENYONDO ADAM',
    title: 'EXCELLENT SERVICE',
    rating: 5,
    country: 'Uganda',
    avatar: 'SA',
    review: 'I appreciate the excellent service from Conch Gas Ltd. They are always reliable, deliver on time, and provide quality gas for my store. Their customer care is professional and friendly. I highly recommend their services.',
    designation: 'Store Owner',
    date: 'Posted recently',
    isApproved: true,
    isFeatured: true,
    sortOrder: 2
  },
  {
    name: 'MBAGA SHABAN',
    title: 'EXCELLENT MANAGEMENT',
    rating: 5,
    country: 'Uganda',
    avatar: 'MS',
    review: 'Thank you so much Conch Gas Ltd staffs and management for the gas services, deliveries are swift and timely. Ordered for a refill on a Sunday and yes it was delivered. I will forever remain a loyal customer.',
    designation: 'Verified Customer',
    date: 'Posted recently',
    isApproved: true,
    isFeatured: false,
    sortOrder: 3
  },
  {
    name: 'KASOZI BRIAN',
    title: 'FAST & SAFE DELIVERY',
    rating: 5,
    country: 'Uganda',
    avatar: 'KB',
    review: 'Conch Gas provides genuine weight cylinders and very prompt delivery in Kampala. The cylinder seal was intact and the technician helped connect and test for leaks properly.',
    designation: 'Verified Customer',
    date: 'Posted 1 week ago',
    isApproved: true,
    isFeatured: false,
    sortOrder: 4
  },
  {
    name: 'NANKUNDA GRACE',
    title: 'BEST LPG SUPPLIER IN UGANDA',
    rating: 5,
    country: 'Uganda',
    avatar: 'NG',
    review: 'Their customer care is always on point. Ordering refills through WhatsApp is seamless and they deliver promptly right to my kitchen.',
    designation: 'Verified Customer',
    date: 'Posted 2 weeks ago',
    isApproved: true,
    isFeatured: false,
    sortOrder: 5
  }
];

const importData = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB for Conch Gas Seeding...');

    // 1. Seed / Update Site Settings
    console.log('Seeding Conch Gas site settings...');
    const existingSettings = await SiteSettings.findOne();
    const conchSettingsData = {
      companyName: 'Conch Gas Limited',
      siteTitle: 'Conch Gas Limited | LPG & Industrial Gas Supplier Kampala Uganda',
      tagline: 'Reliable, Safe & Fast LPG & Industrial Gas Solutions in Uganda',
      aboutText: 'Conch Gas Ltd is a part of Conch Group Limited and brings over 15 years of industry excellence in premium LPG cooking gas and industrial cylinders across Uganda.',
      address: 'Plot 155, Kira Road near Kira Road Police Station, P.O. Box 26105 Kampala, Uganda',
      phone: '+256 776 500 786',
      whatsapp: '+256 776 500 786',
      email: 'info@conchgas.com',
      workingHours: 'Mon - Sun: 07:00 - 21:00',
      copyright: 'Copyright (c) 2025 Conch Gas Limited - All Rights Reserved.',
      socialLinks: {
        facebook: 'https://facebook.com/conchgas',
        instagram: 'https://instagram.com/conchgas',
        twitter: 'https://twitter.com/conchgas',
        youtube: 'https://youtube.com/conchgas'
      }
    };

    if (existingSettings) {
      Object.assign(existingSettings, conchSettingsData);
      await existingSettings.save();
    } else {
      await SiteSettings.create(conchSettingsData);
    }
    console.log('Site settings ready.');

    // 2. Seed Default SuperAdmin
    console.log('Checking default Conch Gas superadmin user...');
    const adminExists = await User.findOne({ email: 'admin@conchgas.com' });
    if (!adminExists) {
      await User.create({
        name: 'Conch Gas Admin',
        email: 'admin@conchgas.com',
        password: 'admin123',
        role: 'superadmin',
        isActive: true
      });
      console.log('Default superadmin created: admin@conchgas.com / admin123');
    } else {
      console.log('Superadmin user already exists.');
    }

    // 3. Seed Testimonials
    const testimonialCount = await Testimonial.countDocuments();
    if (testimonialCount === 0) {
      console.log('Seeding initial Conch Gas testimonials...');
      await Testimonial.insertMany(defaultTestimonials);
      console.log('Testimonials seeded.');
    } else {
      console.log(`Testimonials exist (${testimonialCount} found).`);
    }

    console.log('CONCH GAS DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Conch Gas database:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    console.log('Purging database settings and testimonials...');
    await Testimonial.deleteMany();
    await SiteSettings.deleteMany();
    console.log('Database settings & testimonials purged.');
    process.exit(0);
  } catch (error) {
    console.error('Error purging database:', error);
    process.exit(1);
  }
};

if (process.argv.includes('--destroy')) {
  destroyData();
} else {
  importData();
}
