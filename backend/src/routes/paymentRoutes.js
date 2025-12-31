const express = require('express');
const router = express.Router();
const {
  getIncomeByApartment,
  getIncomeByFloor,
  getFinancialByFloor,
  getApartmentsInDebt,
  getApartmentFinancialSummary,
  getBuildingFinancialSummary,
  getIncomeByPeriod,
  getFeeBreakdown,
  comparePeriodsFinancial,
  getCollectionRateByPeriod,
  getPeriodSummary
} = require('../controllers/paymentController');

/**
 * @swagger
 * tags:
 *   name: Payments & Financial
 *   description: Quản lý thanh toán và thống kê tài chính tòa nhà (hóa đơn hiện tại lưu trong bảng bills)
 */

/**
 * @swagger
 * /api/payments/income-by-apartment:
 *   get:
 *     summary: Thống kê tổng tiền đã thu của từng căn hộ (sắp xếp giảm dần theo tiền thu)
 *     tags: [Payments & Financial]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: Danh sách căn hộ kèm tổng tiền đã thanh toán từ lịch sử
 */
router.get('/income-by-apartment', getIncomeByApartment);

/**
 * @swagger
 * /api/payments/income-by-floor:
 *   get:
 *     summary: Thống kê tổng tiền đã thu theo từng tầng
 *     tags: [Payments & Financial]
 *     responses:
 *       200:
 *         description: Tổng tiền đã thu theo tầng (sắp xếp theo số tầng tăng dần)
 */
router.get('/income-by-floor', getIncomeByFloor);

/**
 * @swagger
 * /api/payments/financial-by-floor:
 *   get:
 *     summary: Thống kê tài chính chi tiết theo tầng
 *     tags: [Payments & Financial]
 *     responses:
 *       200:
 *         description: Báo cáo dựa trên hóa đơn hiện tại (bảng bills)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       floor:
 *                         type: integer
 *                         nullable: true
 *                       display:
 *                         type: string
 *                         example: "Tầng 5"
 *                       total_paid:
 *                         type: number
 *                         description: "Tổng đã thu từ trước đến nay"
 *                       total_due_current:
 *                         type: number
 *                         description: "Tổng phải thu kỳ hiện tại (mới + nợ cũ)"
 *                       current_pre_debt:
 *                         type: number
 *                         description: "Tổng nợ cũ mang sang (pre_debt)"
 *                       collection_rate:
 *                         type: string
 *                         example: "85.50%"
 */
router.get('/financial-by-floor', getFinancialByFloor);

/**
 * @swagger
 * /api/payments/debt-apartments:
 *   get:
 *     summary: Danh sách các căn hộ đang nợ (pre_debt > 0)
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
 *         description: Danh sách căn hộ có nợ, sắp xếp giảm dần theo số tiền nợ
 */
router.get('/debt-apartments', getApartmentsInDebt);

/**
 * @swagger
 * /api/payments/apartments/{apt_id}/financial-summary:
 *   get:
 *     summary: Chi tiết tài chính của một căn hộ cụ thể
 *     tags:
 *       - Payments & Financial
 *     parameters:
 *       - in: path
 *         name: apt_id
 *         required: true
 *         schema:
 *           type: string
 *         description: "Mã căn hộ (ví dụ: A101)"
 *     responses:
 *       200:
 *         description: Thông tin hóa đơn hiện tại và lịch sử thanh toán
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     apt_id:
 *                       type: string
 *                     new_charges_current:
 *                       type: number
 *                       description: "Các khoản phát sinh mới kỳ này"
 *                     pre_debt:
 *                       type: number
 *                       description: "Nợ cũ mang sang"
 *                     total_due_current:
 *                       type: number
 *                       description: "Tổng phải trả kỳ hiện tại"
 *                     total_paid_all_time:
 *                       type: number
 *                       description: "Tổng đã thanh toán từ trước đến nay"
 *                     current_remaining_debt:
 *                       type: number
 *                       description: "Nợ còn lại sau khi trừ tiền đã trả"
 *                     payments:
 *                       type: array
 *                       description: "Lịch sử các lần thanh toán"
 *                       items:
 *                         type: object
 */
