const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Xác thực người dùng
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, username, phone, password]
 *             properties:
 *               email: { type: string, example: user@email.com }
 *               username: { type: string, example: Nguyen Van A }
 *               phone: { type: string, example: "+84901234567" }
 *               password: { type: string, example: Password@123 }
 *     responses:
 *       201: { description: Đăng ký thành công }
 *       409: { description: Email hoặc SĐT đã tồn tại }
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('username').trim().isLength({ min: 2 }).withMessage('Tên tối thiểu 2 ký tự'),
    body('phone').trim().notEmpty().withMessage('Số điện thoại là bắt buộc'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu ít nhất 6 ký tự'),
  ],
  validate,
  ctrl.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [emailOrPhone, password]
 *             properties:
 *               emailOrPhone: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Đăng nhập thành công, trả về token }
 *       401: { description: Thông tin đăng nhập sai }
 */
router.post(
  '/login',
  [
    body('emailOrPhone').trim().notEmpty().withMessage('Email hoặc SĐT là bắt buộc'),
    body('password').notEmpty().withMessage('Mật khẩu là bắt buộc'),
  ],
  validate,
  ctrl.login
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Thông tin người dùng }
 */
router.get('/me', auth, ctrl.me);

/**
 * @swagger
 * /auth/profile:
 *   patch:
 *     summary: Cập nhật hồ sơ cá nhân
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/profile', auth, ctrl.updateProfile);

/**
 * @swagger
 * /auth/password:
 *   patch:
 *     summary: Đổi mật khẩu
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/password', auth, ctrl.changePassword);

/**
 * @swagger
 * /auth/account:
 *   delete:
 *     summary: Xoá tài khoản
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/account', auth, ctrl.deleteAccount);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Quen mat khau - gui email dat lai
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, example: user@email.com }
 *     responses:
 *       200: { description: Email da gui }
 */
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Email khong hop le')],
  validate,
  ctrl.forgotPassword
);

module.exports = router;

// Alias: frontend calls POST /auth/change-password
router.post('/change-password', auth, ctrl.changePassword);