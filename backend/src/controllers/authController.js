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
    if (!email) return res.status(400).json({ error: 'Email duoc yeu cau' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user) {
      const crypto = require('crypto');

      // 1. Tao reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken   = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 gio
      await user.save({ validateBeforeSave: false });

      // 2. Gui email qua Resend
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

      try {
        let ResendClass = null;
        try {
          ResendClass = require('resend').Resend;
        } catch (e) {
          logger.warn('[Auth] resend package not installed - email skipped');
        }

        if (!process.env.RESEND_API_KEY) {
          logger.warn('[Auth] RESEND_API_KEY not set - reset token: ' + resetToken);
        } else if (ResendClass) {
          const resend = new ResendClass(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: 'TripMate <onboarding@resend.dev>',
            to: email,
            subject: 'Dat lai mat khau TripMate',
            html: `
              <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
                <h2 style="color:#1B4F8A">TripMate</h2>
                <h3>Ban da yeu cau dat lai mat khau</h3>
                <p style="color:#6B7280">Nhan vao nut ben duoi de dat lai mat khau. Link se het han sau <strong>1 gio</strong>.</p>
                <a href="${resetUrl}"
                  style="display:inline-block;background:#1B4F8A;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;margin:24px 0;">
                  Dat lai mat khau
                </a>
                <p style="color:#9CA3AF;font-size:13px;">Neu ban khong yeu cau viec nay, hay bo qua email nay.</p>
                <hr style="border:none;border-top:1px solid #F3F4F6;margin:24px 0"/>
                <p style="color:#9CA3AF;font-size:12px;">TripMate - Travel Smart, Spend Wisely</p>
              </div>
            `,
          });
          logger.info('[Auth] Password reset email sent to: ' + email);
        }
      } catch (emailErr) {
        logger.error('[Auth] forgotPassword email error:', emailErr.message);
      }
    }

    // Luon tra 200 — khong tiet lo email co ton tai hay khong (bao mat)
    res.json({ message: 'Neu email ton tai, ban se nhan duoc huong dan trong vai phut.' });
  } catch (err) {
    logger.error('[Auth] forgotPassword error:', err.message);
    res.status(500).json({ error: 'Loi he thong' });
  }
};

// POST /auth/reset-password  (dung token tu email)
exports.resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;
    if (!token || !email || !newPassword) {
      return res.status(400).json({ error: 'Thieu thong tin' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Mat khau moi phai it nhat 6 ky tu' });
    }

    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordToken:   hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+password +resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ error: 'Token khong hop le hoac da het han' });
    }

    user.password             = newPassword;  // bcrypt hash tu dong qua pre-save hook
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    logger.info(`[Auth] Password reset successful for: ${email}`);
    res.json({ message: 'Mat khau da duoc cap nhat thanh cong' });
  } catch (err) {
    logger.error('[Auth] resetPassword error:', err.message);
    res.status(500).json({ error: 'Loi he thong' });
  }
};