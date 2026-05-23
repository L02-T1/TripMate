const router = require('express').Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Thông báo người dùng
 */

// GET /notifications – list with unread count
router.get('/', auth, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const [notifications, unread] = await Promise.all([
      Notification.find({ userId: req.userId, deletedAt: null })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('tripId', 'name'),
      Notification.unreadCount(req.userId),
    ]);

    res.json({ notifications, unread, page, limit });
  } catch (err) {
    logger.error('GET /notifications error:', err.message);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

// PATCH /notifications/:id/read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notif = await Notification.findOne({ _id: req.params.id, userId: req.userId });
    if (!notif) return res.status(404).json({ error: 'Thông báo không tồn tại' });
    await notif.markRead();
    res.json(notif);
  } catch (err) {
    logger.error('PATCH /notifications/:id/read error:', err.message);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

// PATCH /notifications/read-all
router.patch('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, read: false, deletedAt: null },
      { read: true, readAt: new Date() }
    );
    res.json({ message: 'Đã đọc tất cả thông báo' });
  } catch (err) {
    logger.error('PATCH /notifications/read-all error:', err.message);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

// DELETE /notifications/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const notif = await Notification.findOne({ _id: req.params.id, userId: req.userId });
    if (!notif) return res.status(404).json({ error: 'Thông báo không tồn tại' });
    notif.deletedAt = new Date();
    await notif.save();
    res.json({ message: 'Đã xoá thông báo' });
  } catch (err) {
    logger.error('DELETE /notifications/:id error:', err.message);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

module.exports = router;
