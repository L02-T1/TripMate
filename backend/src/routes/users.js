const router = require('express').Router();
const auth   = require('../middleware/auth');
const ctrl   = require('../controllers/usersController');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Tìm kiếm người dùng
 */

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Tìm người dùng theo số điện thoại, email, hoặc từ khoá
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: phone
 *         schema: { type: string }
 *         description: Số điện thoại chính xác
 *       - in: query
 *         name: email
 *         schema: { type: string }
 *         description: Email chính xác
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Từ khoá tìm kiếm (tên, email, phone)
 *     responses:
 *       200: { description: Thông tin người dùng hoặc danh sách }
 *       404: { description: Không tìm thấy }
 */
router.get('/search', auth, ctrl.searchUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Xem profile công khai của người dùng
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Profile người dùng }
 *       404: { description: Không tìm thấy }
 */
router.get('/:id', auth, ctrl.getPublicProfile);

module.exports = router;
