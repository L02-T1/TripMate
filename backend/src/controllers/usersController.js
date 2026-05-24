const User   = require('../models/User');
const logger = require('../utils/logger');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip sensitive fields before returning to other users */
function publicProfile(user) {
  return {
    id:       user._id || user.id,
    username: user.username,
    phone:    user.phone,
    email:    user.email,
    avatar:   user.avatar || null,
    bio:      user.bio    || '',
    location: user.location || '',
  };
}

// ─── GET /users/search ────────────────────────────────────────────────────────
// Query params: phone | email | q (generic keyword)
//
// - Exact phone  → returns single object or 404
// - Exact email  → returns single object or 404
// - q (keyword)  → returns array (max 10), searches username + email + phone
//
exports.searchUsers = async (req, res) => {
  try {
    const { phone, email, q } = req.query;

    // ── Exact phone lookup ──────────────────────────────────────────────────
    if (phone) {
      logger.info(`[Users] searchUsers by phone: ${phone} | caller=${req.userId}`);
      // Normalise: strip spaces/dashes
      const normalised = phone.replace(/[\s\-]/g, '');

      const user = await User.findOne({
        deletedAt: null,
        $or: [{ phone: normalised }, { phone: phone.trim() }],
      });

      if (!user) {
        logger.warn(`[Users] phone not found: ${phone}`);
        return res.status(404).json({ error: 'Không tìm thấy người dùng với số điện thoại này' });
      }

      // Don't expose caller's own record differently
      return res.json(publicProfile(user));
    }

    // ── Exact email lookup ──────────────────────────────────────────────────
    if (email) {
      logger.info(`[Users] searchUsers by email: ${email} | caller=${req.userId}`);

      const user = await User.findOne({
        deletedAt: null,
        email: email.trim().toLowerCase(),
      });

      if (!user) {
        logger.warn(`[Users] email not found: ${email}`);
        return res.status(404).json({ error: 'Không tìm thấy người dùng với email này' });
      }

      return res.json(publicProfile(user));
    }

    // ── Generic keyword search ──────────────────────────────────────────────
    if (q) {
      if (q.trim().length < 2) {
        return res.status(400).json({ error: 'Từ khoá tìm kiếm phải có ít nhất 2 ký tự' });
      }
      logger.info(`[Users] searchUsers keyword: "${q}" | caller=${req.userId}`);

      const regex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

      const users = await User.find({
        deletedAt: null,
        _id: { $ne: req.userId }, // exclude self
        $or: [
          { username: regex },
          { email:    regex },
          { phone:    regex },
        ],
      }).limit(10);

      return res.json(users.map(publicProfile));
    }

    // ── No params ───────────────────────────────────────────────────────────
    logger.warn(`[Users] searchUsers called with no params | caller=${req.userId}`);
    return res.status(400).json({ error: 'Vui lòng cung cấp phone, email hoặc q để tìm kiếm' });

  } catch (err) {
    logger.error('[Users] searchUsers error:', err.message);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};

// ─── GET /users/:id ───────────────────────────────────────────────────────────

exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, deletedAt: null });
    if (!user) {
      logger.warn(`[Users] getPublicProfile not found: ${req.params.id}`);
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }
    logger.info(`[Users] getPublicProfile: ${req.params.id}`);
    res.json(publicProfile(user));
  } catch (err) {
    logger.error('[Users] getPublicProfile error:', err.message);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};
