const mongoose = require('mongoose');

/**
 * Notification Schema
 *
 * Stores in-app notifications for users (trip invites, expense updates, etc.)
 */

const notificationSchema = new mongoose.Schema(
  {
    // Recipient
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Type of notification
    type: {
      type: String,
      enum: [
        'TRIP_INVITE',         // invited to join a trip
        'MEMBER_JOINED',       // someone joined your trip
        'MEMBER_LEFT',         // someone left the trip
        'EXPENSE_ADDED',       // new expense in a trip
        'EXPENSE_UPDATED',     // expense was edited
        'CHECKLIST_COMPLETED', // checklist item completed
        'TRIP_REMINDER',       // upcoming trip reminder
        'TRIP_STARTED',        // trip started today
        'PAYMENT_REQUEST',     // someone requests payment
        'SYSTEM',              // general system message
      ],
      required: true,
    },

    // Human-readable message
    title:   { type: String, required: true, maxlength: 120 },
    message: { type: String, required: true, maxlength: 500 },

    // Reference to the relevant trip (optional)
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
    },

    // Extra data payload (e.g. inviteCode, expenseId, memberId)
    data: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Read state
    read:   { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },

    // Soft delete
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deletedAt;
        return ret;
      },
    },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ tripId: 1 });
notificationSchema.index({ deletedAt: 1 });

// ─── Instance methods ─────────────────────────────────────────────────────────

notificationSchema.methods.markRead = function () {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// ─── Static helpers ───────────────────────────────────────────────────────────

/**
 * Create a notification and save to DB.
 */
notificationSchema.statics.notify = async function ({
  userId,
  type,
  title,
  message,
  tripId = null,
  data = {},
}) {
  return this.create({ userId, type, title, message, tripId, data });
};

/**
 * Unread count for a user.
 */
notificationSchema.statics.unreadCount = function (userId) {
  return this.countDocuments({ userId, read: false, deletedAt: null });
};

module.exports = mongoose.model('Notification', notificationSchema);
