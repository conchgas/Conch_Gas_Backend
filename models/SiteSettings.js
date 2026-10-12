const mongoose = require('mongoose');

/**
 * SiteSettings Model
 * Singleton document storing global site configuration:
 * contact info, social links, about text, etc.
 * Only one document should exist in this collection.
 */
const SiteSettingsSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    workingHours: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    socialLinks: {
      facebook: { type: String, trim: true, default: "" },
      instagram: { type: String, trim: true, default: "" },
      twitter: { type: String, trim: true, default: "" },
      youtube: { type: String, trim: true, default: "" },
    },
    aboutText: {
      type: String,
    },
    copyright: {
      type: String,
      trim: true,
    },
    // Global Images
    processImage1: { type: String, default: "" },
    processImage2: { type: String, default: "" },
    processImage3: { type: String, default: "" },
    processImage4: { type: String, default: "" },
    processImage5: { type: String, default: "" },
    documentImage: { type: String, default: "" },
    countryHeroImage: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SiteSettings', SiteSettingsSchema);
