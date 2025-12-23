const express = require("express");
const router = express.Router();
const { NotificationController } = require("../controllers/notificationController");
const { verifyToken } = require("../middleware/auth");

const controller = new NotificationController();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management APIs
 */

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a notification for a specific user
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *               - title
 *               - message
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               type:
 *                 type: string
 *                 enum: [info, success, warning, error, announcement]
 *               title:
 *                 type: string
 *                 example: "Thanh toán thành công"
 *               message:
 *                 type: string
 *                 example: "Bạn đã thanh toán phí quản lý"
 *               link:
 *                 type: string
 *                 example: "/payments"
 *               metadata:
 *                 type: object
 *                 example: { amount: 1000000 }
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post("/", controller.createNotification.bind(controller));

/**
 * @swagger
 * /api/notifications/bulk:
 *   post:
 *     summary: Create notifications for multiple users
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *               - type
 *               - title
 *               - message
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               type:
 *                 type: string
 *                 enum: [info, success, warning, error, announcement]
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               link:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Notifications created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/bulk", controller.createBulkNotifications.bind(controller));

/**
 * @swagger
 * /api/notifications/role:
 *   post:
 *     summary: Create notification for all users with a specific role
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *               - type
 *               - title
 *               - message
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, manager, user]
 *               type:
 *                 type: string
 *                 enum: [info, success, warning, error, announcement]
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               link:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Notifications sent successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: No users found with that role
 *       500:
 *         description: Server error
 */
router.post("/role", controller.createNotificationForRole.bind(controller));

/**
 * @swagger
 * /api/notifications/announcement:
 *   post:
 *     summary: Create announcement for all users
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - message
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [info, success, warning, error, announcement]
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               link:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Announcement sent to all users
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/announcement", controller.createAnnouncementForAll.bind(controller));

/**
 * @swagger
 * /api/notifications/user/{userId}:
 *   get:
 *     summary: Get user's notifications
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Server error
 */
router.get("/user/:userId", controller.getUserNotifications.bind(controller));

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       400:
 *         description: Invalid notification ID
 *       500:
 *         description: Server error
 */
router.patch("/:notificationId/read", controller.markAsRead.bind(controller));

/**
 * @swagger
 * /api/notifications/{notificationId}:
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       400:
 *         description: Invalid notification ID
 *       500:
 *         description: Server error
 */
router.delete("/:notificationId", controller.deleteNotification.bind(controller));

module.exports = router;
