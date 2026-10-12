const mongoose = require('mongoose');

/**
 * Order Model
 * Full shipment / order record with granular tracking history.
 * Linked to a QuoteRequest and assigned staff member.
 * trackingHistory stores every status change for timeline display.
 */
const OrderSchema = new mongoose.Schema(
  {
    bookingRef: {
      type: String,
      required: [true, 'Booking reference is required'],
      unique: true,
      trim: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    quoteRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuoteRequest',
    },

    // ── Customer & Billing details ────────────────────────────────────
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    billingCountry: {
      type: String,
      trim: true,
      default: 'Uganda',
    },
    streetAddress1: {
      type: String,
      trim: true,
    },
    streetAddress2: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    postcode: {
      type: String,
      trim: true,
    },
    orderNotes: {
      type: String,
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
    },
    customerAddress: {
      type: String,
      trim: true,
    },

    // ── Gas & Product Order details (Conch Gas) ───────────────────────
    productTitle: {
      type: String,
      trim: true,
    },
    categoryName: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    gasType: {
      type: String,
      default: 'LPG Domestic Gas',
    },
    cylinderSize: {
      type: String,
      default: '13 KG',
    },
    orderType: {
      type: String,
      enum: ['refill', 'new_cylinder', 'bulk_order', 'product_purchase', 'accessory', 'equipment', 'general'],
      default: 'refill',
    },
    cylinderExchange: {
      type: Boolean,
      default: true,
    },
    emptyCylinderBrand: {
      type: String,
    },
    deliveryArea: {
      type: String,
      default: 'Kampala Central',
    },
    deliverySlot: {
      type: String,
      default: 'Today (Express Delivery)',
    },
    paymentMethod: {
      type: String,
      enum: ['cash_on_delivery', 'mtn_momo', 'airtel_money', 'bank_transfer', 'card'],
      default: 'cash_on_delivery',
    },

    // ── Origin ────────────────────────────────────────────────────────
    originCity: {
      type: String,
      default: 'Kampala Depot (Kira Road)',
      trim: true,
    },
    originAddress: {
      type: String,
      trim: true,
    },

    // ── Destination ───────────────────────────────────────────────────
    destinationCountry: {
      type: String,
      default: 'Uganda',
      trim: true,
    },
    destinationCountryCode: {
      type: String,
      default: 'UG',
      trim: true,
    },
    destinationAddress: {
      type: String,
      required: [true, 'Destination delivery address is required'],
      trim: true,
    },
    destinationCity: {
      type: String,
      default: 'Kampala',
      trim: true,
    },

    // ── Legacy Medicine info (backward compatibility) ──────────────────
    medicineType: {
      type: String,
    },
    medicineList: [
      {
        name: { type: String },
        quantity: { type: Number },
      },
    ],
    hasPrescription: {
      type: Boolean,
      default: false,
    },

    // ── Pricing & payment ─────────────────────────────────────────────
    weight: {
      type: Number,
    },
    basePrice: {
      type: Number,
    },
    finalPrice: {
      type: Number,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded'],
      default: 'pending',
    },

    // ── Order status & tracking ───────────────────────────────────────
    status: {
      type: String,
      enum: [
        'booking_confirmed',
        'pickup_scheduled',
        'picked_up',
        'reached_warehouse',
        'photo_verified',
        'documentation_prepared',
        'packing_done',
        'customs_clearance',
        'dispatched',
        'in_transit',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'returned',
      ],
      default: 'booking_confirmed',
    },
    currentLocation: {
      type: String,
    },
    trackingHistory: [
      {
        status: { type: String },
        location: { type: String },
        description: { type: String },
        timestamp: { type: Date, default: Date.now },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],

    // ── Courier partner info ──────────────────────────────────────────
    courierPartner: {
      type: String,
    },
    courierTrackingId: {
      type: String,
    },
    estimatedDelivery: {
      type: Date,
    },
    estimatedDeliveryTime: {
      type: String,
    },
    actualDelivery: {
      type: Date,
    },

    // ── Assignment & notes ────────────────────────────────────────────
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
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

module.exports = mongoose.model('Order', OrderSchema);
