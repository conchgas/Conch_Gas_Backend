const mongoose = require('mongoose');

/**
 * SeoMetadata Model
 * Stores SEO meta tags, title, description, keywords, OpenGraph,
 * and canonical URLs for every public frontend page.
 */
const SeoMetadataSchema = new mongoose.Schema(
  {
    pageId: {
      type: String,
      required: [true, 'Page identifier is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    pageName: {
      type: String,
      required: [true, 'Human readable page name is required'],
      trim: true,
    },
    path: {
      type: String,
      required: [true, 'URL path is required'],
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    keywords: {
      type: String,
      trim: true,
      default: '',
    },
    canonicalUrl: {
      type: String,
      trim: true,
      default: '',
    },
    ogTitle: {
      type: String,
      trim: true,
      default: '',
    },
    ogDescription: {
      type: String,
      trim: true,
      default: '',
    },
    ogImage: {
      type: String,
      trim: true,
      default: '',
    },
    ogType: {
      type: String,
      trim: true,
      default: 'website',
    },
    isIndexable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SeoMetadata', SeoMetadataSchema);