router.get(
  '/apartments/:apt_id/financial-summary',
  getApartmentFinancialSummary
);

/**
 * @swagger
 * /api/payments/building-summary:
 *   get:
 *     summary: Thống kê tài chính tổng quan toàn tòa nhà
 *     tags: [Payments & Financial]
 *     responses:
 *       200:
 *         description: Tổng hợp tài chính toàn tòa dựa trên hóa đơn hiện tại và lịch sử thanh toán
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_income:
 *                       type: number
 *                       description: "Tổng tiền đã thu từ trước đến nay"
 *                     total_due_current:
 *                       type: number
 *                       description: "Tổng phải thu kỳ hiện tại (bao gồm nợ cũ)"
 *                     total_pre_debt:
 *                       type: number
 *                       description: "Tổng nợ cũ toàn tòa"
 *                     apartments_in_debt:
 *                       type: integer
 *                       description: "Số căn hộ đang có nợ"
 *                     total_apartments:
 *                       type: integer
 *                     debt_ratio:
 *                       type: string
 *                       example: "15.5%"
 */
router.get('/building-summary', getBuildingFinancialSummary);

/**
 * @swagger
 * /api/payments/income-by-period:
 *   get:
 *     summary: Thống kê thu chi theo khoảng thời gian (cho chart)
 *     tags: [Payments & Financial]
 *     parameters:
 *       - in: query
 *         name: start_period
 *         required: true
 *         schema:
 *           type: string
 *           example: "2024-01"
 *       - in: query
 *         name: end_period
 *         required: true
 *         schema:
 *           type: string
 *           example: "2024-12"
 *     responses:
 *       200:
 *         description: Dữ liệu thu chi theo từng tháng trong khoảng thời gian
 */
router.get('/income-by-period', getIncomeByPeriod);

/**
 * @swagger
 * /api/payments/fee-breakdown:
 *   get:
 *     summary: Phân tích chi tiết các loại phí
 *     tags: [Payments & Financial]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           example: "2024-12"
 *         description: Nếu không truyền sẽ lấy tổng hợp tất cả
 *     responses:
 *       200:
 *         description: Tổng hợp các loại phí (điện, nước, dịch vụ, xe)
 */
router.get('/fee-breakdown', getFeeBreakdown);

/**
 * @swagger
 * /api/payments/compare-periods:
 *   get:
 *     summary: So sánh tài chính giữa 2 kỳ
 *     tags: [Payments & Financial]
 *     parameters:
 *       - in: query
 *         name: period1
 *         required: true
 *         schema:
 *           type: string
 *           example: "2024-11"
 *       - in: query
 *         name: period2
 *         required: true
 *         schema:
 *           type: string
 *           example: "2024-12"
 *     responses:
 *       200:
 *         description: So sánh dữ liệu và % thay đổi
 */
router.get('/compare-periods', comparePeriodsFinancial);

/**
 * @swagger
 * /api/payments/collection-rate:
 *   get:
 *     summary: Tỷ lệ thu theo thời gian
 *     tags: [Payments & Financial]
 *     parameters:
 *       - in: query
 *         name: start_period
 *         required: true
 *         schema:
 *           type: string
 *           example: "2024-01"
 *       - in: query
 *         name: end_period
 *         required: true
 *         schema:
 *           type: string
 *           example: "2024-12"
 *     responses:
 *       200:
 *         description: Tỷ lệ thu (%) theo từng tháng
 */
router.get('/collection-rate', getCollectionRateByPeriod);

/**
 * @swagger
 * /api/payments/period-summary/:period:
 *   get:
 *     summary: Tổng hợp chi tiết một kỳ cụ thể
 *     tags: [Payments & Financial]
 *     parameters:
 *       - in: path
 *         name: period
 *         required: true
 *         schema:
 *           type: string
 *           example: "2024-12"
 *     responses:
 *       200:
 *         description: Thông tin chi tiết tài chính của kỳ
 */
router.get('/period-summary/:period', getPeriodSummary);

module.exports = router;