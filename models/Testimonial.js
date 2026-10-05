const mongoose = require('mongoose');

/**
 * Testimonial Model
 * Customer reviews displayed on the website.
 * Can be approved/featured by admins and ordered via sortOrder.
 */
const TestimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    country: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    review: {
      type: String,
      required: [true, 'Review text is required'],
    },
    designation: {
      type: String,
      trim: true,
    },
    date: {
      type: String,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
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

module.exports = mongoose.model('Testimonial', TestimonialSchema);
