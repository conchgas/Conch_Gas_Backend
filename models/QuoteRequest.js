const mongoose = require('mongoose');

/**
 * QuoteRequest Model
 * Captures submissions from the homepage calculator / quote form.
 * Each request gets a unique booking reference and flows through
 * a status pipeline: new → contacted → quoted → confirmed | rejected.
 */
const QuoteRequestSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: [true, 'Country code is required'],
      trim: true,
    },
    countryName: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location / city ID is required'],
      trim: true,
    },
    locationName: {
      type: String,
      trim: true,
    },
    gasType: {
      type: String,
      trim: true,
      default: 'LPG Cooking Gas',
    },
    medicineType: {
      type: String,
      trim: true,
      default: 'LPG Cooking Gas',
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    hasPrescription: {
      type: String,
      enum: ['YES', 'NO'],
      default: 'YES',
    },
    estimatedPrice: {
      type: Number,
    },
    estimatedTimeline: {
      type: String,
    },
    bookingRef: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null values while enforcing uniqueness
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'quoted', 'confirmed', 'rejected'],
      default: 'new',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
    },
    source: {
      type: String,
      default: 'website',
    },

    // Soft-delete fields
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('QuoteRequest', QuoteRequestSchema);
