const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/tripController');

/**
 * @swagger
 * tags:
 *   name: Trips
 *   description: Quản lý chuyến đi
 */

// ── Trips ─────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /trips:
 *   get:
 *     summary: Lấy danh sách chuyến đi của người dùng
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Danh sách chuyến đi }
 */
router.get('/', auth, ctrl.getTrips);

/**
 * @swagger
 * /trips/join:
 *   post:
 *     summary: Tham gia chuyến đi qua mã mời
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 */
router.post('/join', auth, ctrl.joinTrip);

/**
 * @swagger
 * /trips/{id}:
 *   get:
 *     summary: Lấy chi tiết một chuyến đi
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Chi tiết chuyến đi }
 *       404: { description: Không tìm thấy }
 */
router.get('/:id', auth, ctrl.getTripById);

/**
 * @swagger
 * /trips:
 *   post:
 *     summary: Tạo chuyến đi mới
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               startDate: { type: string }
 *               endDate: { type: string }
 *               description: { type: string }
 *               destinations: { type: array, items: { type: string } }
 *               memberPhones: { type: array, items: { type: string } }
 *     responses:
 *       201: { description: Chuyến đi đã được tạo }
 */
router.post(
  '/',
  auth,
  [body('name').trim().notEmpty().withMessage('Tên chuyến đi là bắt buộc')],
  validate,
  ctrl.createTrip
);

router.patch('/:id', auth, ctrl.updateTrip);
router.delete('/:id', auth, ctrl.deleteTrip);

// ── Members ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /trips/{id}/members:
 *   post:
 *     summary: Thêm thành viên vào chuyến đi bằng số điện thoại
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/members', auth, ctrl.addMember);
router.delete('/:id/members/:memberId', auth, ctrl.removeMember);
router.patch('/:id/members/:memberId/promote', auth, ctrl.promoteMember);

// ── Activities ────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /trips/{id}/activities:
 *   get:
 *     summary: Lấy danh sách hoạt động
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/activities', auth, ctrl.getActivities);
router.post('/:id/activities', auth, ctrl.addActivity);
router.patch('/:id/activities/:actId', auth, ctrl.updateActivity);
router.delete('/:id/activities/:actId', auth, ctrl.deleteActivity);

// ── Checklist ─────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /trips/{id}/checklist:
 *   get:
 *     summary: Lấy checklist của chuyến đi
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/checklist', auth, ctrl.getChecklist);
router.post('/:id/checklist', auth, ctrl.addChecklistItem);
router.patch('/:id/checklist/:itemId', auth, ctrl.updateChecklistItem);
router.delete('/:id/checklist/:itemId', auth, ctrl.deleteChecklistItem);

// ── Expenses ──────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /trips/{id}/expenses:
 *   get:
 *     summary: Lấy danh sách chi phí
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/expenses', auth, ctrl.getExpenses);
router.post('/:id/expenses', auth, ctrl.addExpense);
router.patch('/:id/expenses/:expId', auth, ctrl.updateExpense);
router.delete('/:id/expenses/:expId', auth, ctrl.deleteExpense);

/**
 * @swagger
 * /trips/{id}/expense-report:
 *   get:
 *     summary: Báo cáo quyết toán chi phí
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/expense-report', auth, ctrl.getExpenseReport);

module.exports = router;