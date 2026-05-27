const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ── Auth fields ──────────────────────────────────────────────────────────
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
    },
    username: {
      type: String,
      required: [true, 'Tên người dùng là bắt buộc'],
      trim: true,
      minlength: [2, 'Tên phải ít nhất 2 ký tự'],
      maxlength: [50, 'Tên tối đa 50 ký tự'],
    },
    phone: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Mật khẩu là bắt buộc'],
      minlength: [6, 'Mật khẩu ít nhất 6 ký tự'],
      select: false,   // never returned by default
    },
    resetPasswordToken:   { type: String, select: false },
    resetPasswordExpires: { type: Date,   select: false },

    // ── Profile ──────────────────────────────────────────────────────────────
    bio:             { type: String, maxlength: 300, default: '' },
    location:        { type: String, maxlength: 100 },
    birthday:        { type: String },                    // DD/MM/YYYY
    gender:          { type: String, enum: ['male', 'female', 'other', null], default: null },
    job:             { type: String, maxlength: 80 },
    avatar:          { type: String },                    // URL or base64

    // ── Payment / QR ─────────────────────────────────────────────────────────
    bankName:        { type: String, maxlength: 60 },
    bankAccount:     { type: String, maxlength: 30 },
    bankQRImage:     { type: String },                    // URL

    // ── App settings ─────────────────────────────────────────────────────────
    language:        { type: String, default: 'vi', enum: ['vi', 'en'] },
    currency:        { type: String, default: 'VND' },
    defaultLocation: { type: String },
    darkMode:        { type: Boolean, default: false },
    dateFormat:      { type: String, default: 'DD/MM/YYYY' },

    // ── Push notifications ───────────────────────────────────────────────────
    pushToken:            { type: String },
    notificationsEnabled: { type: Boolean, default: true },

    // ── Account state ────────────────────────────────────────────────────────
    isVerified:   { type: Boolean, default: false },
    lastLoginAt:  { type: Date },
    deletedAt:    { type: Date, default: null },    // soft delete
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.deletedAt;
        return ret;
      },
    },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ deletedAt: 1 });

// ─── Hooks ────────────────────────────────────────────────────────────────────

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);   // increased from 10 to 12
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance methods ─────────────────────────────────────────────────────────

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ─── Static methods ───────────────────────────────────────────────────────────

/**
 * Find an active (non-deleted) user by email or phone, including the password field.
 */
userSchema.statics.findByEmailOrPhone = function (value) {
  return this.findOne({
    deletedAt: null,
    $or: [
      { email: value.toLowerCase() },
      { phone: value },
    ],
  }).select('+password');
};

/**
 * Find an active user by phone (for member lookup).
 */
userSchema.statics.findByPhone = function (phone) {
  return this.findOne({ phone, deletedAt: null });
};

module.exports = mongoose.model('User', userSchema);