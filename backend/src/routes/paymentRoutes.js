const express = require('express');
const router = express.Router();
const {
  createBill,
  getIncomeByApartment,
  getIncomeByFloor,
  getFinancialByFloor,
  getApartmentsInDebt,
  getApartmentFinancialSummary,
  getBuildingFinancialSummary
} = require('../controllers/paymentController');

/**
 * @swagger
 * tags:
 *   name: Payments & Financial
 *   description: Quản lý hóa đơn, thanh toán và thống kê tài chính tòa nhà
 */

/**
 * @swagger
 * /api/payments/bills:
 *   post:
 *     summary: Lập hóa đơn tháng cho một căn hộ
 *     tags: [Payments & Financial]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - apt_id
 *               - period
 *             properties:
 *               apt_id:
 *                 type: string
 *                 example: "A101"
 *               period:
 *                 type: string
 *                 description: Kỳ hóa đơn (YYYY-MM)
 *                 example: "2025-12"
 *               electric:
 *                 type: number
 *               water:
 *                 type: number
 *               service:
 *                 type: number
 *               vehicles:
 *                 type: number
 *               pre_debt:
 *                 type: number
 *                 description: Nợ kỳ trước chuyển sang
 *               total:
 *                 type: number
 *                 description: Tổng tiền kỳ này (tính tự động hoặc truyền vào)
 *     responses:
 *       201:
 *         description: Lập hóa đơn thành công
 */
router.post('/bills', createBill);

/**
 * @swagger
 * /api/payments/income-by-apartment:
 *   get:
 *     summary: Thống kê tổng đã thu của từng căn hộ (sắp xếp giảm dần, phân trang)
 *     tags: [Payments & Financial]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Danh sách căn hộ theo tổng tiền đã thanh toán
 */
router.get('/income-by-apartment', getIncomeByApartment);

/**
 * @swagger
 * /api/payments/income-by-floor:
 *   get:
 *     summary: Thống kê tổng đã thu theo từng tầng
 *     tags: [Payments & Financial]
 *     responses:
 *       200:
 *         description: Tổng tiền đã thu theo tầng (sắp xếp tăng dần)
 */
router.get('/income-by-floor', getIncomeByFloor);

/**
 * @swagger
 * /api/payments/financial-by-floor:
 *   get:
 *     summary: Thống kê tài chính đầy đủ theo tầng (đã thu, phải thu, nợ hiện tại, tỷ lệ thu)
 *     tags: [Payments & Financial]
 *     responses:
 *       200:
 *         description: Báo cáo chi tiết tài chính từng tầng
 */
router.get('/financial-by-floor', getFinancialByFloor);

/**
 * @swagger
 * /api/payments/debt-apartments:
 *   get:
 *     summary: Danh sách các căn hộ đang nợ (sắp xếp theo nợ giảm dần, phân trang)
 *     tags: [Payments & Financial]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Danh sách căn hộ có nợ (dựa trên kỳ mới nhất)
 */
router.get('/debt-apartments', getApartmentsInDebt);

/**
 * @swagger
 * /api/payments/apartments/{apt_id}/financial-summary:
 *   get:
 *     summary: Xem chi tiết tài chính của một căn hộ cụ thể
 *     tags: [Payments & Financial]
 *     parameters:
 *       - in: path
 *         name: apt_id
 *         required: true
 *         schema:
 *           type: string
 *         example: "A101"
 *     responses:
 *       200:
 *         description: Tổng phải thu, đã thu, nợ hiện tại và chi tiết từng kỳ
 */
router.get('/apartments/:apt_id/financial-summary', getApartmentFinancialSummary);

/**
 * @swagger
 * /api/payments/building-summary:
 *   get:
 *     summary: Thống kê tài chính tổng quan toàn tòa nhà
 *     tags: [Payments & Financial]
 *     responses:
 *       200:
 *         description: Tổng thu, tổng phải thu, tổng nợ hiện tại, số căn nợ, tỷ lệ nợ...
 */
router.get('/building-summary', getBuildingFinancialSummary);

module.exports = router;