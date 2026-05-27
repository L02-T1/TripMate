const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'tripmate_secret_key_2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// POST /auth/register
exports.register = async (req, res) => {
  try {
    const { email, username, phone, password } = req.body;
    if (!email || !username || !phone || !password) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase(), deletedAt: null });
    if (existingEmail) return res.status(409).json({ error: 'Email đã được sử dụng' });

    const existingPhone = await User.findOne({ phone, deletedAt: null });
    if (existingPhone) return res.status(409).json({ error: 'Số điện thoại đã được sử dụng' });

    const user = await User.create({ email, username, phone, password });
    const token = signToken(user._id);

    logger.info(`[Auth] New user registered: ${email}`);
    res.status(201).json({ token, user });
  } catch (err) {
    logger.error('[Auth] Register error:', err.message);
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors)[0].message;
      return res.status(400).json({ error: msg });
    }
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};

// POST /auth/login
exports.login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập email/số điện thoại và mật khẩu' });
    }

    const user = await User.findByEmailOrPhone(emailOrPhone);
    if (!user) {
      logger.warn(`[Auth] Login attempt – user not found: ${emailOrPhone}`);
      return res.status(401).json({ error: 'Tài khoản không tồn tại' });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      logger.warn(`[Auth] Login attempt – wrong password: ${emailOrPhone}`);
      return res.status(401).json({ error: 'Mật khẩu không đúng' });
    }

    // Track last login
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    logger.info(`[Auth] Login: ${user.email}`);
    res.json({ token, user });
  } catch (err) {
    logger.error('[Auth] Login error:', err.message);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};

// GET /auth/me
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.deletedAt) return res.status(404).json({ error: 'Người dùng không tồn tại' });
    res.json(user);
  } catch (err) {
    logger.error('[Auth] me error:', err.message);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};

// PATCH /auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const allowed = [
      'username', 'bio', 'location', 'birthday', 'gender', 'job', 'avatar',
      'bankName', 'bankAccount', 'bankQRImage', 'language', 'currency',
      'defaultLocation', 'darkMode', 'dateFormat', 'notificationsEnabled', 'pushToken',
    ];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ error: 'Người dùng không tồn tại' });

    logger.info(`[Auth] Profile updated: userId=${req.userId}`);
    res.json(user);
  } catch (err) {
    logger.error('[Auth] updateProfile error:', err.message);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};

// PATCH /auth/password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu mới ít nhất 6 ký tự' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'Mật khẩu mới phải khác mật khẩu hiện tại' });
    }

    const user = await User.findById(req.userId).select('+password');
    if (!user) return res.status(404).json({ error: 'Người dùng không tồn tại' });

    const ok = await user.comparePassword(currentPassword);
    if (!ok) return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' });

    user.password = newPassword;
    await user.save();

    logger.info(`[Auth] Password changed: userId=${req.userId}`);
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    logger.error('[Auth] changePassword error:', err.message);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};

// DELETE /auth/account  (soft delete)
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Người dùng không tồn tại' });

    user.deletedAt = new Date();
    await user.save({ validateBeforeSave: false });

    // Soft-delete trips owned by this user
    const Trip = require('../models/Trip');
    await Trip.updateMany({ userId: req.userId, deletedAt: null }, { deletedAt: new Date() });

    logger.info(`[Auth] Account soft-deleted: userId=${req.userId}`);
    res.json({ message: 'Tài khoản đã được xoá' });
  } catch (err) {
    logger.error('[Auth] deleteAccount error:', err.message);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};

// POST /auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email la bat buoc' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user) {
      // Generate a simple reset token (in production: send via email service)
      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken   = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save({ validateBeforeSave: false });

      // TODO: plug in an email service (nodemailer, SendGrid, Resend...)
      // For now: log the token so it can be used in development
      logger.info(`[Auth] Password reset token for ${email}: ${resetToken}`);
    }

    // Always return 200 — never reveal whether email exists (security)
    res.json({ message: 'Neu email ton tai, ban se nhan duoc huong dan trong vai phut.' });
  } catch (err) {
    logger.error('[Auth] forgotPassword error:', err.message);
    res.status(500).json({ error: 'Loi he thong' });
  }
};