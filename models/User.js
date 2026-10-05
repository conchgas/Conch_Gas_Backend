const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * User Model
 * Represents admin/staff users who manage the dashboard.
 * Supports role-based access, password hashing, and JWT auth.
 */
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false, // Don't return password by default in queries
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'staff', 'customer'],
      default: 'customer',
    },
    customerType: {
      type: String,
      enum: ['domestic', 'commercial', 'industrial'],
      default: 'domestic',
    },
    companyName: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: 'Kampala',
    },
    savedAddresses: [
      {
        label: { type: String, default: 'Home' }, // Home, Office, Kitchen, Factory
        street: { type: String, default: '' },
        area: { type: String, default: '' },
        city: { type: String, default: 'Kampala' },
        landmark: { type: String, default: '' },
        isDefault: { type: Boolean, default: false }
      }
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
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

// ---------------------------------------------------------------------------
// Pre-save hook — hash password before saving (only if modified)
// ---------------------------------------------------------------------------
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ---------------------------------------------------------------------------
// Instance method — compare entered password with hashed password in DB
// ---------------------------------------------------------------------------
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ---------------------------------------------------------------------------
// Instance method — generate a signed JWT token
// ---------------------------------------------------------------------------
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET || 'courier-med-secret-key-2026-change-in-production', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

module.exports = mongoose.model('User', UserSchema);
